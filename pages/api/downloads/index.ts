import type { NextApiRequest, NextApiResponse } from 'next'
import { readData, writeData, generateId } from '../../../lib/data'
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const downloads = await readData<Download[]>('downloads.json', [])

  if (req.method === 'GET') {
    const { category } = req.query
    const filtered = category
      ? downloads.filter((d) => d.category === category)
      : downloads
    return res.status(200).json(filtered)
  }

  if (req.method === 'POST') {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })
    const { title, category, description, fileUrl, fileType, fileSize } = req.body
    if (!title || !fileUrl) return res.status(400).json({ error: 'ข้อมูลไม่ครบ' })

    const item: Download = {
      id: generateId(),
      title,
      category: category || 'student',
      description: description || '',
      fileUrl,
      fileType: fileType || 'PDF',
      fileSize: fileSize || '',
      createdAt: new Date().toISOString(),
    }
    await writeData('downloads.json', [item, ...downloads])
    return res.status(201).json(item)
  }

  res.status(405).end()
}
