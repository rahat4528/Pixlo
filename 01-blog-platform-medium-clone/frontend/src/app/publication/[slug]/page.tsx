'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Clock, FileText, Check, AlertCircle } from 'lucide-react';

export default function PublicationPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState<'stories' | 'submissions' | 'editors'>('stories');
  const [submissions, setSubmissions] = useState([
    {
      id: 'sub_1',
      title: 'Zero-Copy Stream Processing with Rust WebAssembly in the Edge Tier',
      author: 'Marcus Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      submittedAt: 'Today, 11:20 AM',
      readingTime: '5 min read',
      status: 'IN_REVIEW',
    },
  ]);

  const handleApprove = (id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    alert('Submission approved and published to Architectural Horizons!');
  };

  const handleRequestChanges = (id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    alert('Requested changes with editorial feedback sent to the author.');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Publication Hero Banner */}
      <div className="bg-gray-950 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-8">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=240&q=80"
            alt="Publication Logo"
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white/10 shadow-lg"
          />
          <div className="text-center sm:text-left flex-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
              Verified Publication
            </span>
            <h1 className="font-serif font-black text-3xl sm:text-5xl tracking-tight mt-1">
              Architectural Horizons
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mt-3 font-sans leading-relaxed">
              In-depth perspectives on modern distributed software engineering, consensus algorithms, and fault-tolerant cloud architecture.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <button
            onClick={() => setActiveTab('stories')}
            className={`py-4 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'stories' ? 'text-gray-950 border-b-2 border-gray-950' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Stories (2)
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`py-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              activeTab === 'submissions' ? 'text-gray-950 border-b-2 border-gray-950' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Editorial Review Queue
            {submissions.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {submissions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('editors')}
            className={`py-4 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'editors' ? 'text-gray-950 border-b-2 border-gray-950' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Editorial Board
          </button>
        </div>

        <Link
          href="/write"
          className="text-xs font-semibold bg-gray-900 text-white px-3.5 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
        >
          Submit Story
        </Link>
      </div>

      {/* Tab Panels */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'stories' && (
          <div className="divide-y divide-gray-100">
            <article className="py-6">
              <Link href="/story/architecting-resilient-distributed-systems">
                <h3 className="font-serif font-bold text-2xl text-gray-950 hover:text-emerald-700 transition-colors">
                  Architecting Resilient Distributed Systems for High-Throughput Workloads
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  How to combine backpressure, circuit breakers, and stateful partitioned queues to withstand unpredictable traffic storms.
                </p>
              </Link>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span>By Elena Rostova</span>
                <span>·</span>
                <span>4 min read</span>
                <span>·</span>
                <span>Nov 14, 2026</span>
              </div>
            </article>

            <article className="py-6">
              <Link href="/story/advanced-raft-consensus-internals">
                <h3 className="font-serif font-bold text-2xl text-gray-950 hover:text-emerald-700 transition-colors">
                  Advanced Raft Consensus Internals: Log Compaction and Leader Leases
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  An exclusive deep-dive into snapshot serialization, disk flush latency, and lease-based linearizable reads.
                </p>
              </Link>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span>By Elena Rostova</span>
                <span>·</span>
                <span>6 min read</span>
                <span>·</span>
                <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                  ★ Members Only
                </span>
              </div>
            </article>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <h3 className="font-sans font-bold text-sm text-gray-900 uppercase tracking-wider mb-2">
              Pending Submissions Requiring Editorial Review
            </h3>
            {submissions.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded-xl">
                Editorial queue is clear. No pending submissions.
              </p>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} className="p-6 border border-gray-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shadow-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <img src={sub.authorAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-xs font-semibold text-gray-900">{sub.author}</span>
                      <span className="text-xs text-gray-400">· {sub.submittedAt}</span>
                    </div>
                    <h4 className="font-serif font-bold text-xl text-gray-900">{sub.title}</h4>
                    <span className="text-xs text-gray-500">{sub.readingTime}</span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleRequestChanges(sub.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => handleApprove(sub.id)}
                      className="text-xs font-semibold px-4 py-1.5 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve & Publish
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'editors' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-100 rounded-xl flex items-center gap-4 bg-gray-50/50">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                alt="Elena"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-sm text-gray-950">Elena Rostova</h4>
                <p className="text-xs text-emerald-700 font-semibold">Publication Owner & Chief Editor</p>
              </div>
            </div>

            <div className="p-4 border border-gray-100 rounded-xl flex items-center gap-4 bg-gray-50/50">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                alt="Marcus"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-sm text-gray-950">Marcus Chen</h4>
                <p className="text-xs text-blue-700 font-semibold">Senior Editor</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
