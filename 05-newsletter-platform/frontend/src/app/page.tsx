'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Users, TrendingUp, CheckCircle, ArrowUpRight, Send, Eye, MousePointerClick, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [stats] = useState({
    activeSubscribers: 1420,
    subscriberGrowth: '+12.4% this month',
    avgOpenRate: 64.2,
    avgCtr: 28.6,
    totalDispatched: 42,
  });

  const [recentCampaigns] = useState([
    {
      id: 'cmp-42',
      title: 'Issue #42: The Resilient Outbox Pattern in Production',
      subject: 'Issue #42: Eliminating Dual-Write Failures with the Transactional Outbox',
      status: 'SENT',
      recipients: 1420,
      openRate: 63.8,
      ctr: 29.4,
      sentAt: 'Feb 15, 2026',
    },
    {
      id: 'cmp-41',
      title: 'Issue #41: Distributed Rate Limiting with Redis & Leaky Bucket',
      subject: 'Issue #41: Architecting Global Rate Limiters Without Throttling Good Actors',
      status: 'SENT',
      recipients: 1390,
      openRate: 66.1,
      ctr: 31.0,
      sentAt: 'Feb 08, 2026',
    },
    {
      id: 'cmp-43',
      title: 'Issue #43: High-Throughput Event Ingestion with Kafka and BullMQ',
      subject: 'Issue #43: Backpressure strategies and idempotent processing',
      status: 'DRAFT',
      recipients: 1420,
      openRate: 0,
      ctr: 0,
      sentAt: 'Draft',
    },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Publication Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow">
            WD
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">The Weekly Disruption</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 inline mr-1" />
                Active
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Independent deep dives on emerging software architectures, distributed systems, and modern engineering practices.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/subscribers"
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Manage Audience
          </Link>
          <Link
            href="/campaigns/new"
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Compose Issue</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Confirmed Audience</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.activeSubscribers.toLocaleString()}</span>
            <span className="text-xs font-medium text-emerald-600">{stats.subscriberGrowth}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Double opt-in verified readers</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Open Rate</span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.avgOpenRate}%</span>
            <span className="text-xs font-medium text-emerald-600">+4.1% industry avg</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Across last 10 dispatches</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Click-Through Rate (CTR)</span>
            <MousePointerClick className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.avgCtr}%</span>
            <span className="text-xs font-medium text-indigo-600">High engagement</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Unique readers visiting deep links</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Issues Sent</span>
            <Mail className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalDispatched}</span>
            <span className="text-xs font-medium text-slate-500">Weekly cadence</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">100% deliverability on main stream</p>
        </div>
      </div>

      {/* Recent Campaigns Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Newsletter Campaigns</h2>
            <p className="text-xs text-slate-500">Track delivery performance and reader interactions</p>
          </div>
          <Link
            href="/campaigns"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
          >
            <span>View All Campaigns</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Campaign Issue</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Audience</th>
                <th className="px-6 py-3 font-semibold">Open Rate</th>
                <th className="px-6 py-3 font-semibold">CTR</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {recentCampaigns.map((cmp) => (
                <tr key={cmp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{cmp.title}</p>
                    <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">{cmp.subject}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cmp.status === 'SENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {cmp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {cmp.recipients.toLocaleString()} readers
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {cmp.status === 'SENT' ? `${cmp.openRate}%` : '—'}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {cmp.status === 'SENT' ? `${cmp.ctr}%` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {cmp.status === 'SENT' ? (
                      <Link
                        href={`/campaigns/${cmp.id}/analytics`}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-800 hover:underline inline-flex items-center space-x-1"
                      >
                        <span>View Analytics</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <Link
                        href={`/campaigns/new?edit=${cmp.id}`}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline"
                      >
                        Edit Draft
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deployment & Environment Status */}
      <div className="bg-slate-900 rounded-xl text-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
                System Infrastructure Status
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Local isolated services: PostgreSQL (Port 5435) &bull; Redis Queue (Port 6385) &bull; Backend API (Port 4005) &bull; Frontend UI (Port 3005)
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Vercel: <strong className="text-amber-400">Not Deployed</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Render: <strong className="text-amber-400">Not Deployed</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Code: <strong className="text-emerald-400">GitHub (Pixlo)</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
