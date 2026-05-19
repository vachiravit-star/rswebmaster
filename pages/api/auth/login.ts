import type { NextApiRequest, NextApiResponse } from 'next'
import { checkCredentials, setAuthCookie } from '../../../lib/auth'
import { readData } from '../../../lib/data'

interface SubAdmin {
  id: string
  username: string
  password: string
  displayName: string
  allowedPages: string[]
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' })
  }

  if (checkCredentials(username, password)) {
    setAuthCookie(res, 'authenticated')
    return res.status(200).json({ ok: true, role: 'super' })
  }

  const subAdmins = readData<SubAdmin[]>('subadmins.json', [])
  const sub = subAdmins.find((s) => s.username === username && s.password === password)
  if (sub) {
    setAuthCookie(res, `sub:${sub.username}`)
    return res.status(200).json({ ok: true, role: 'sub', allowedPages: sub.allowedPages })
  }

  return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
}
