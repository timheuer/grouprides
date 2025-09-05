"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AdminAuthContextValue {
  token: string | null;
  setToken: (t: string | null) => void;
  status: 'checking' | 'absent' | 'ready';
  invalidate: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'adminToken';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'checking' | 'absent' | 'ready'>('checking');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setToken(saved);
        setStatus('ready');
      } else {
        setStatus('absent');
      }
    } catch {
      setStatus('absent');
    }
  }, []);

  function update(newToken: string | null) {
    if (newToken) {
      localStorage.setItem(STORAGE_KEY, newToken);
      setToken(newToken);
      setStatus('ready');
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
      setStatus('absent');
    }
  }

  function invalidate() { update(null); }

  return (
    <AdminAuthContext.Provider value={{ token, setToken: update, status, invalidate }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}

export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}, token?: string | null) {
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}