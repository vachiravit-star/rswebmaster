import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { fileId } = req.query
  if (!fileId || typeof fileId !== 'string') {
    return res.status(400).json({ error: 'fileId required' })
  }

  try {
    const driveUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1280`
    const response = await fetch(driveUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    if (!response.ok) {
      return res.status(502).end()
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = await response.arrayBuffer()

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.status(200).send(Buffer.from(buffer))
  } catch {
    return res.status(500).end()
  }
}
