import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Groups
  const shopGroup = await prisma.group.create({
    data: {
      name: 'City Bike Shop',
      websiteUrl: 'https://citybikeshop.example.com',
      organizerType: 'SHOP',
      region: 'Metro',
      isActive: true,
    },
  });

  const clubGroup = await prisma.group.create({
    data: {
      name: 'Metro Cycling Club',
      websiteUrl: 'https://metrocycling.example.com',
      organizerType: 'GROUP',
      region: 'Metro',
      isActive: true,
    },
  });

  const soloGroup = await prisma.group.create({
    data: {
      name: 'Solo Adventurer',
      websiteUrl: 'https://solo.example.com',
      organizerType: 'INDIVIDUAL',
      region: 'Metro',
      isActive: true,
    },
  });

  // Create Rides
  await prisma.ride.createMany({
    data: [
      {
        title: 'Saturday Road Blast',
        group: shopGroup.name,
        startDateTimeUtc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        timezone: 'America/New_York',
        meetupLocationShort: 'Shop Main Entrance',
        meetupLocationFull: '123 Main St, Metro City',
        routeUrl: 'https://ridewithgps.com/routes/123456',
        routePlatform: 'RIDEWITHGPS',
        difficulty: 'INTERMEDIATE',
        rideType: 'ROAD',
        organizerType: 'SHOP',
        status: 'PUBLISHED',
        eventUrl: 'https://citybikeshop.example.com/events/road-blast',
        createdAtUtc: new Date(),
        updatedAtUtc: new Date(),
        createdByUserId: 'admin',
        notes: 'Helmets required. Coffee after ride.',
      },
      {
        title: 'Sunday Gravel Adventure',
        group: clubGroup.name,
        startDateTimeUtc: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        timezone: 'America/New_York',
        meetupLocationShort: 'Gravel Lot',
        meetupLocationFull: '456 Gravel Rd, Metro City',
        routeUrl: 'https://strava.com/routes/654321',
        routePlatform: 'STRAVA',
        difficulty: 'HARD',
        rideType: 'GRAVEL',
        organizerType: 'GROUP',
        status: 'PUBLISHED',
        eventUrl: 'https://metrocycling.example.com/events/gravel-adventure',
        createdAtUtc: new Date(),
        updatedAtUtc: new Date(),
        createdByUserId: 'admin',
        notes: 'Bring extra water. No drop ride.',
      },
      {
        title: 'Weekday MTB Social',
        group: clubGroup.name,
        startDateTimeUtc: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        timezone: 'America/New_York',
        meetupLocationShort: 'Trailhead',
        meetupLocationFull: '789 Trail Ave, Metro City',
        routeUrl: 'https://komoot.com/route/987654',
        routePlatform: 'KOMOOT',
        difficulty: 'EASY',
        rideType: 'MTB',
        organizerType: 'GROUP',
        status: 'PUBLISHED',
        eventUrl: 'https://metrocycling.example.com/events/mtb-social',
        createdAtUtc: new Date(),
        updatedAtUtc: new Date(),
        createdByUserId: 'admin',
        notes: 'Beginner friendly. Social pace.',
      },
      {
        title: 'Solo Sunrise Spin',
        group: soloGroup.name,
        startDateTimeUtc: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        timezone: 'America/New_York',
        meetupLocationShort: 'River Park',
        meetupLocationFull: '321 River Rd, Metro City',
        routeUrl: 'https://ridewithgps.com/routes/222222',
        routePlatform: 'RIDEWITHGPS',
        difficulty: 'EASY',
        rideType: 'ROAD',
        organizerType: 'INDIVIDUAL',
        status: 'PUBLISHED',
        eventUrl: 'https://solo.example.com/events/sunrise-spin',
        createdAtUtc: new Date(),
        updatedAtUtc: new Date(),
        createdByUserId: 'admin',
        notes: 'Early start. Coffee at finish.',
      },
      {
        title: 'Archived Gravel Classic',
        group: shopGroup.name,
        startDateTimeUtc: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        timezone: 'America/New_York',
        meetupLocationShort: 'Old Mill',
        meetupLocationFull: '111 Old Mill Rd, Metro City',
        routeUrl: 'https://strava.com/routes/333333',
        routePlatform: 'STRAVA',
        difficulty: 'INTERMEDIATE',
        rideType: 'GRAVEL',
        organizerType: 'SHOP',
        status: 'ARCHIVED',
        eventUrl: 'https://citybikeshop.example.com/events/gravel-classic',
        createdAtUtc: new Date(),
        updatedAtUtc: new Date(),
        createdByUserId: 'admin',
        notes: 'Classic route. Archived for history.',
      },
    ],
  });

  console.log('Seed data created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
