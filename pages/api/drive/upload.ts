import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { isAuthenticated } from '../../../lib/auth'
import { getServiceAccountToken, getOrCreateFolder, uploadImageToDrive } from '../../../lib/drive'

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
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

  // Priority 1: explicit folderId from request OR DRIVE_FOLDER_ID/newsletter subfolder
  const token = await getServiceAccountToken()
  if (token) {
    let targetFolderId = folderId || process.env.NEWSLETTER_DRIVE_FOLDER_ID
    if (!targetFolderId && process.env.DRIVE_FOLDER_ID) {
      const uploadsFolder = await getOrCreateFolder('uploads', process.env.DRIVE_FOLDER_ID, token)
      targetFolderId = await getOrCreateFolder('newsletter', uploadsFolder, token)
    }
    if (targetFolderId) {
      try {
        const { fileId, url } = await uploadImageToDrive(buffer, uniqueName, mimeType, targetFolderId, token)
        return res.status(200).json({ url, driveFileId: fileId, storage: 'drive' })
      } catch (e) {
        console.error('[drive/upload] Drive upload failed, falling back:', e)
      }
    }
  }

  // Priority 2: Vercel Blob
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

  // Priority 3: Local storage (dev)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'newsletter')
  fs.mkdirSync(uploadDir, { recursive: true })
  fs.writeFileSync(path.join(uploadDir, uniqueName), buffer)
  return res.status(200).json({ url: `/uploads/newsletter/${uniqueName}`, driveFileId: '', storage: 'local' })
}
