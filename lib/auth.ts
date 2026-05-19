import type { NextApiRequest, NextApiResponse } from 'next'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'rachasima2024'

export function checkCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export function setAuthCookie(res: NextApiResponse, value = 'authenticated'): void {
  const maxAge = 60 * 60 * 24
  res.setHeader(
    'Set-Cookie',
    `admin_session=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
  )
}

export function clearAuthCookie(res: NextApiResponse): void {
  res.setHeader(
    'Set-Cookie',
    'admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
  )
}

function getSessionValue(req: NextApiRequest): string {
  const raw = req.cookies?.admin_session ?? ''
  try { return decodeURIComponent(raw) } catch { return raw }
}

export function isAuthenticated(req: NextApiRequest): boolean {
  const v = getSessionValue(req)
  return v === 'authenticated' || v.startsWith('sub:')
}

export function isSuperAdmin(req: NextApiRequest): boolean {
  return getSessionValue(req) === 'authenticated'
}

export function getSessionUsername(req: NextApiRequest): string | null {
  const v = getSessionValue(req)
  if (v === 'authenticated') return ADMIN_USERNAME
  if (v.startsWith('sub:')) return v.slice(4)
  return null
}

export function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: () => void | Promise<void>
): void | Promise<void> {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  return handler()
}

interface SubAdmin { id: string; username: string; password: string; allowedPages: string[] }

export function checkPageAccess(req: NextApiRequest, pageKey: string): { redirect: { destination: string; permanent: false } } | null {
  if (!isAuthenticated(req)) {
    return { redirect: { destination: '/admin/login', permanent: false } }
  }
  if (isSuperAdmin(req)) return null
  const username = getSessionUsername(req)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readData } = require('./data') as { readData: <T>(f: string, fb: T) => T }
  const subs = readData<SubAdmin[]>('subadmins.json', [])
  const sub = subs.find((s) => s.username === username)
  if (!sub || !sub.allowedPages.includes(pageKey)) {
    return { redirect: { destination: '/admin', permanent: false } }
  }
  return null
}
