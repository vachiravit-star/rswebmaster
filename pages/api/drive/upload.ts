import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { isAuthenticated } from '../../../lib/auth'

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
}

async function getServiceAccountToken(): Promise<string | null> {
  const email = process.env.GOOGLE_SA_EMAIL
  const rawKey = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!email || !rawKey) return null

  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/drive',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  ).toString('base64url')

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
  return (data.access_token as string) || null
}

async function uploadToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folderId: string,
  accessToken: string
): Promise<string> {
  const metadata = JSON.stringify({ name: filename, parents: [folderId] })
  const boundary = 'drive_upload_boundary_newsletter'

  const preamble = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    metadata,
    `--${boundary}`,
    `Content-Type: ${mimeType}`,
    '',
    '',
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
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: bodyBuffer,
    }
  )

  if (!uploadRes.ok) {
    const err = await uploadRes.json()
    const msg = (err.error?.message as string) || 'Drive upload failed'
    console.error('[drive/upload] API error:', uploadRes.status, JSON.stringify(err))
    throw new Error(msg)
  }

  const { id } = await uploadRes.json()

  // Make file publicly readable
  await fetch(`https://www.googleapis.com/drive/v3/files/${id}/permissions?supportsAllDrives=true`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  }).catch(() => {})

  return id as string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!isAuthenticated(req as never)) return res.status(401).json({ error: 'Unauthorized' })

  const { base64, filename, folderId } = req.body as {
    base64: string
    filename: string
    folderId?: string
  }

  if (!base64 || !filename) return res.status(400).json({ error: 'Missing base64 or filename' })

  const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
  if (!matches) return res.status(400).json({ error: 'Invalid base64 format' })

  const mimeType = matches[1]
  const buffer = Buffer.from(matches[2], 'base64')
  const ext = path.extname(filename).toLowerCase() || '.jpg'
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf']
  const safeExt = allowedExts.includes(ext) ? ext : '.jpg'
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${safeExt}`

  // Try Google Drive upload
  const targetFolderId = folderId || process.env.NEWSLETTER_DRIVE_FOLDER_ID
  if (targetFolderId) {
    try {
      const token = await getServiceAccountToken()
      if (token) {
        const fileId = await uploadToDrive(buffer, uniqueName, mimeType, targetFolderId, token)
        return res.status(200).json({
          url: `/api/drive/image?fileId=${fileId}`,
          driveFileId: fileId,
          storage: 'drive',
        })
      }
    } catch (e) {
      console.error('[drive/upload] Drive upload failed, falling back to local:', e)
    }
  }

  // Fallback: Vercel Blob (production) or local (dev)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob')
      const blob = await put(`uploads/newsletter/${uniqueName}`, buffer, {
        access: 'public',
        contentType: mimeType,
      })
      return res.status(200).json({ url: blob.url, driveFileId: '', storage: 'blob' })
    } catch (e) {
      console.error('[drive/upload] Vercel Blob failed:', e)
    }
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'newsletter')
  fs.mkdirSync(uploadDir, { recursive: true })
  fs.writeFileSync(path.join(uploadDir, uniqueName), buffer)
  return res.status(200).json({
    url: `/uploads/newsletter/${uniqueName}`,
    driveFileId: '',
    storage: 'local',
  })
}
