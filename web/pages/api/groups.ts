import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const groups = await prisma.group.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    res.status(200).json(groups);
  } catch (e:any) {
    res.status(500).json({ error: 'Failed to fetch groups', details: e.message });
  }
}
