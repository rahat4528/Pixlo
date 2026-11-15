'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Eye, Sparkles, Check, Calendar, History, Send } from 'lucide-react';

export default function WritePage() {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [tags, setTags] = useState('distributed-systems, performance');
  const [category, setCategory] = useState('Software Architecture');
  const [publication, setPublication] = useState('none');
  const [isMembersOnly, setIsMembersOnly] = useState(false);
  const [readingTime, setReadingTime] = useState(1);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  // Live Reading Time Engine calculation
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setReadingTime(minutes);

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      setSaveStatus('saved');
    }, 600);
    return () => clearTimeout(timer);
  }, [content, title, excerpt]);

  const handlePublish = (status: 'PUBLISHED' | 'SCHEDULED' | 'SUBMITTED') => {
    setPublishedSuccess(true);
    setShowScheduleModal(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Action Toolbar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 py-3 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
            {saveStatus === 'saving' ? (
              <span className="text-amber-600 animate-pulse">Autosaving revision...</span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {readingTime} min read
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-full border border-gray-200 transition-colors flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5" /> Schedule
          </button>
          <button
            onClick={() => handlePublish(publication !== 'none' ? 'SUBMITTED' : 'PUBLISHED')}
            className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-1.5 rounded-full transition-colors flex items-center gap-1"
          >
            {publication !== 'none' ? 'Submit to Publication' : 'Publish Story'}
          </button>
        </div>
      </div>

      {publishedSuccess && (
        <div className="max-w-reading mx-auto mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm flex items-center justify-between">
          <span>Your article has been successfully registered in the editorial pipeline!</span>
          <Link href="/" className="font-semibold underline ml-2">
            View in feed
          </Link>
        </div>
      )}

      {/* Editor Canvas */}
      <main className="max-w-reading mx-auto px-4 py-12">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full font-serif font-black text-4xl sm:text-5xl placeholder-gray-300 border-none outline-none text-gray-950 tracking-tight mb-4"
        />

        <input
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Write a clear, compelling subtitle..."
          className="w-full font-sans text-xl placeholder-gray-300 border-none outline-none text-gray-600 mb-8"
        />

        <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
          <input
            type="text"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="Paste cover image URL (e.g., https://images.unsplash.com/...)"
            className="w-full text-xs font-mono bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
          />
          {coverImageUrl && (
            <img src={coverImageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
          )}
        </div>

        {/* Composition Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell your story... Use Markdown or formatted blocks."
          rows={18}
          className="w-full font-serif text-lg leading-relaxed placeholder-gray-300 border-none outline-none resize-none text-gray-900"
        />

        {/* Story Metadata & Publication Options */}
        <div className="mt-12 pt-8 border-t border-gray-100 space-y-6">
          <h3 className="font-sans font-bold text-sm tracking-wide uppercase text-gray-900">
            Editorial Controls & Classification
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-gray-900"
              >
                <option value="Software Architecture">Software Architecture</option>
                <option value="Frontend Craft">Frontend Craft</option>
                <option value="Distributed Systems">Distributed Systems</option>
                <option value="Engineering Leadership">Engineering Leadership</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Publication</label>
              <select
                value={publication}
                onChange={(e) => setPublication(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-gray-900"
              >
                <option value="none">Independent Story (Personal)</option>
                <option value="architectural-horizons">Architectural Horizons (Requires Review)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="distributed-systems, performance, typescript"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-900"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="membersOnly"
              checked={isMembersOnly}
              onChange={(e) => setIsMembersOnly(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
            />
            <label htmlFor="membersOnly" className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Make this story exclusive to paid members (Server-side paywall enabled)
            </label>
          </div>
        </div>
      </main>

      {/* Schedule Publishing Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-sans font-bold text-lg text-gray-900">Schedule Story Release</h3>
            <p className="text-xs text-gray-500">
              Select a future publication timestamp. Pixlo's background queue will transition the article to PUBLISHED automatically.
            </p>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg p-2.5 outline-none focus:border-gray-900"
            />
            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-xs font-semibold px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePublish('SCHEDULED')}
                className="text-xs font-semibold px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800"
              >
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
