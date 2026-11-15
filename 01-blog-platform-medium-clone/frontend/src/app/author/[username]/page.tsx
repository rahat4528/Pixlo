'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Sparkles, Twitter, Globe, Github } from 'lucide-react';

export default function AuthorProfilePage({ params }: { params: { username: string } }) {
  const [isFollowing, setIsFollowing] = useState(false);

  const author = {
    displayName: 'Elena Rostova',
    username: params.username || 'elena_writes',
    bio: 'Principal Distributed Systems Architect. Writes about consensus protocols, resilient telemetry, and zero-downtime scaling.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    followersCount: 1420,
    followingCount: 88,
    isPaidAuthor: true,
  };

  const stories = [
    {
      id: '1',
      title: 'Architecting Resilient Distributed Systems for High-Throughput Workloads',
      excerpt: 'How to combine backpressure, circuit breakers, and stateful partitioned queues to withstand unpredictable traffic storms.',
      slug: 'architecting-resilient-distributed-systems',
      publishedAt: 'Nov 14, 2026',
      readingTimeMinutes: 4,
      applauseCount: 88,
      isMembersOnly: false,
    },
    {
      id: '2',
      title: 'Advanced Raft Consensus Internals: Log Compaction and Leader Leases',
      excerpt: 'An exclusive deep-dive into snapshot serialization, disk flush latency, and lease-based linearizable reads.',
      slug: 'advanced-raft-consensus-internals',
      publishedAt: 'Nov 15, 2026',
      readingTimeMinutes: 6,
      applauseCount: 42,
      isMembersOnly: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Stories Column */}
        <div className="lg:col-span-8">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-gray-500">
              Published Stories ({stories.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {stories.map((story) => (
              <article key={story.id} className="py-6 group">
                <Link href={`/story/${story.slug}`}>
                  <h3 className="font-serif font-bold text-2xl text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {story.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {story.excerpt}
                  </p>
                </Link>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span>{story.publishedAt}</span>
                    <span>·</span>
                    <span>{story.readingTimeMinutes} min read</span>
                    {story.isMembersOnly && (
                      <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                        ★ Members Only
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-gray-700 font-medium">
                    👏 {story.applauseCount}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Author Bio Card Sidebar */}
        <aside className="lg:col-span-4 border-l border-gray-100 pl-0 lg:pl-10">
          <div className="sticky top-24 space-y-6">
            <img
              src={author.avatarUrl}
              alt={author.displayName}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-50 shadow-sm"
            />
            <div>
              <h1 className="font-serif font-bold text-2xl text-gray-950">{author.displayName}</h1>
              <p className="text-xs text-gray-500 mt-0.5">@{author.username}</p>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed font-sans">{author.bio}</p>

            <div className="flex items-center gap-6 text-xs text-gray-500 font-medium">
              <span><strong className="text-gray-900">{author.followersCount.toLocaleString()}</strong> Followers</span>
              <span><strong className="text-gray-900">{author.followingCount}</strong> Following</span>
            </div>

            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`w-full py-2.5 rounded-full text-xs font-semibold transition-colors ${
                isFollowing
                  ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow Author'}
            </button>

            {author.isPaidAuthor && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <p className="font-semibold mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Support Elena's Writing
                </p>
                <p className="text-emerald-700">Get access to exclusive consensus design series and member-only discussions.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
