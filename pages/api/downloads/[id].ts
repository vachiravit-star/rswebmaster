import type { NextApiRequest, NextApiResponse } from 'next'
import { readData, writeData } from '../../../lib/data'
import { isAuthenticated } from '../../../lib/auth'

interface Download {
  id: string
  title: string
  category: string
  description: string
  fileUrl: string
  fileType: string
  fileSize: string
  createdAt: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string }
  const downloads = readData<Download[]>('downloads.json', [])
  const idx = downloads.findIndex((d) => d.id === id)

  if (req.method === 'GET') {
    if (idx === -1) return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    return res.status(200).json(downloads[idx])
  }

  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'PUT') {
    if (idx === -1) return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    downloads[idx] = { ...downloads[idx], ...req.body, id }
    writeData('downloads.json', downloads)
    return res.status(200).json(downloads[idx])
  }

  if (req.method === 'DELETE') {
    if (idx === -1) return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    const deleted = downloads.splice(idx, 1)[0]
    writeData('downloads.json', downloads)
    return res.status(200).json(deleted)
  }

  res.status(405).end()
}
