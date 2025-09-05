"use client";
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm space-y-6 border">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 mb-1">Admin Login</h1>
          <p className="text-sm text-gray-600">Sign in with an approved Google account.</p>
        </div>
        <button
          onClick={async () => { setLoading(true); await signIn('google', { callbackUrl: '/admin/rides' }); }}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        >{loading ? 'Redirecting...' : 'Continue with Google'}</button>
        <p className="text-xs text-gray-400">Access restricted to pre-approved emails.</p>
      </div>
    </div>
  );
}