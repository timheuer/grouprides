
"use client";
import { useEffect, useState, useRef, Fragment } from 'react';

// --- Types & Utility Functions ---
interface Ride {
  id: string;
  title: string;
  startDateTimeUtc: string;
  timezone: string;
  meetupLocationShort: string;
  routeUrl: string;
  difficulty: string;
  rideType: string;
  organizerType: string;
  status: string;
  createdAtUtc: string;
  group: {
    id: string;
    name: string;
    websiteUrl?: string;
    organizerType: string;
  };
}

function getBadgeColor(difficulty: string) {
  switch (difficulty) {
    case 'EASY': return 'bg-green-200 text-green-800';
    case 'INTERMEDIATE': return 'bg-yellow-200 text-yellow-800';
    case 'HARD': return 'bg-red-200 text-red-800';
    default: return 'bg-gray-200 text-gray-800';
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'ROAD': return '🚴‍♂️';
    case 'MTB': return '🚵';
    case 'GRAVEL': return '🏞️';
    default: return '❓';
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

function isNew(createdAtUtc: string) {
  const created = new Date(createdAtUtc);
  const now = new Date();
  return (now.getTime() - created.getTime()) < 48 * 60 * 60 * 1000;
}

function groupByMonth(rides: Ride[]) {
  const groups: { [month: string]: Ride[] } = {};
  rides.forEach((ride) => {
    const date = new Date(ride.startDateTimeUtc);
    const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groups[month]) groups[month] = [];
    groups[month].push(ride);
  });
  return groups;
}

// Helper for uniform date/time formatting
function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

type SortKey = 'startDateTimeUtc' | 'difficulty' | 'rideType' | 'organizerType';
type SortOrder = 'asc' | 'desc';

// ...existing Ride, getBadgeColor, getTypeIcon, getOrganizerIcon, isNew, groupByMonth, SortKey, SortOrder...

// Modernized RidesPage
export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('startDateTimeUtc');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/rides')
      .then((res) => res.json())
      .then((data) => {
        setRides(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load rides');
        setLoading(false);
      });
  }, []);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  }

  function getSortedRides(rides: Ride[]) {
    return [...rides].sort((a, b) => {
      if (sortKey === 'startDateTimeUtc') {
        const aTime = new Date(a.startDateTimeUtc).getTime();
        const bTime = new Date(b.startDateTimeUtc).getTime();
        if (aTime < bTime) return sortOrder === 'asc' ? -1 : 1;
        if (aTime > bTime) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      } else {
        const aVal = a[sortKey] as string;
        const bVal = b[sortKey] as string;
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }

  // Group rides by month first, then sort within each group
  const groupedRaw = groupByMonth(rides);
  const grouped: { [month: string]: Ride[] } = {};
  Object.entries(groupedRaw).forEach(([month, rides]) => {
    grouped[month] = getSortedRides(rides);
  });

  return (
    <main className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div ref={topRef}></div>
      <h1 className="text-3xl font-extrabold mb-6 text-blue-900 tracking-tight">Group Rides Directory</h1>
      {loading && <div className="animate-pulse text-gray-500">Loading rides...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {Object.keys(grouped).length === 0 && !loading && <div>No rides found.</div>}
      <div className="space-y-12">
        {Object.entries(grouped).map(([month, rides]) => (
          <section key={month} className="mb-8">
            <div className="sticky top-0 z-10 bg-blue-100/80 backdrop-blur border-b border-blue-200 py-2 px-4 rounded-t shadow font-semibold text-blue-800 text-lg">
              {month}
            </div>
            <div className="overflow-x-auto rounded-b shadow-lg bg-white">
              <table className="min-w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-3 py-2 cursor-pointer text-left font-semibold text-blue-900" onClick={() => handleSort('startDateTimeUtc')}>
                      <span className="inline-flex items-center gap-1">Date/Time <span className="text-xs">{sortKey === 'startDateTimeUtc' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</span></span>
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-blue-900">Title</th>
                    <th className="px-3 py-2 text-left font-semibold text-blue-900">Group</th>
                    <th className="px-3 py-2 cursor-pointer text-left font-semibold text-blue-900" onClick={() => handleSort('difficulty')}>
                      <span className="inline-flex items-center gap-1">Difficulty <span className="text-xs">{sortKey === 'difficulty' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</span></span>
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-blue-900">Meetup</th>
                    <th className="px-3 py-2 text-left font-semibold text-blue-900">Route</th>
                    {/* Removed 'New' column */}
                  </tr>
                </thead>
                <tbody>
                  {rides.map((ride, idx) => (
                    <tr key={ride.id} className={"transition hover:bg-blue-50 " + (idx % 2 === 0 ? 'bg-white' : 'bg-blue-50/40')}>
                      {/* Date/Time */}
                      <td className="px-3 py-2 text-sm whitespace-nowrap font-mono">
                        {formatDateTime(ride.startDateTimeUtc)}
                      </td>
                      {/* Title (with type icon) */}
                      <td className="px-3 py-2 font-semibold text-blue-900">
                        <span className="inline-flex items-center gap-2">
                          <span title={ride.rideType} className="inline-block px-2 py-1 rounded-full bg-gray-100 text-lg" aria-label={ride.rideType}>{getTypeIcon(ride.rideType)}</span>
                          <span>{ride.title}</span>
                        </span>
                      </td>
                      {/* Group (with organizer icon) */}
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-2">
                          <span title={ride.organizerType} className="inline-block px-2 py-1 rounded-full bg-gray-100 text-lg" aria-label={ride.organizerType}>{getOrganizerIcon(ride.organizerType)}</span>
                          <a href={ride.group.websiteUrl || '#'} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 hover:text-blue-900 font-medium">{ride.group.name}</a>
                        </span>
                      </td>
                      {/* Difficulty */}
                      <td className="px-3 py-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getBadgeColor(ride.difficulty)} shadow-sm`}>{ride.difficulty}</span>
                      </td>
                      {/* Meetup */}
                      <td className="px-3 py-2 text-sm" title={ride.meetupLocationShort}>{ride.meetupLocationShort}</td>
                      {/* Route */}
                      <td className="px-3 py-2">
                        <a href={ride.routeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 underline text-sm hover:text-blue-900">Route ↗</a>
                      </td>
                      {/* Removed 'New' cell */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
      <button
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
        onClick={() => topRef.current?.scrollIntoView({ behavior: 'smooth' })}
        aria-label="Scroll to top"
      >↑ Top</button>
    </main>
  );
}