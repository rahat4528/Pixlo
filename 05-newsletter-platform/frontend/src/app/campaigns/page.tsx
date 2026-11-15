'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Plus, Send, Search, Filter, ArrowUpRight, Clock, CheckCircle2, FileEdit } from 'lucide-react';

export default function CampaignsListPage() {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const [campaigns] = useState([
    {
      id: 'cmp-42',
      title: 'Issue #42: The Resilient Outbox Pattern in Production',
      subject: 'Issue #42: Eliminating Dual-Write Failures with the Transactional Outbox',
      status: 'SENT',
      recipients: 1420,
      sentCount: 1420,
      openCount: 906,
      openRate: 63.8,
      clickCount: 418,
      ctr: 29.4,
      sentAt: '2026-02-15T12:00:25Z',
    },
    {
      id: 'cmp-41',
      title: 'Issue #41: Distributed Rate Limiting with Redis & Leaky Bucket',
      subject: 'Issue #41: Architecting Global Rate Limiters Without Throttling Good Actors',
      status: 'SENT',
      recipients: 1390,
      sentCount: 1390,
      openCount: 919,
      openRate: 66.1,
      clickCount: 431,
      ctr: 31.0,
      sentAt: '2026-02-08T12:00:15Z',
    },
    {
      id: 'cmp-43',
      title: 'Issue #43: High-Throughput Event Ingestion with Kafka and BullMQ',
      subject: 'Issue #43: Backpressure strategies and idempotent consumer loops',
      status: 'DRAFT',
      recipients: 1420,
      sentCount: 0,
      openCount: 0,
      openRate: 0,
      clickCount: 0,
      ctr: 0,
      sentAt: null,
    },
  ]);

  const filtered = campaigns.filter((c) => {
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-0.5">Author, schedule, and track audience broadcast campaigns</p>
        </div>
        <Link
          href="/campaigns/new"
          className="flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between gap-3 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search campaigns by subject or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'SENT', 'SCHEDULED', 'DRAFT'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center space-x-2.5">
                <h3 className="font-bold text-slate-900 text-base">{c.title}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    c.status === 'SENT'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Subject: {c.subject}</p>
              <p className="text-xs text-slate-400">
                {c.sentAt ? `Dispatched on ${new Date(c.sentAt).toLocaleDateString()}` : 'Not dispatched yet'} &bull; Audience: {c.recipients} recipients
              </p>
            </div>

            <div className="flex items-center space-x-6">
              {c.status === 'SENT' && (
                <div className="flex items-center space-x-4 text-center">
                  <div>
                    <span className="block text-base font-extrabold text-slate-900">{c.openRate}%</span>
                    <span className="text-[11px] text-slate-500 font-medium uppercase">Opens</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="block text-base font-extrabold text-slate-900">{c.ctr}%</span>
                    <span className="text-[11px] text-slate-500 font-medium uppercase">CTR</span>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
                {c.status === 'SENT' ? (
                  <Link
                    href={`/campaigns/${c.id}/analytics`}
                    className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition flex items-center space-x-1"
                  >
                    <span>Metrics</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    href={`/campaigns/new?edit=${c.id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition flex items-center space-x-1"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Edit Draft</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
