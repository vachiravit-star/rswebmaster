import type { NextApiRequest, NextApiResponse } from 'next'
import { readData, writeData, generateId } from '../../../lib/data'
import { isAuthenticated } from '../../../lib/auth'

export interface ManagementMember {
  id: string
  title: string
  name: string
  dept: string
  order: number
  photo: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const members = await readData<ManagementMember[]>('management.json', [])

  if (req.method === 'GET') {
    return res.status(200).json(members.sort((a, b) => a.order - b.order))
  }

  if (req.method === 'POST') {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })
    const { title, name, dept, order, photo } = req.body
    if (!title || !name) return res.status(400).json({ error: 'ข้อมูลไม่ครบ' })

    const member: ManagementMember = {
      id: generateId(),
      title,
      name,
      dept: dept || '',
      order: order ?? members.length + 1,
      photo: photo || '',
    }
    await writeData('management.json', [...members, member])
    return res.status(201).json(member)
  }

  res.status(405).end()
}
