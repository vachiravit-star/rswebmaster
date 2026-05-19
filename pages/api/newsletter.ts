import type { NextApiRequest, NextApiResponse } from 'next'
import { readData, writeData } from '../../lib/data'
import { isAuthenticated } from '../../lib/auth'

export interface NewsletterItem {
  id: string
  title: string
  image: string
  driveFileId: string
  order: number
  publishedAt: string
}

export interface NewsletterConfig {
  enabled: boolean
  title: string
  driveFolderId: string
  items: NewsletterItem[]
}

const DEFAULT: NewsletterConfig = {
  enabled: true,
  title: 'จดหมายข่าว',
  driveFolderId: '',
  items: [],
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(readData<NewsletterConfig>('newsletter.json', DEFAULT))
  }
  if (req.method === 'PUT') {
    if (!isAuthenticated(req as never)) return res.status(401).json({ error: 'Unauthorized' })
    writeData('newsletter.json', req.body)
    return res.status(200).json({ ok: true })
  }
  res.status(405).end()
}
