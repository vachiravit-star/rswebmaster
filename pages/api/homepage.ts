import type { NextApiRequest, NextApiResponse } from 'next'
import { readData, writeData } from '../../lib/data'
import { isAuthenticated } from '../../lib/auth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(readData('homepage.json', {
      banner: { enabled: false, image: '', title: '', subtitle: '', description: '', buttonText: '', buttonLink: '' },
    }))
  }

  if (req.method === 'PUT') {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })
    writeData('homepage.json', req.body)
    return res.status(200).json(req.body)
  }

  res.status(405).end()
}
