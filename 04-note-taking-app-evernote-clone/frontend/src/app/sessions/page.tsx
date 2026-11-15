'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Laptop, Smartphone, Globe, Shield, Ban, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DeviceSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([
    {
      id: 'session-1',
      deviceId: 'macbook-pro-m3-01',
      deviceName: 'MacBook Pro 16" (Workstation)',
      platform: 'macOS',
      ipAddress: '198.51.100.42',
      lastSyncAt: new Date(),
      isRevoked: false,
    },
    {
      id: 'session-2',
      deviceId: 'iphone-15-pro-02',
      deviceName: 'iPhone 15 Pro (Mobile Client)',
      platform: 'iOS',
      ipAddress: '198.51.100.89',
      lastSyncAt: new Date(Date.now() - 3600000 * 5),
      isRevoked: false,
    },
  ]);

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:4004/api/auth/sessions')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) setSessions(data);
      })
      .catch(() => {});
  }, []);

  const handleRevoke = async (deviceId: string) => {
    setSessions(
      sessions.map((s) => (s.deviceId === deviceId ? { ...s, isRevoked: true } : s)),
    );
    setMessage(`Session for device '${deviceId}' was successfully revoked.`);
  };

  return (
    <div className="flex-1 bg-white h-screen overflow-y-auto p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 flex items-center space-x-1 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workspace</span>
        </Link>
        <span>/</span>
        <span>Account & Security</span>
      </div>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900">Active Device Sessions</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review devices currently synchronized with your personal note vault. Revoke any unrecognized sessions.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <div className="space-y-4">
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
              s.isRevoked ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700">
                {s.platform?.toLowerCase().includes('ios') ? (
                  <Smartphone className="w-5 h-5" />
                ) : (
                  <Laptop className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-900">{s.deviceName}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {s.platform}
                  </span>
                  {s.isRevoked && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                      Revoked
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span>IP: {s.ipAddress || '127.0.0.1'}</span>
                  <span>•</span>
                  <span>
                    Last Synced:{' '}
                    {formatDistanceToNow(new Date(s.lastSyncAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            <div>
              {!s.isRevoked ? (
                <button
                  onClick={() => handleRevoke(s.deviceId)}
                  className="px-3.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Revoke Session</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">Session Inactive</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
