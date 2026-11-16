'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, Folder, Plus, ArrowUpRight, Clock, FileText, Lock, Globe, CheckCircle2 } from 'lucide-react';

export default function SpacesDashboardPage() {
  const [spaces] = useState([
    {
      id: 'sp-1',
      name: 'Engineering Architecture',
      slug: 'engineering',
      description: 'Core software architecture guidelines, API standards, and database isolation blueprints.',
      icon: 'Cpu',
      isPublic: true,
      pageCount: 14,
      lastUpdated: '10 mins ago',
    },
    {
      id: 'sp-2',
      name: 'Product & Delivery',
      slug: 'product',
      description: 'Product roadmaps, feature specifications, and sprint release governance.',
      icon: 'Layers',
      isPublic: true,
      pageCount: 8,
      lastUpdated: '2 hours ago',
    },
    {
      id: 'sp-3',
      name: 'Security & Compliance',
      slug: 'security',
      description: 'Zero-trust network topologies, SSRF prevention rules, and role-based authorization matrix.',
      icon: 'Shield',
      isPublic: false,
      pageCount: 6,
      lastUpdated: 'Yesterday',
    },
  ]);

  const [recentUpdates] = useState([
    {
      id: 'p-1',
      title: 'Distributed Systems Standards',
      slug: 'distributed-systems',
      spaceName: 'Engineering Architecture',
      spaceSlug: 'engineering',
      author: 'Elena Architect',
      revision: 3,
      time: '15 mins ago',
      summary: 'Updated event queue retry policies and outbox guarantees',
    },
    {
      id: 'p-2',
      title: 'Database Isolation Principles',
      slug: 'database-migrations',
      spaceName: 'Engineering Architecture',
      spaceSlug: 'engineering',
      author: 'Elena Architect',
      revision: 2,
      time: '1 hour ago',
      summary: 'Added PostgreSQL schema segregation guidelines',
    },
    {
      id: 'p-3',
      title: 'Q1 Product Engineering Roadmap',
      slug: 'q1-roadmap',
      spaceName: 'Product & Delivery',
      spaceSlug: 'product',
      author: 'David Contributor',
      revision: 1,
      time: '3 hours ago',
      summary: 'Initial draft for Q1 milestones and epics',
    },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Knowledge Spaces</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Python FastAPI Backend
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Browse hierarchical documentation, navigate bi-directional backlinks, and compare revision diffs
          </p>
        </div>

        <Link
          href="/spaces/engineering/new"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Wiki Page</span>
        </Link>
      </div>

      {/* Spaces Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Knowledge Spaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {spaces.map((sp) => (
            <Link
              key={sp.id}
              href={`/spaces/${sp.slug}`}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    {sp.isPublic ? (
                      <span className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px] font-semibold">
                        <Globe className="w-3 h-3 mr-0.5 inline" />
                        Public
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 text-[11px] font-semibold">
                        <Lock className="w-3 h-3 mr-0.5 inline" />
                        Private
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition flex items-center space-x-1">
                    <span>{sp.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {sp.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-4 mt-4 border-t border-slate-100">
                <span>{sp.pageCount} documents</span>
                <span>Updated {sp.lastUpdated}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recently Updated Documents</h2>
          <span className="text-xs text-slate-500">Automatic version revisions and diff tracking</span>
        </div>

        <div className="divide-y divide-slate-100">
          {recentUpdates.map((item) => (
            <div key={item.id} className="p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <Link
                    href={`/spaces/${item.spaceSlug}`}
                    className="font-bold text-slate-900 hover:text-blue-600 transition text-sm"
                  >
                    {item.title}
                  </Link>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    Rev #{item.revision}
                  </span>
                  <span className="text-xs text-slate-400">&bull;</span>
                  <span className="text-xs text-slate-500">{item.spaceName}</span>
                </div>
                <p className="text-xs text-slate-500">{item.summary}</p>
              </div>

              <div className="flex items-center space-x-4 text-xs text-slate-400">
                <span>By {item.author}</span>
                <span>{item.time}</span>
                <Link
                  href={`/spaces/${item.spaceSlug}`}
                  className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-md transition"
                >
                  View Page
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infrastructure Status Banner */}
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
              Backend Engine: Python 3.13 &bull; FastAPI (Port 4006) &bull; PostgreSQL 16 (Port 5436) &bull; Redis 7 (Port 6386) &bull; Frontend Next.js (Port 3006)
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
