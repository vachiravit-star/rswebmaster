import type { NextApiRequest, NextApiResponse } from 'next'

function extractFolderId(link: string): string | null {
  const match = link.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { folderId: rawId, link } = req.query

  let folderId: string | null = null
  if (rawId && typeof rawId === 'string') {
    folderId = rawId
  } else if (link && typeof link === 'string') {
    folderId = extractFolderId(link)
  }

  if (!folderId) {
    return res.status(400).json({ error: 'folderId or link required' })
  }

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'GOOGLE_DRIVE_API_KEY not configured in .env.local' })
  }

  try {
    const url = new URL('https://www.googleapis.com/drive/v3/files')
    url.searchParams.set('q', `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`)
    url.searchParams.set('key', apiKey)
    url.searchParams.set('orderBy', 'name')
    url.searchParams.set('pageSize', '1')
    url.searchParams.set('fields', 'files(id,name)')

    const response = await fetch(url.toString())
    const data = await response.json()

    if (!response.ok) {
      return res.status(502).json({ error: data.error?.message || 'Drive API error' })
    }

    if (!data.files || data.files.length === 0) {
      return res.status(404).json({ error: 'No images found in folder' })
    }

    const fileId = data.files[0].id
    const thumbnailUrl = `/api/drive/image?fileId=${fileId}`

    return res.status(200).json({ thumbnailUrl, fileId, name: data.files[0].name })
  } catch {
    return res.status(500).json({ error: 'Failed to fetch from Drive API' })
  }
}
