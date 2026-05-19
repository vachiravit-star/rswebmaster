import type { NextApiRequest, NextApiResponse } from 'next'
import { readData, writeData } from '../../lib/data'
import { isAuthenticated } from '../../lib/auth'

interface ThemePalette { [shade: string]: string }
interface ThemeData { palette: ThemePalette }

const DEFAULT: ThemeData = {
  palette: {
    '50': '#FFF2EB', '100': '#FFDECC', '200': '#FFB68F', '300': '#FF8E52',
    '400': '#FF6A1A', '500': '#E65100', '600': '#BD4200', '700': '#943400',
    '800': '#6B2500', '900': '#471900',
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(await readData<ThemeData>('theme.json', DEFAULT))
  }
  if (req.method === 'PUT') {
    if (!isAuthenticated(req as never)) return res.status(401).json({ error: 'Unauthorized' })
    await writeData('theme.json', req.body)
    return res.status(200).json({ ok: true })
  }
  res.status(405).end()
}
