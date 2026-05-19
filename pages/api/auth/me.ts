import type { NextApiRequest, NextApiResponse } from 'next'
import { isAuthenticated, isSuperAdmin, getSessionUsername } from '../../../lib/auth'
import { readData } from '../../../lib/data'

interface SubAdmin {
  id: string
  username: string
  password: string
  displayName: string
  allowedPages: string[]
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (isSuperAdmin(req)) {
    return res.status(200).json({ role: 'super', username: getSessionUsername(req), allowedPages: [] })
  }

  const username = getSessionUsername(req)
  const subAdmins = readData<SubAdmin[]>('subadmins.json', [])
  const sub = subAdmins.find((s) => s.username === username)
  if (!sub) return res.status(401).json({ error: 'Unauthorized' })

  return res.status(200).json({
    role: 'sub',
    username: sub.username,
    displayName: sub.displayName,
    allowedPages: sub.allowedPages,
  })
}
