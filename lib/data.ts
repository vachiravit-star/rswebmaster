import fs from 'fs'
import path from 'path'
import {
  getServiceAccountToken,
  getOrCreateFolder,
  findFileId,
  readDriveFile,
  writeDriveFile,
} from './drive'

const dataDir = path.join(process.cwd(), 'data')

// ---- Drive data folder ----

let driveDataFolderId: string | null = null

async function getDriveDataFolder(token: string): Promise<string | null> {
  const rootId = process.env.DRIVE_FOLDER_ID
  if (!rootId) return null
  if (driveDataFolderId) return driveDataFolderId
  driveDataFolderId = await getOrCreateFolder('data', rootId, token)
  return driveDataFolderId
}

// ---- Vercel Blob fallback ----

const blobUrlCache: Record<string, string | null> = {}

async function resolveBlobUrl(filename: string): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null
  if (filename in blobUrlCache) return blobUrlCache[filename]
  try {
    const { list } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: `data/${filename}` })
    const blob = blobs.find((b) => b.pathname === `data/${filename}`)
    blobUrlCache[filename] = blob?.url ?? null
  } catch {
    blobUrlCache[filename] = null
  }
  return blobUrlCache[filename]
}

// ---- Public API ----

export async function readData<T>(filename: string, fallback: T): Promise<T> {
  // Priority 1: Google Drive
  const token = await getServiceAccountToken()
  if (token && process.env.DRIVE_FOLDER_ID) {
    try {
      const folderId = await getDriveDataFolder(token)
      if (folderId) {
        const fileId = await findFileId(filename, folderId, token)
        if (fileId) {
          const content = await readDriveFile(fileId, token)
          return JSON.parse(content) as T
        }
      }
    } catch (e) {
      console.error(`[data] Drive read error for ${filename}:`, e)
    }
  }

  // Priority 2: Vercel Blob
  const blobUrl = await resolveBlobUrl(filename)
  if (blobUrl) {
    try {
      const res = await fetch(blobUrl, { cache: 'no-store' })
      if (res.ok) return (await res.json()) as T
    } catch {}
  }

  // Priority 3: Local files (dev / initial seed data)
  const filePath = path.join(dataDir, filename)
  if (!fs.existsSync(filePath)) return fallback
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
  } catch {
    return fallback
  }
}

export async function writeData<T>(filename: string, data: T): Promise<void> {
  // Priority 1: Google Drive
  const token = await getServiceAccountToken()
  if (token && process.env.DRIVE_FOLDER_ID) {
    try {
      const folderId = await getDriveDataFolder(token)
      if (folderId) {
        await writeDriveFile(filename, folderId, JSON.stringify(data, null, 2), 'application/json', token)
        return
      }
    } catch (e) {
      console.error(`[data] Drive write error for ${filename}:`, e)
    }
  }

  // Priority 2: Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob')
    const result = await put(`data/${filename}`, JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    })
    blobUrlCache[filename] = result.url
    return
  }

  // Priority 3: Local files
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  fs.writeFileSync(path.join(dataDir, filename), JSON.stringify(data, null, 2), 'utf-8')
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
