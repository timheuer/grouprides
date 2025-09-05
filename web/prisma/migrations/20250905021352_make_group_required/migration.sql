/*
  Warnings:

  - Made the column `group` on table `Ride` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "startDateTimeUtc" DATETIME NOT NULL,
    "timezone" TEXT NOT NULL,
    "meetupLocationShort" TEXT NOT NULL,
    "meetupLocationFull" TEXT,
    "routeUrl" TEXT NOT NULL,
    "routePlatform" TEXT,
    "difficulty" TEXT NOT NULL,
    "rideType" TEXT NOT NULL,
    "organizerType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "eventUrl" TEXT,
    "createdAtUtc" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAtUtc" DATETIME NOT NULL,
    "createdByUserId" TEXT,
    "notes" TEXT
);
INSERT INTO "new_Ride" ("createdAtUtc", "createdByUserId", "difficulty", "eventUrl", "group", "id", "meetupLocationFull", "meetupLocationShort", "notes", "organizerType", "rideType", "routePlatform", "routeUrl", "startDateTimeUtc", "status", "timezone", "title", "updatedAtUtc") SELECT "createdAtUtc", "createdByUserId", "difficulty", "eventUrl", "group", "id", "meetupLocationFull", "meetupLocationShort", "notes", "organizerType", "rideType", "routePlatform", "routeUrl", "startDateTimeUtc", "status", "timezone", "title", "updatedAtUtc" FROM "Ride";
DROP TABLE "Ride";
ALTER TABLE "new_Ride" RENAME TO "Ride";
CREATE INDEX "Ride_startDateTimeUtc_idx" ON "Ride"("startDateTimeUtc");
CREATE INDEX "Ride_difficulty_idx" ON "Ride"("difficulty");
CREATE INDEX "Ride_rideType_idx" ON "Ride"("rideType");
CREATE INDEX "Ride_organizerType_idx" ON "Ride"("organizerType");
CREATE INDEX "Ride_status_idx" ON "Ride"("status");
CREATE INDEX "Ride_status_startDateTimeUtc_idx" ON "Ride"("status", "startDateTimeUtc");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
