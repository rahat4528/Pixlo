'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, MessageSquare, Share2, Sparkles, Lock, ArrowLeft, Send } from 'lucide-react';

export default function StoryPage({ params }: { params: { slug: string } }) {
  const [claps, setClaps] = useState(88);
  const [hasClapped, setHasClapped] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
      time: '2 hours ago',
      content: 'Exceptional breakdown of circuit breaker states! How do you handle half-open state probing in high-traffic services?',
      replies: [
        {
          id: 'c2',
          author: 'Elena Rostova',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
          time: '1 hour ago',
          content: 'Great question David. We use canary trial percentages: allowing only 1% of incoming traffic through while half-open rather than a binary switch.',
        },
      ],
    },
  ]);

  const handleClap = () => {
    setClaps((prev) => prev + 1);
    setHasClapped(true);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      {
        id: `c_${Date.now()}`,
        author: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        time: 'Just now',
        content: newComment.trim(),
        replies: [],
      },
      ...comments,
    ]);
    setNewComment('');
  };

  const isMembersStory = params.slug === 'advanced-raft-consensus-internals';

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Top Breadcrumb / Return */}
      <div className="max-w-reading mx-auto px-4 pt-8">
        <Link href="/" className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to feed
        </Link>
      </div>

      <article className="max-w-reading mx-auto px-4">
        {/* Story Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/publication/architectural-horizons" className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition-colors">
              Architectural Horizons
            </Link>
            {isMembersStory && (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Member exclusive
              </span>
            )}
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-gray-950 leading-[1.15] tracking-tight">
            {isMembersStory
              ? 'Advanced Raft Consensus Internals: Log Compaction and Leader Leases'
              : 'Architecting Resilient Distributed Systems for High-Throughput Workloads'}
          </h1>

          <p className="mt-4 font-sans text-xl text-gray-600 leading-relaxed">
            {isMembersStory
              ? 'An exclusive deep-dive into snapshot serialization, disk flush latency, and lease-based linearizable reads.'
              : 'How to combine backpressure, circuit breakers, and stateful partitioned queues to withstand unpredictable traffic storms.'}
          </p>

          {/* Author Card Banner */}
          <div className="mt-8 py-5 border-y border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <Link href="/author/elena_writes">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                  alt="Elena Rostova"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link href="/author/elena_writes" className="text-sm font-bold text-gray-950 hover:underline">
                    Elena Rostova
                  </Link>
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors ${
                      isFollowing ? 'bg-gray-100 text-gray-700' : 'text-emerald-700 hover:text-emerald-800'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                  <span>Published in Architectural Horizons</span>
                  <span>·</span>
                  <span>4 min read</span>
                  <span>·</span>
                  <span>Nov 14, 2026</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-500">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-full hover:bg-gray-100 ${isBookmarked ? 'text-gray-900' : ''}`}
                title="Bookmark story"
              >
                <Bookmark className="w-5 h-5 fill-current" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100" title="Share story">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Hero Cover Image */}
        <figure className="my-10">
          <img
            src={
              isMembersStory
                ? 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
                : 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80'
            }
            alt="Architecture diagram"
            className="w-full rounded-xl object-cover max-h-[460px]"
          />
          <figcaption className="text-center text-xs text-gray-500 mt-2.5 font-sans">
            Distributed message topology under synthetic spike load testing.
          </figcaption>
        </figure>

        {/* Editorial Body Content */}
        <div className="article-content font-serif">
          <h2>1. The Illusion of Synchronous Reliability</h2>
          <p>
            Every distributed architecture is susceptible to latency degradation when downstream services become saturated. A ubiquitous failure pattern is relying on cascade calls without bounded timeouts, which transforms isolated tail-latency into cascading infrastructure outages.
          </p>

          <blockquote>
            &ldquo;In distributed computing, assuming remote network calls will complete within standard SLAs is the single most expensive assumption an engineer can make.&rdquo;
          </blockquote>

          <p>
            To address this, we couple bounded timeouts with adaptive concurrency limits. When downstream p99 response times rise above historical thresholds, incoming requests are buffered or shed before thread pools exhaust.
          </p>

          <h2>2. The Deterministic Circuit Breaker</h2>
          <p>
            Consider a production-grade circuit breaker implemented with strict state transitions between Closed, Open, and Half-Open:
          </p>

          <pre>
            <code className="language-typescript">
{`export class CircuitBreaker {
  private failureThreshold = 5;
  private recoveryTimeMs = 10000;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      throw new Error('Circuit Breaker is OPEN: fast failing request');
    }
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }
}`}
            </code>
          </pre>

          {isMembersStory && (
            <div className="my-12 p-8 rounded-2xl bg-gradient-to-b from-amber-50/50 to-orange-50/30 border border-amber-200 text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-xl text-gray-900 mb-2">Member Exclusive Story</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                This story is part of Elena Rostova's premium architectural series. Upgrade your membership to read the complete mathematical analysis and code implementation.
              </p>
              <button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm px-6 py-2.5 rounded-full shadow-sm transition-colors">
                Become a Member — $5/month
              </button>
            </div>
          )}

          <h2>3. Summary & Production Takeaways</h2>
          <p>
            Designing resilient distributed systems requires treating network partitions and latency spikes as normal operating conditions. Applying explicit state machines and strict backpressure boundaries ensures predictable system stability.
          </p>
        </div>

        {/* Tags Section */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
          {['Distributed Systems', 'Software Architecture', 'TypeScript', 'Performance'].map((tag) => (
            <Link
              key={tag}
              href={`/?tag=${tag.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </article>

      {/* Floating Engagement Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-gray-200 rounded-full shadow-lg px-6 py-2.5 flex items-center gap-6">
        <button
          onClick={handleClap}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-emerald-700 transition-colors group"
        >
          <span className="text-xl group-hover:scale-125 transition-transform">👏</span>
          <span>{claps}</span>
        </button>

        <div className="h-4 w-px bg-gray-200" />

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
        >
          <MessageSquare className="w-4 h-4 text-gray-500" />
          <span>{comments.length}</span>
        </button>

        <div className="h-4 w-px bg-gray-200" />

        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`text-gray-500 hover:text-gray-900 transition-colors ${isBookmarked ? 'text-gray-900' : ''}`}
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>

        <button className="text-gray-500 hover:text-gray-900 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Threaded Discussion Drawer */}
      {showComments && (
        <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white shadow-2xl border-l border-gray-200 p-6 flex flex-col animate-in slide-in-from-right">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="font-sans font-bold text-lg text-gray-900">
              Responses ({comments.length})
            </h3>
            <button
              onClick={() => setShowComments(false)}
              className="text-gray-400 hover:text-gray-700 font-bold text-sm"
            >
              ✕
            </button>
          </div>

          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className="my-5">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What are your thoughts?"
              rows={3}
              className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Respond
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-6 divide-y divide-gray-100 pr-2">
            {comments.map((c) => (
              <div key={c.id} className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={c.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs font-bold text-gray-900">{c.author}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{c.time}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">{c.content}</p>

                {/* Nested Replies */}
                {c.replies && c.replies.length > 0 && (
                  <div className="ml-5 pl-3 border-l-2 border-gray-100 space-y-3 mt-3">
                    {c.replies.map((r) => (
                      <div key={r.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <img src={r.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                          <span className="text-xs font-semibold text-gray-900">{r.author}</span>
                          <span className="text-[10px] text-gray-400">{r.time}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed font-sans">{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
