import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { isAuthenticated } from '../../lib/auth'

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })

  const { base64, filename, folder = 'news' } = req.body

  if (!base64 || !filename) return res.status(400).json({ error: 'Missing base64 or filename' })

  const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) return res.status(400).json({ error: 'Invalid base64 format' })

  const allowedFolders = ['news', 'management', 'homepage', 'gallery', 'hero']
  const safeFolder = allowedFolders.includes(folder) ? folder : 'news'
  const buffer = Buffer.from(matches[2], 'base64')
  const ext = path.extname(filename).toLowerCase() || '.jpg'
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  const safeExt = allowedExts.includes(ext) ? ext : '.jpg'
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${safeExt}`

  // Try Vercel Blob if token is set (production on Vercel)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob')
      const blob = await put(`uploads/${safeFolder}/${uniqueName}`, buffer, {
        access: 'public',
        contentType: matches[1],
      })
      return res.status(200).json({ url: blob.url })
    } catch (e) {
      console.error('[uploads] Vercel Blob failed:', e)
    }
  }

  // Fallback: local storage (dev)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolder)
  fs.mkdirSync(uploadDir, { recursive: true })
  fs.writeFileSync(path.join(uploadDir, uniqueName), buffer)
  return res.status(200).json({ url: `/uploads/${safeFolder}/${uniqueName}` })
}
