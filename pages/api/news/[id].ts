import type { NextApiRequest, NextApiResponse } from 'next'
import { readData, writeData, slugify } from '../../../lib/data'
import { isAuthenticated } from '../../../lib/auth'

interface NewsItem {
  id: string
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  image: string
  publishedAt: string
  createdAt: string
  published: boolean
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string }
  const news = readData<NewsItem[]>('news.json', [])
  const idx = news.findIndex((n) => n.id === id)

  if (req.method === 'GET') {
    if (idx === -1) return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    return res.status(200).json(news[idx])
  }

  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'PUT') {
    if (idx === -1) return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    const updated = {
      ...news[idx],
      ...req.body,
      id,
      slug: req.body.title !== news[idx].title
        ? slugify(req.body.title) || news[idx].slug
        : news[idx].slug,
    }
    news[idx] = updated
    writeData('news.json', news)
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    if (idx === -1) return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    const deleted = news.splice(idx, 1)[0]
    writeData('news.json', news)
    return res.status(200).json(deleted)
  }

  res.status(405).end()
}
