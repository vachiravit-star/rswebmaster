import type { NextApiRequest, NextApiResponse } from 'next'
import { isAuthenticated } from '../../../lib/auth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ authenticated: isAuthenticated(req) })
}
