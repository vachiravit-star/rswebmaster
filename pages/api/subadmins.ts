import type { NextApiRequest, NextApiResponse } from 'next'
import { isSuperAdmin } from '../../lib/auth'
import { readData, writeData, generateId } from '../../lib/data'

interface SubAdmin {
  id: string
  username: string
  password: string
  displayName: string
  allowedPages: string[]
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isSuperAdmin(req)) return res.status(403).json({ error: 'Forbidden' })

  const admins = readData<SubAdmin[]>('subadmins.json', [])

  if (req.method === 'GET') {
    const safe = admins.map(({ password: _p, ...rest }) => rest)
    return res.status(200).json(safe)
  }

  if (req.method === 'POST') {
    const { username, password, displayName, allowedPages } = req.body
    if (!username || !password || !displayName) {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบ' })
    }
    if (admins.some((a) => a.username === username)) {
      return res.status(409).json({ error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' })
    }
    const item: SubAdmin = {
      id: generateId(),
      username,
      password,
      displayName,
      allowedPages: allowedPages ?? [],
    }
    writeData('subadmins.json', [...admins, item])
    const { password: _p, ...safe } = item
    return res.status(201).json(safe)
  }

  if (req.method === 'PUT') {
    const { id, username, password, displayName, allowedPages } = req.body
    const idx = admins.findIndex((a) => a.id === id)
    if (idx === -1) return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    admins[idx] = {
      ...admins[idx],
      ...(username && { username }),
      ...(password && { password }),
      ...(displayName && { displayName }),
      ...(allowedPages !== undefined && { allowedPages }),
    }
    writeData('subadmins.json', admins)
    const { password: _p, ...safe } = admins[idx]
    return res.status(200).json(safe)
  }

  if (req.method === 'DELETE') {
    const { id } = req.body
    const filtered = admins.filter((a) => a.id !== id)
    if (filtered.length === admins.length) return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    writeData('subadmins.json', filtered)
    return res.status(200).json({ ok: true })
  }

  res.status(405).end()
}
