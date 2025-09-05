"use client";
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdminAuth, adminFetch } from '../admin-auth-context';

interface Ride { id:string; title:string; status:string; startDateTimeUtc:string; group:string; }

export default function AdminRidesPage() {
  const { token, invalidate } = useAdminAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [nextCursor, setNextCursor] = useState<string|null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    adminFetch('/api/rides?includePast=true&limit=100', { method:'GET' }, token)
      .then(async (r: Response) => {
        if (r.status === 401) { invalidate(); return Promise.reject('unauthorized'); }
        const j = await r.json();
        if (Array.isArray(j.data)) {
          setRides(j.data);
          setNextCursor(j.nextCursor || null);
        } else if (Array.isArray(j)) {
          setRides(j);
          setNextCursor(null);
        } else {
          setRides([]);
          setNextCursor(null);
        }
      })
      .catch(()=> setError('Failed to load'))
      .finally(()=> setLoading(false));
  },[token, invalidate]);

  async function loadMore() {
    if (!nextCursor || !token) return;
    setLoadingMore(true);
    try {
      const url = `/api/rides?includePast=true&limit=100&cursor=${nextCursor}`;
      const r = await adminFetch(url, { method:'GET' }, token);
      const j = await r.json();
      if (Array.isArray(j.data)) {
        setRides(prev => [...prev, ...j.data]);
        setNextCursor(j.nextCursor || null);
      }
    } finally {
      setLoadingMore(false);
    }
  }

  const filtered = useMemo(() => {
    const arr = Array.isArray(rides) ? rides : [];
    if (!filter.trim()) return arr;
    const f = filter.toLowerCase();
  return arr.filter(r => r.title.toLowerCase().includes(f) || (r.group || '').toLowerCase().includes(f));
  }, [filter, rides]);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4">
        <h1 className="text-2xl font-bold">Admin: Rides</h1>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter rides..." className="border rounded px-3 py-1 text-sm w-full sm:w-60" />
          <Link href="/admin/rides/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm whitespace-nowrap">New Ride</Link>
        </div>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="overflow-x-auto border rounded bg-white shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Title</th>
              <th className="p-2">Group</th>
              <th className="p-2">Start (UTC)</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-2 font-medium">{r.title}</td>
                <td className="p-2">{r.group}</td>
                <td className="p-2 font-mono">{new Date(r.startDateTimeUtc).toISOString().replace('T',' ').slice(0,16)}</td>
                <td className="p-2"><span className="inline-block px-2 py-0.5 rounded bg-gray-200 text-xs font-semibold">{r.status}</span></td>
                <td className="p-2 flex gap-2">
                  <Link href={`/admin/rides/${r.id}`} className="text-blue-600 underline">Edit</Link>
                  <button
                    className="text-red-600 underline"
                    title="Delete ride"
                    onClick={async () => {
                      if (!window.confirm('Delete this ride permanently?')) return;
                      try {
                        const res = await adminFetch(`/api/admin/rides?id=${r.id}`, { method: 'DELETE' }, token);
                        if (res.status === 204) {
                          setRides(prev => prev.filter(ride => ride.id !== r.id));
                        } else {
                          const err = await res.json();
                          alert('Delete failed: ' + (err.error || 'Unknown error'));
                        }
                      } catch (e) {
                        alert('Delete failed');
                      }
                    }}
                  >Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">No rides match current filter.</td></tr>
            )}
          </tbody>
        </table>
        {nextCursor && (
          <div className="flex justify-center py-6">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400"
            >{loadingMore ? 'Loading...' : 'Load More'}</button>
          </div>
        )}
      </div>
    </main>
  )
}
