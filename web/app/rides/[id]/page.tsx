import { notFound } from 'next/navigation';
import Link from 'next/link';

function getTypeIcon(type: string) {
  switch (type) {
    case 'ROAD': return '🚴‍♂️';
    case 'MTB': return '🚵';
    case 'GRAVEL': return '🏞️';
    default: return '❓';
  }
}

function getBadgeColor(difficulty: string) {
  switch (difficulty) {
    case 'EASY': return 'bg-green-200 text-green-800';
    case 'INTERMEDIATE': return 'bg-yellow-200 text-yellow-800';
    case 'HARD': return 'bg-red-200 text-red-800';
    default: return 'bg-gray-200 text-gray-800';
  }
}

function getOrganizerIcon(type: string) {
  switch (type) {
    case 'SHOP': return '🏪';
    case 'GROUP': return '👥';
    case 'INDIVIDUAL': return '🧑';
    default: return '❓';
  }
}

function formatHumanDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// This will be replaced with a real API call
async function getRide(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/rides?id=${id}`);
  if (!res.ok) return null;
  const rides = await res.json();
  return rides.find((r: any) => r.id === id) || null;
}

export default async function RideDetailPage({ params }: { params: { id: string } }) {
  const ride = await getRide(params.id);
  if (!ride) return notFound();

  return (
    <main className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <Link href="/rides" className="text-blue-600 hover:underline mb-4 inline-block">← Back to rides</Link>
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
          <span title={ride.rideType} className="inline-block px-2 py-1 rounded-full bg-gray-100 text-2xl" aria-label={ride.rideType}>{getTypeIcon(ride.rideType)}</span>
          {ride.title}
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getBadgeColor(ride.difficulty)} shadow-sm ml-2`} title={ride.difficulty}>{ride.difficulty}</span>
        </h1>
      </div>
      <div className="mb-4 text-gray-700 flex items-center gap-2">
        <span className="font-semibold">Date/Time:</span>
        <span className="font-mono bg-blue-50 px-2 py-1 rounded text-blue-900">{formatHumanDate(ride.startDateTimeUtc)}</span>
      </div>
      <div className="mb-4 text-gray-700 flex items-center gap-2">
        <span className="font-semibold">Group:</span>
  <span title={ride.group.organizerType} className="inline-block px-2 py-1 rounded-full bg-gray-100 text-lg" aria-label={ride.group.organizerType}>{getOrganizerIcon(ride.group.organizerType)}</span>
        <a href={ride.group.websiteUrl || '#'} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 hover:text-blue-900 font-medium ml-1">{ride.group.name}</a>
      </div>
      <div className="mb-4 text-gray-700">
        <span className="font-semibold">Meetup Location:</span> {ride.meetupLocationShort}
      </div>
      <div className="mb-4 text-gray-700">
        <span className="font-semibold">Route:</span> <a href={ride.routeUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-900">View Route ↗</a>
      </div>
    </main>
  );
}
