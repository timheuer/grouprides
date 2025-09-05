import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function requireAuth(req: NextApiRequest, res: NextApiResponse): boolean {
  const header = req.headers['authorization'];
  const token = header?.toString().replace('Bearer ', '') || (req.query.adminToken as string);
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || token !== expected) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

function validateRidePayload(body: any, partial = false) {
  const errors: string[] = [];
  const enums = {
    difficulty: ['EASY', 'INTERMEDIATE', 'HARD'],
    rideType: ['ROAD', 'MTB', 'GRAVEL'],
    organizerType: ['SHOP', 'GROUP', 'INDIVIDUAL'],
    status: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
  };
  function req(field: string) { if (!partial && (body[field] === undefined || body[field] === '')) errors.push(`${field} required`); }

  req('title');
  req('group');
  req('startDateTimeUtc');
  req('timezone');
  req('meetupLocationShort');
  req('routeUrl');
  req('difficulty');
  req('rideType');
  req('organizerType');

  if (body.difficulty && !enums.difficulty.includes(body.difficulty)) errors.push('invalid difficulty');
  if (body.rideType && !enums.rideType.includes(body.rideType)) errors.push('invalid rideType');
  if (body.organizerType && !enums.organizerType.includes(body.organizerType)) errors.push('invalid organizerType');
  if (body.status && !enums.status.includes(body.status)) errors.push('invalid status');
  if (body.routeUrl && !/^https?:\/\//i.test(body.routeUrl)) errors.push('routeUrl must be URL');
  if (body.eventUrl && !/^https?:\/\//i.test(body.eventUrl)) errors.push('eventUrl must be URL');
  if (body.startDateTimeUtc) {
    const d = new Date(body.startDateTimeUtc);
    if (isNaN(d.getTime())) errors.push('invalid startDateTimeUtc');
  }
  return errors;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['POST', 'PATCH'].includes(req.method || '')) {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireAuth(req, res)) return;

  if (req.method === 'POST') {
    const errors = validateRidePayload(req.body);
    if (errors.length) return res.status(400).json({ errors });
    try {
      const ride = await prisma.ride.create({
        data: {
          title: req.body.title,
          group: req.body.group,
          startDateTimeUtc: new Date(req.body.startDateTimeUtc),
          timezone: req.body.timezone,
          meetupLocationShort: req.body.meetupLocationShort,
          meetupLocationFull: req.body.meetupLocationFull || null,
          routeUrl: req.body.routeUrl,
          routePlatform: req.body.routePlatform || null,
          difficulty: req.body.difficulty,
          rideType: req.body.rideType,
          organizerType: req.body.organizerType,
          status: req.body.status || 'PUBLISHED',
          eventUrl: req.body.eventUrl || null,
          createdByUserId: req.body.createdByUserId || 'admin',
          notes: req.body.notes || null,
        }
      });
      return res.status(201).json(ride);
    } catch (e:any) {
      return res.status(500).json({ error: 'Create failed', details: e.message });
    }
  }

  if (req.method === 'PATCH') {
    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id required in query' });
    if (req.body.archive === true) {
      try {
        const ride = await prisma.ride.update({ where: { id }, data: { status: 'ARCHIVED' }});
        return res.status(200).json(ride);
      } catch (e:any) {
        return res.status(500).json({ error: 'Archive failed', details: e.message });
      }
    }
    const errors = validateRidePayload(req.body, true);
    if (errors.length) return res.status(400).json({ errors });
    const data: any = { ...req.body };
    if (data.startDateTimeUtc) data.startDateTimeUtc = new Date(data.startDateTimeUtc);
    try {
      const ride = await prisma.ride.update({ where: { id }, data });
      return res.status(200).json(ride);
    } catch (e:any) {
      return res.status(500).json({ error: 'Update failed', details: e.message });
    }
  }
}
