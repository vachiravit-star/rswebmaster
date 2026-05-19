import type { NextApiRequest, NextApiResponse } from 'next'
import { readData, writeData } from '../../lib/data'
import { isAuthenticated } from '../../lib/auth'

interface SchoolInfo {
  logoUrl: string
  nameTh: string
  nameEn: string
  address: string
  phone: string
  fax: string
  email: string
  website: string
  facebook: string
  vision: string
  mission: string
}

interface Settings {
  heroSlides: unknown[]
  schoolInfo: SchoolInfo
}

const DEFAULT_INFO: SchoolInfo = {
  logoUrl: '', nameTh: '', nameEn: '', address: '', phone: '',
  fax: '', email: '', website: '', facebook: '', vision: '', mission: '',
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const s = await readData<Settings>('settings.json', { heroSlides: [], schoolInfo: DEFAULT_INFO })
    return res.status(200).json(s.schoolInfo ?? DEFAULT_INFO)
  }
  if (req.method === 'PUT') {
    if (!isAuthenticated(req as never)) return res.status(401).json({ error: 'Unauthorized' })
    const s = await readData<Settings>('settings.json', { heroSlides: [], schoolInfo: DEFAULT_INFO })
    await writeData('settings.json', { ...s, schoolInfo: req.body })
    return res.status(200).json({ ok: true })
  }
  res.status(405).end()
}
