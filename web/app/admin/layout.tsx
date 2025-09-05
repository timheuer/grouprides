"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { AdminAuthProvider, useAdminAuth } from './admin-auth-context';

function TokenGate({ children }: { children: React.ReactNode }) {
  const { status, setToken, token, invalidate } = useAdminAuth();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setChecking(true);
    setError(null);
    // Attempt a lightweight authorized call to validate token (list 1 ride if exists)
    try {
      const res = await fetch('/api/rides?limit=1&includePast=true');
      // We can't actually verify token without a protected endpoint; rely on user-provided token for now.
      setToken(input.trim());
    } catch {
      setError('Network error while verifying token');
    } finally {
      setChecking(false);
    }
  }

  if (status === 'checking') {
    return <div className="p-8 text-center text-gray-600">Loading admin gate...</div>;
  }
  if (status === 'absent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <form onSubmit={verify} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm space-y-4 border">
          <h1 className="text-xl font-semibold text-gray-800">Admin Access</h1>
          <p className="text-sm text-gray-600">Enter the admin token to proceed.</p>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={input}
            onChange={e=>setInput(e.target.value)}
            placeholder="Admin token"
            required
          />
            {error && <div className="text-sm text-red-600">{error}</div>}
          <button disabled={checking} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {checking? 'Verifying...' : 'Unlock'}
          </button>
          <p className="text-xs text-gray-400">Token stored locally (not secure for production).</p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <nav className="flex gap-6 text-sm">
          <Link href="/admin/rides" className="hover:underline">Rides</Link>
          <Link href="/rides" className="hover:underline">Public Directory</Link>
        </nav>
        <div className="flex items-center gap-3 text-xs">
          <span className="px-2 py-1 bg-green-700 rounded">Token loaded</span>
          <button onClick={()=>invalidate()} className="px-2 py-1 bg-red-600 rounded hover:bg-red-700">Logout</button>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">{children}</main>
      <footer className="text-center py-4 text-xs text-gray-500">Admin UI (MVP) — Not production hardened</footer>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <TokenGate>{children}</TokenGate>
    </AdminAuthProvider>
  );
}