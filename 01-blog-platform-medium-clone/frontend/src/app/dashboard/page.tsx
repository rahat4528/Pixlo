'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BarChart2, Eye, Users, Clock, ThumbsUp, FileText, CheckCircle, Clock3, AlertCircle, RefreshCw, History } from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'published' | 'drafts' | 'submissions'>('published');

  const stats = {
    totalArticles: 2,
    totalViews: 2070,
    totalUniqueSessions: 1840,
    totalApplause: 130,
    totalReadingMinutes: 380,
    averageCompletionRate: 74.2,
  };

  const articles = [
    {
      id: '1',
      title: 'Architecting Resilient Distributed Systems for High-Throughput Workloads',
      status: 'PUBLISHED',
      publishedAt: 'Nov 14, 2026',
      views: 1420,
      uniqueSessions: 1290,
      applause: 88,
      readingMinutes: 240,
      completionRate: 78.5,
      slug: 'architecting-resilient-distributed-systems',
    },
    {
      id: '2',
      title: 'Advanced Raft Consensus Internals: Log Compaction and Leader Leases',
      status: 'PUBLISHED',
      publishedAt: 'Nov 15, 2026',
      views: 650,
      uniqueSessions: 550,
      applause: 42,
      readingMinutes: 140,
      completionRate: 69.8,
      slug: 'advanced-raft-consensus-internals',
      isMembersOnly: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-gray-100">
        <div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-gray-950">
            Author Studio & Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real session-deduplicated telemetry, scroll-depth completion rates, and story management.
          </p>
        </div>
        <Link
          href="/write"
          className="self-start sm:self-auto bg-gray-950 hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-colors flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" /> Write new story
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 my-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Views</span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-sans font-black text-2xl text-gray-950">{stats.totalViews.toLocaleString()}</p>
          <span className="text-[11px] text-gray-400">Deduplicated per session</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Unique Readers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-sans font-black text-2xl text-gray-950">{stats.totalUniqueSessions.toLocaleString()}</p>
          <span className="text-[11px] text-gray-400">Unique visitor sessions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Reading Time</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <p className="font-sans font-black text-2xl text-gray-950">{stats.totalReadingMinutes}m</p>
          <span className="text-[11px] text-gray-400">Aggregate read duration</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Claps</span>
            <ThumbsUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-sans font-black text-2xl text-gray-950">{stats.totalApplause}</p>
          <span className="text-[11px] text-gray-400">Reader appreciation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Completion</span>
            <BarChart2 className="w-4 h-4 text-rose-600" />
          </div>
          <p className="font-sans font-black text-2xl text-gray-950">{stats.averageCompletionRate}%</p>
          <span className="text-[11px] text-gray-400">Average scroll depth</span>
        </div>
      </div>

      {/* Story Management Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden mt-10">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveTab('published')}
              className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'published' ? 'text-gray-900 border-b-2 border-gray-900 pb-1' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              Published ({articles.length})
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'drafts' ? 'text-gray-900 border-b-2 border-gray-900 pb-1' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              Drafts (0)
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'submissions' ? 'text-gray-900 border-b-2 border-gray-900 pb-1' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              Publication Submissions (0)
            </button>
          </div>

          <Link href="/publication/architectural-horizons" className="text-xs font-semibold text-emerald-700 hover:underline">
            Manage Publication →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/60 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-6">Story Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Published</th>
                <th className="py-3 px-4 text-right">Views</th>
                <th className="py-3 px-4 text-right">Claps</th>
                <th className="py-3 px-4 text-right">Scroll Completion</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {articles.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900 max-w-sm">
                    <Link href={`/story/${item.slug}`} className="hover:text-emerald-700 transition-colors">
                      {item.title}
                    </Link>
                    {item.isMembersOnly && (
                      <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-700 bg-amber-50">
                        Member Lock
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      <CheckCircle className="w-3 h-3 mr-1" /> Published
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-500">{item.publishedAt}</td>
                  <td className="py-4 px-4 text-right font-semibold text-gray-900">{item.views.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right font-semibold text-gray-900">{item.applause}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${item.completionRate}%` }}
                        />
                      </div>
                      <span className="text-gray-900 font-medium">{item.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3 font-semibold">
                      <Link href="/write" className="text-gray-600 hover:text-gray-900">
                        Edit
                      </Link>
                      <button className="text-gray-400 hover:text-gray-700" title="Revisions History">
                        <History className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
