import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Filtering placeholders
  const {
    difficulty,
    rideType,
    organizerType,
    dateFrom,
    dateTo,
    status,
  } = req.query;

  // Build where clause
  const where: any = {};
  if (difficulty) where.difficulty = difficulty;
  if (rideType) where.rideType = rideType;
  if (organizerType) where.organizerType = organizerType;
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.startDateTimeUtc = {};
    if (dateFrom) where.startDateTimeUtc.gte = new Date(dateFrom as string);
    if (dateTo) where.startDateTimeUtc.lte = new Date(dateTo as string);
  }

  try {
    const rides = await prisma.ride.findMany({
      where,
      orderBy: { startDateTimeUtc: 'asc' },
      include: { group: true },
    });
    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rides', details: error });
  }
}
