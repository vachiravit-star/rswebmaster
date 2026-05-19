import crypto from 'crypto'

// ---- Service Account Token (cached per serverless instance) ----

let cachedToken: { value: string; expiresAt: number } | null = null

export async function getServiceAccountToken(): Promise<string | null> {
  const email = process.env.GOOGLE_SA_EMAIL
  const rawKey = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!email || !rawKey) return null

  if (cachedToken && cachedToken.expiresAt > Date.now() + 300_000) {
    return cachedToken.value
  }

  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).toString('base64url')

  const signingInput = `${header}.${payload}`
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(signingInput)
  const signature = sign.sign(rawKey, 'base64url')

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${signingInput}.${signature}`,
    }),
  })
  const data = await tokenRes.json()
  const token = data.access_token as string | undefined
  if (!token) return null

  cachedToken = { value: token, expiresAt: Date.now() + 3_600_000 }
  return token
}

// ---- Folder cache ----

const folderIdCache: Record<string, string> = {}

export async function getOrCreateFolder(name: string, parentId: string, token: string): Promise<string> {
  const cacheKey = `${parentId}/${name}`
  if (folderIdCache[cacheKey]) return folderIdCache[cacheKey]

  const query = encodeURIComponent(
    `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
  )
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const { files } = await searchRes.json()
  if (files?.length > 0) {
    folderIdCache[cacheKey] = files[0].id as string
    return folderIdCache[cacheKey]
  }

  const createRes = await fetch(
    'https://www.googleapis.com/drive/v3/files?supportsAllDrives=true',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parents: [parentId], mimeType: 'application/vnd.google-apps.folder' }),
    }
  )
  const { id } = await createRes.json()
  folderIdCache[cacheKey] = id as string
  return folderIdCache[cacheKey]
}

// ---- File ID cache ----

const fileIdCache: Record<string, string | null> = {}

export async function findFileId(filename: string, folderId: string, token: string): Promise<string | null> {
  const cacheKey = `${folderId}/${filename}`
  if (cacheKey in fileIdCache) return fileIdCache[cacheKey]

  const query = encodeURIComponent(
    `name='${filename}' and '${folderId}' in parents and trashed=false`
  )
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const { files } = await res.json()
  const id = files?.length > 0 ? (files[0].id as string) : null
  fileIdCache[cacheKey] = id
  return id
}

export async function readDriveFile(fileId: string, token: string): Promise<string> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.text()
}

export async function writeDriveFile(
  filename: string,
  folderId: string,
  content: string,
  mimeType: string,
  token: string
): Promise<string> {
  const existingId = await findFileId(filename, folderId, token)
  const body = Buffer.from(content, 'utf-8')

  if (existingId) {
    await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media&supportsAllDrives=true`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': mimeType,
        },
        body,
      }
    )
    fileIdCache[`${folderId}/${filename}`] = existingId
    return existingId
  }

  const metadata = JSON.stringify({ name: filename, parents: [folderId] })
  const boundary = 'drive_boundary_data'
  const preamble = [
    `--${boundary}`, 'Content-Type: application/json; charset=UTF-8', '', metadata,
    `--${boundary}`, `Content-Type: ${mimeType}`, '', '',
  ].join('\r\n')
  const bodyBuffer = Buffer.concat([
    Buffer.from(preamble, 'utf-8'),
    body,
    Buffer.from(`\r\n--${boundary}--`, 'utf-8'),
  ])

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id&supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: bodyBuffer,
    }
  )
  const { id } = await res.json()
  fileIdCache[`${folderId}/${filename}`] = id as string
  return id as string
}

// ---- Image upload ----

export async function uploadImageToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folderId: string,
  token: string
): Promise<{ fileId: string; url: string }> {
  const metadata = JSON.stringify({ name: filename, parents: [folderId] })
  const boundary = 'drive_boundary_image'
  const preamble = [
    `--${boundary}`, 'Content-Type: application/json; charset=UTF-8', '', metadata,
    `--${boundary}`, `Content-Type: ${mimeType}`, '', '',
  ].join('\r\n')
  const bodyBuffer = Buffer.concat([
    Buffer.from(preamble, 'utf-8'),
    buffer,
    Buffer.from(`\r\n--${boundary}--`, 'utf-8'),
  ])

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id&supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: bodyBuffer,
    }
  )
  if (!uploadRes.ok) {
    const err = await uploadRes.json()
    throw new Error((err.error?.message as string) || 'Drive upload failed')
  }
  const { id } = await uploadRes.json()

  await fetch(`https://www.googleapis.com/drive/v3/files/${id}/permissions?supportsAllDrives=true`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  }).catch(() => {})

  return { fileId: id as string, url: `/api/drive/image?fileId=${id}` }
}
