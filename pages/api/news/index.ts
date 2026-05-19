import type { NextApiRequest, NextApiResponse } from 'next'
import { readData, writeData, generateId, slugify } from '../../../lib/data'
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
  const news = readData<NewsItem[]>('news.json', [])

  if (req.method === 'GET') {
    const { category, published } = req.query
    let filtered = news
    if (category) filtered = filtered.filter((n) => n.category === category)
    if (published !== 'all') filtered = filtered.filter((n) => n.published)
    filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    return res.status(200).json(filtered)
  }

  if (req.method === 'POST') {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })

    const { title, category, excerpt, content, image, publishedAt, published } = req.body
    if (!title || !category) return res.status(400).json({ error: 'ข้อมูลไม่ครบ' })

    const id = generateId()
    const slug = slugify(title) || id
    const uniqueSlug = news.some((n) => n.slug === slug) ? `${slug}-${id.slice(-4)}` : slug

    const item: NewsItem = {
      id,
      title,
      slug: uniqueSlug,
      category,
      excerpt: excerpt || title,
      content: content || '',
      image: image || '',
      publishedAt: publishedAt || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      published: published !== false,
    }
    writeData('news.json', [item, ...news])
    return res.status(201).json(item)
  }

  res.status(405).end()
}
