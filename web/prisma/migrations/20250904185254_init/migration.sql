-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "organizerType" TEXT NOT NULL,
    "region" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Ride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "startDateTimeUtc" DATETIME NOT NULL,
    "timezone" TEXT NOT NULL,
    "meetupLocationShort" TEXT NOT NULL,
    "meetupLocationFull" TEXT,
    "routeUrl" TEXT NOT NULL,
    "routePlatform" TEXT,
    "difficulty" TEXT NOT NULL,
    "rideType" TEXT NOT NULL,
    "organizerType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAtUtc" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAtUtc" DATETIME NOT NULL,
    "createdByUserId" TEXT,
    "notes" TEXT,
    CONSTRAINT "Ride_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
