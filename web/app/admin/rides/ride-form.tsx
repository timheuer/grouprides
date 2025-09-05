"use client";
import { useEffect, useState } from 'react';
import { useAdminAuth, adminFetch } from '../admin-auth-context';
import { useRouter, usePathname } from 'next/navigation';

interface Ride {
  id?: string;
  title: string;
  group: string;
  startDateTimeUtc: string;
  timezone: string;
  meetupLocationShort: string;
  meetupLocationFull?: string;
  routeUrl: string;
  difficulty: string;
  rideType: string;
  organizerType: string;
  status: string;
  eventUrl?: string;
  notes?: string;
}

const difficulties = ['EASY','INTERMEDIATE','HARD'];
const rideTypes = ['ROAD','MTB','GRAVEL'];
const organizerTypes = ['SHOP','GROUP','INDIVIDUAL'];
const statuses = ['DRAFT','PUBLISHED','ARCHIVED'];

export default function RideForm({ mode, rideId }: { mode:'create'|'edit'; rideId?:string }) {
  const router = useRouter();
  const { token, invalidate } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [ride, setRide] = useState<Ride>({
    title: '',
    group: '',
    startDateTimeUtc: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    meetupLocationShort: '',
    routeUrl: '',
    difficulty: 'INTERMEDIATE',
    rideType: 'ROAD',
    organizerType: 'GROUP',
    status: 'PUBLISHED',
  });

  useEffect(() => {
    if (mode === 'edit' && rideId) {
      adminFetch(`/api/rides?id=${rideId}`, { method: 'GET' }, token || undefined)
        .then(async r => {
          if (r.status === 401) { invalidate(); return Promise.reject('unauthorized'); }
          return r.json();
        })
        .then(data => setRide({
          id: data.id,
          title: data.title,
          group: data.group?.name || data.group || '',
          startDateTimeUtc: data.startDateTimeUtc.slice(0, 16),
          timezone: data.timezone,
          meetupLocationShort: data.meetupLocationShort,
          meetupLocationFull: data.meetupLocationFull || '',
          routeUrl: data.routeUrl,
          difficulty: data.difficulty,
          rideType: data.rideType,
          organizerType: data.organizerType,
          status: data.status,
          eventUrl: data.eventUrl || '',
          notes: data.notes || '',
        }))
        .catch(() => setError('Failed to load ride'));
    }
    setLoading(false);
  }, [mode, rideId, token, invalidate]);

  function update<K extends keyof Ride>(k:K, v:Ride[K]) { setRide(r => ({...r, [k]:v})); }

  async function submit(e:React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    const payload = { ...ride, startDateTimeUtc: new Date(ride.startDateTimeUtc).toISOString() };
    const method = mode==='create' ? 'POST':'PATCH';
    const url = mode==='create'? '/api/admin/rides' : `/api/admin/rides?id=${ride.id}`;
    const res = await adminFetch(url, {
      method,
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    }, token || undefined);
    if (!res.ok) {
      const j = await res.json().catch(()=>({}));
      setError(j.errors ? j.errors.join(', ') : j.error || 'Save failed');
    } else {
      router.push('/admin/rides');
    }
    setSaving(false);
  }

  async function archive() {
    if (!ride.id) return;
    if (!confirm('Archive this ride?')) return;
    setSaving(true);
  const res = await adminFetch(`/api/admin/rides?id=${ride.id}`, { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ archive:true }) }, token || undefined);
    if (!res.ok) { setError('Archive failed'); } else { router.push('/admin/rides'); }
    setSaving(false);
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">{mode==='create'? 'Create Ride':'Edit Ride'}</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input value={ride.title} onChange={e => update('title', e.target.value)} required className="mt-1 w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Group</label>
          <input value={ride.group} onChange={e => update('group', e.target.value)} required className="mt-1 w-full border rounded px-2 py-1" placeholder="Group name or organizer" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Start (Local)</label>
            <input type="datetime-local" value={ride.startDateTimeUtc} onChange={e => update('startDateTimeUtc', e.target.value)} required className="mt-1 w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Timezone (IANA)</label>
            <input value={ride.timezone} onChange={e => update('timezone', e.target.value)} required className="mt-1 w-full border rounded px-2 py-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Meetup Short</label>
            <input value={ride.meetupLocationShort} onChange={e => update('meetupLocationShort', e.target.value)} required className="mt-1 w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Meetup Full (optional)</label>
            <input value={ride.meetupLocationFull || ''} onChange={e => update('meetupLocationFull', e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Route URL</label>
          <input value={ride.routeUrl} onChange={e => update('routeUrl', e.target.value)} required className="mt-1 w-full border rounded px-2 py-1" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Difficulty</label>
            <select value={ride.difficulty} onChange={e => update('difficulty', e.target.value)} className="mt-1 w-full border rounded px-2 py-1">{difficulties.map(v => <option key={v}>{v}</option>)}</select>
          </div>
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select value={ride.rideType} onChange={e => update('rideType', e.target.value)} className="mt-1 w-full border rounded px-2 py-1">{rideTypes.map(v => <option key={v}>{v}</option>)}</select>
          </div>
          <div>
            <label className="block text-sm font-medium">Organizer</label>
            <select value={ride.organizerType} onChange={e => update('organizerType', e.target.value)} className="mt-1 w-full border rounded px-2 py-1">{organizerTypes.map(v => <option key={v}>{v}</option>)}</select>
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select value={ride.status} onChange={e => update('status', e.target.value)} className="mt-1 w-full border rounded px-2 py-1">{statuses.map(v => <option key={v}>{v}</option>)}</select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Event URL (optional)</label>
          <input value={ride.eventUrl || ''} onChange={e => update('eventUrl', e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Notes (optional)</label>
          <textarea value={ride.notes || ''} onChange={e => update('notes', e.target.value)} rows={4} className="mt-1 w-full border rounded px-2 py-1" />
        </div>
        <div className="flex gap-4 items-center">
          <button disabled={saving} type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : (mode === 'create' ? 'Create Ride' : 'Save Changes')}</button>
          {mode === 'edit' && ride.id && <button type="button" onClick={archive} disabled={saving} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50">Archive</button>}
          <button type="button" onClick={() => router.push('/admin/rides')} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
        </div>
      </form>
    </main>
  );
}
