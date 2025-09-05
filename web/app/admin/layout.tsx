"use client";
import React from 'react';
import Link from 'next/link';
import { SessionProvider, useSession, signOut, signIn } from 'next-auth/react';

function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAdmin = (session as any)?.isAdmin;

  if (isLoading) {
    return <div className="p-8 text-center text-gray-600">Loading session...</div>;
  }

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm space-y-6 border">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 mb-1">Admin Access</h1>
            <p className="text-sm text-gray-600">Sign in with your approved Google account.</p>
          </div>
          <button
            onClick={() => signIn('google', { callbackUrl: '/admin/rides' })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >Continue with Google</button>
          <p className="text-xs text-gray-400">Email must be pre-approved by an administrator.</p>
        </div>
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
          <span className="px-2 py-1 bg-green-700 rounded flex items-center gap-1">{session.user?.email}</span>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="px-2 py-1 bg-red-600 rounded hover:bg-red-700">Logout</button>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">{children}</main>
      <footer className="text-center py-4 text-xs text-gray-500">Admin UI — Auth via Google OAuth</footer>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider><AdminShell>{children}</AdminShell></SessionProvider>;
}