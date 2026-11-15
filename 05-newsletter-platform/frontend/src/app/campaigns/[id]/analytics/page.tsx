'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Mail, Eye, MousePointerClick, AlertTriangle, UserX, ExternalLink, Clock, CheckCircle } from 'lucide-react';

export default function CampaignAnalyticsPage({ params }: { params: { id: string } }) {
  const [metrics] = useState({
    title: 'Issue #42: The Resilient Outbox Pattern in Production',
    subject: 'Issue #42: Eliminating Dual-Write Failures with the Transactional Outbox',
    status: 'SENT',
    sentAt: '2026-02-15T12:00:25Z',
    totalRecipients: 1420,
    sentCount: 1420,
    deliveredCount: 1416,
    bounceCount: 4,
    uniqueOpens: 906,
    totalOpens: 1542,
    openRate: 64.0,
    uniqueClicks: 418,
    totalClicks: 724,
    clickThroughRate: 29.5,
    clickToOpenRate: 46.1,
    unsubscribeCount: 2,
    unsubscribeRate: 0.14,
  });

  const [topLinks] = useState([
    {
      url: 'https://disruption.pixlo.local/articles/outbox-pattern',
      clicks: 348,
      uniqueClicks: 285,
    },
    {
      url: 'https://disruption.pixlo.local/benchmarks/event-queues',
      clicks: 196,
      uniqueClicks: 162,
    },
    {
      url: 'https://disruption.pixlo.local/community/discussion-42',
      clicks: 86,
      uniqueClicks: 71,
    },
  ]);

  const [activityTimeline] = useState([
    { time: '12:00 PM', event: 'Campaign Dispatched to 1,420 subscribers' },
    { time: '12:05 PM', event: '1,416 messages confirmed DELIVERED by mail transport' },
    { time: '12:06 PM', event: '4 hard bounces recorded and added to suppression list' },
    { time: '12:12 PM', event: 'First open recorded (IP hash 8f4c...)' },
    { time: '12:20 PM', event: 'Peak reading window: 512 opens in 15 minutes' },
    { time: '01:00 PM', event: 'First click registered on outbox-pattern article' },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/campaigns"
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{metrics.title}</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {metrics.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Subject: {metrics.subject} &bull; Dispatched on {new Date(metrics.sentAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Delivered</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {metrics.deliveredCount.toLocaleString()} / {metrics.totalRecipients.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">99.7% delivery success rate</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Rate</span>
            <Eye className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{metrics.openRate}%</div>
          <p className="text-xs text-slate-500 mt-1">
            {metrics.uniqueOpens.toLocaleString()} unique &bull; {metrics.totalOpens.toLocaleString()} total
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Click-Through Rate</span>
            <MousePointerClick className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{metrics.clickThroughRate}%</div>
          <p className="text-xs text-slate-500 mt-1">
            {metrics.uniqueClicks} unique readers &bull; {metrics.clickToOpenRate}% CTOR
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Bounces & Unsubscribes</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {metrics.bounceCount} / {metrics.unsubscribeCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {metrics.unsubscribeRate}% unsub rate &bull; All cleaned automatically
          </p>
        </div>
      </div>

      {/* Links & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Links Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Top Clicked Destinations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Destination URL</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Unique Clicks</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Total Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {topLinks.map((link, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-sky-700 truncate max-w-md">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center space-x-1">
                        <span className="truncate">{link.url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{link.uniqueClicks}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{link.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deliverability Timeline (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Event Audit Log</h2>
          <div className="space-y-3">
            {activityTimeline.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 text-xs">
                <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-700">{item.time}</span>
                  <p className="text-slate-500 mt-0.5">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
