import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Allowed enum values (keep in sync with Prisma schema)
const DIFFICULTIES = new Set(['EASY', 'INTERMEDIATE', 'HARD']);
const RIDE_TYPES = new Set(['ROAD', 'MTB', 'GRAVEL']);
const ORGANIZER_TYPES = new Set(['SHOP', 'GROUP', 'INDIVIDUAL']);
const STATUSES = new Set(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

function parseBoolean(val: string | string[] | undefined): boolean | undefined {
  if (val === undefined) return undefined;
  const v = Array.isArray(val) ? val[0] : val;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    id,
    difficulty,
    rideType,
    organizerType,
    status,
    dateFrom,
    dateTo,
    limit: limitRaw,
    cursor, // cursor = ride id
    includePast,
  } = req.query;

  // Single ride shortcut
  if (id) {
    try {
      const ride = await prisma.ride.findUnique({
        where: { id: id as string },
      });
      if (!ride) return res.status(404).json({ error: 'Ride not found' });
      return res.status(200).json(ride);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch ride', details: (e as Error).message });
    }
  }

  // Validation & coercion
  let limit = 25;
  if (limitRaw) {
    const parsed = parseInt(limitRaw as string, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 100) {
      return res.status(400).json({ error: 'Invalid limit (1-100)' });
    }
    limit = parsed;
  }

  const includePastBool = parseBoolean(includePast);

  if (difficulty && !DIFFICULTIES.has(difficulty as string)) {
    return res.status(400).json({ error: 'Invalid difficulty' });
  }
  if (rideType && !RIDE_TYPES.has(rideType as string)) {
    return res.status(400).json({ error: 'Invalid rideType' });
  }
  if (organizerType && !ORGANIZER_TYPES.has(organizerType as string)) {
    return res.status(400).json({ error: 'Invalid organizerType' });
  }
  if (status && !STATUSES.has(status as string)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // Build where clause
  const where: any = {};
  if (difficulty) where.difficulty = difficulty;
  if (rideType) where.rideType = rideType;
  if (organizerType) where.organizerType = organizerType;
  if (status) where.status = status;

  // Default to upcoming published rides unless explicitly including past or non-published
  const now = new Date();
  if (!includePastBool) {
    where.startDateTimeUtc = { gte: now };
    if (!status) {
      // Only published by default
      where.status = 'PUBLISHED';
    }
  } else {
    // Add date range filtering if provided
    if (dateFrom || dateTo) {
      where.startDateTimeUtc = {};
      if (dateFrom) {
        const d = new Date(dateFrom as string);
        if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid dateFrom' });
        where.startDateTimeUtc.gte = d;
      }
      if (dateTo) {
        const d = new Date(dateTo as string);
        if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid dateTo' });
        where.startDateTimeUtc.lte = d;
      }
    }
  }

  // Pagination using cursor (id)
  const queryOptions: any = {
    where,
    orderBy: [
      { startDateTimeUtc: 'asc' },
      { id: 'asc' }, // tie-breaker for deterministic pagination
    ],
  // no relation includes; group is plain string now
    take: limit + 1, // fetch one extra to know if there's a next page
  };

  if (cursor) {
    queryOptions.cursor = { id: cursor as string };
    queryOptions.skip = 1; // skip the cursor itself
  }

  try {
    const rides = await prisma.ride.findMany(queryOptions);
    let nextCursor: string | undefined = undefined;
    if (rides.length > limit) {
      const next = rides.pop();
      nextCursor = next!.id;
    }
    return res.status(200).json({ data: rides, nextCursor });
  } catch (error: any) {
    console.error('API /api/rides error:', error);
    return res.status(500).json({ error: 'Failed to fetch rides', details: error?.message, stack: error?.stack, raw: error });
  }
}
