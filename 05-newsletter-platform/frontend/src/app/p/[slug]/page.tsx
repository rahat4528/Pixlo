'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle, ArrowRight, ShieldCheck, Calendar, BookOpen, Send } from 'lucide-react';

export default function PublicPublicationLandingPage({ params }: { params: { slug: string } }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const publication = {
    name: 'The Weekly Disruption',
    slug: params.slug || 'weekly-disruption',
    description:
      'Independent deep dives on emerging software architectures, distributed systems, resilient queues, and modern production engineering.',
    author: 'Sarah Publisher',
    subscriberCount: 1420,
    cadence: 'Every Thursday morning',
  };

  const archive = [
    {
      issue: 'Issue #42',
      title: 'The Resilient Outbox Pattern in Production',
      snippet: 'Eliminating dual-write anomalies across distributed microservices using PostgreSQL and transactional CDC streams.',
      date: 'Feb 15, 2026',
      readTime: '8 min read',
    },
    {
      issue: 'Issue #41',
      title: 'Distributed Rate Limiting with Redis & Leaky Bucket',
      snippet: 'Architecting global rate limiters without creating latency bottlenecks or throttling legitimate users.',
      date: 'Feb 08, 2026',
      readTime: '6 min read',
    },
    {
      issue: 'Issue #40',
      title: 'Optimistic Concurrency Control vs Pessimistic Locks',
      snippet: 'Comparative analysis of version stamps, 3-way text merging, and lock escalations in collaborative platforms.',
      date: 'Feb 01, 2026',
      readTime: '10 min read',
    },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStatusMessage(`Verification link dispatched to ${email}! Please click the link in your inbox to confirm.`);
      setEmail('');
      setFirstName('');
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Publication Hero Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white text-3xl font-extrabold shadow-md">
          WD
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {publication.name}
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          {publication.description}
        </p>
        <div className="flex items-center justify-center space-x-4 text-xs font-medium text-slate-500 pt-1">
          <span>By {publication.author}</span>
          <span>&bull;</span>
          <span>{publication.subscriberCount.toLocaleString()} Subscribers</span>
          <span>&bull;</span>
          <span>{publication.cadence}</span>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-xl mx-auto space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Subscribe to Free Weekly Issues</h2>
          <p className="text-xs text-slate-500">
            No spam. RFC 8058 one-click unsubscription in every issue.
          </p>
        </div>

        {statusMessage ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Check your inbox!</p>
              <p className="mt-0.5">{statusMessage}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First name (optional)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="email"
                required
                placeholder="Your email address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-sky-600 text-white rounded-lg text-sm font-bold hover:bg-sky-700 transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Sending verification...' : 'Subscribe Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Double opt-in verified. You can unsubscribe at any moment with 1 click.</span>
            </div>
          </form>
        )}
      </div>

      {/* Published Issues Archive */}
      <div className="space-y-4 max-w-2xl mx-auto">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Recent Editions</h3>
        <div className="space-y-3">
          {archive.map((post) => (
            <div
              key={post.issue}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                  {post.issue}
                </span>
                <div className="flex items-center space-x-2">
                  <span>{post.date}</span>
                  <span>&bull;</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
              <h4 className="text-base font-bold text-slate-900">{post.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{post.snippet}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
