import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')

// In-memory URL cache per serverless instance
const urlCache: Record<string, string | null> = {}

async function resolveBlobUrl(filename: string): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null
  if (filename in urlCache) return urlCache[filename]
  try {
    const { list } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: `data/${filename}` })
    const blob = blobs.find((b) => b.pathname === `data/${filename}`)
    urlCache[filename] = blob?.url ?? null
  } catch {
    urlCache[filename] = null
  }
  return urlCache[filename]
}

export async function readData<T>(filename: string, fallback: T): Promise<T> {
  const blobUrl = await resolveBlobUrl(filename)
  if (blobUrl) {
    try {
      const res = await fetch(blobUrl, { cache: 'no-store' })
      if (res.ok) return (await res.json()) as T
    } catch {}
  }
  const filePath = path.join(dataDir, filename)
  if (!fs.existsSync(filePath)) return fallback
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
  } catch {
    return fallback
  }
}

export async function writeData<T>(filename: string, data: T): Promise<void> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob')
    const result = await put(`data/${filename}`, JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    })
    urlCache[filename] = result.url
    return
  }
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  const filePath = path.join(dataDir, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function slugify(text: string): string {
  return text
    .replace(/[^฀-๿a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase() || Date.now().toString(36)
}
