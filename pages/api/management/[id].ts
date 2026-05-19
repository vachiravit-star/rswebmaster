import type { NextApiRequest, NextApiResponse } from 'next'
import { readData, writeData } from '../../../lib/data'
import { isAuthenticated } from '../../../lib/auth'
import type { ManagementMember } from './index'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string }
  const members = readData<ManagementMember[]>('management.json', [])
  const idx = members.findIndex((m) => m.id === id)

  if (req.method === 'GET') {
    if (idx === -1) return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    return res.status(200).json(members[idx])
  }

  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'PUT') {
    if (idx === -1) return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    members[idx] = { ...members[idx], ...req.body, id }
    writeData('management.json', members)
    return res.status(200).json(members[idx])
  }

  if (req.method === 'DELETE') {
    if (idx === -1) return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    const deleted = members.splice(idx, 1)[0]
    writeData('management.json', members)
    return res.status(200).json(deleted)
  }

  res.status(405).end()
}
