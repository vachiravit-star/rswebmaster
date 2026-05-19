import type { NextApiRequest, NextApiResponse } from 'next'
import { readData, writeData } from '../../lib/data'
import { isAuthenticated } from '../../lib/auth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const data = readData('quicklinks.json', [])
    return res.status(200).json(data)
  }

  if (req.method === 'PUT') {
    if (!isAuthenticated(req as never)) return res.status(401).json({ error: 'Unauthorized' })
    writeData('quicklinks.json', req.body)
    return res.status(200).json({ ok: true })
  }

  res.status(405).end()
}
