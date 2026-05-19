import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')

export function readData<T>(filename: string, fallback: T): T {
  const filePath = path.join(dataDir, filename)
  if (!fs.existsSync(filePath)) return fallback
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as T
  } catch {
    return fallback
  }
}

export function writeData<T>(filename: string, data: T): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
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
