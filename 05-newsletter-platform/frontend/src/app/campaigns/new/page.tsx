'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, Eye, Smartphone, Monitor, ChevronLeft, Check, Sparkles, Mail, AlertCircle } from 'lucide-react';

export default function CampaignComposerPage() {
  const [title, setTitle] = useState('Issue #43: High-Throughput Event Ingestion with Kafka and BullMQ');
  const [subject, setSubject] = useState('Issue #43: Backpressure strategies and idempotent processing');
  const [previewText, setPreviewText] = useState('How modern architectures prevent message loss and consumer starvation.');
  const [htmlBody, setHtmlBody] = useState(`<h2>Scaling Event Ingestion Pipelines</h2>
<p>Hello {{subscriber.firstName}},</p>
<p>When message ingestion peaks during product launches or market events, message consumer workers can quickly experience thread starvation.</p>
<p>In this edition, we analyze how token-bucket rate limiters combined with dead-letter queue (DLQ) replay strategies guarantee at-least-once delivery without dropping mission-critical events.</p>
<p><a href="https://disruption.pixlo.local/articles/high-throughput-ingestion" style="display:inline-block;padding:10px 16px;background:#0284c7;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:600;">Read Full Analysis Online</a></p>`);

  const [devicePreview, setDevicePreview] = useState<'desktop' | 'mobile'>('desktop');
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('author@pixlonewsletter.local');
  const [testSent, setTestSent] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const mergeTags = [
    { tag: '{{subscriber.name}}', desc: 'Full Name' },
    { tag: '{{subscriber.firstName}}', desc: 'First Name' },
    { tag: '{{subscriber.email}}', desc: 'Email' },
    { tag: '{{publication.name}}', desc: 'Publication' },
    { tag: '{{unsubscribe_url}}', desc: 'Unsubscribe Link' },
  ];

  const insertMergeTag = (tag: string) => {
    setHtmlBody((prev) => `${prev} ${tag}`);
  };

  const handleSendTest = () => {
    setTestSent(true);
    setTimeout(() => {
      setShowTestModal(false);
      setTestSent(false);
    }, 1500);
  };

  const handleDispatch = () => {
    setDispatchStatus('QUEUED');
    setTimeout(() => {
      setDispatchStatus('DISPATCHED');
    }, 2000);
  };

  // Preview replacement
  const renderedPreview = htmlBody
    .replace(/{{subscriber\.name}}/g, 'Alex Rivera')
    .replace(/{{subscriber\.firstName}}/g, 'Alex')
    .replace(/{{subscriber\.email}}/g, 'alex.dev@example.com')
    .replace(/{{publication\.name}}/g, 'The Weekly Disruption')
    .replace(/{{unsubscribe_url}}/g, '#unsubscribe');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/campaigns"
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Campaign Composer</h1>
            <p className="text-xs text-slate-500">Craft, test, and broadcast to your verified subscribers</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTestModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm flex items-center space-x-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Test Preview</span>
          </button>

          <button
            onClick={handleDispatch}
            disabled={dispatchStatus === 'QUEUED'}
            className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 transition shadow-sm disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{dispatchStatus === 'QUEUED' ? 'Queueing...' : dispatchStatus === 'DISPATCHED' ? 'Sent!' : 'Dispatch to 1,420 Subscribers'}</span>
          </button>
        </div>
      </div>

      {dispatchStatus === 'DISPATCHED' && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Campaign successfully queued and dispatched to the worker delivery pipeline!</span>
        </div>
      )}

      {/* Main 2-column workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Editor Column */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Email Configuration</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Campaign Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Preview Text (Snippet)</label>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Content (HTML / Markdown)</label>
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-sky-600" />
                <span className="text-[11px] font-semibold text-sky-600">Merge Tags:</span>
              </div>
            </div>

            {/* Merge tags picker */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {mergeTags.map((mt) => (
                <button
                  key={mt.tag}
                  type="button"
                  onClick={() => insertMergeTag(mt.tag)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-[11px] font-mono text-slate-600 border border-slate-200 transition"
                  title={mt.desc}
                >
                  {mt.tag}
                </button>
              ))}
            </div>

            <textarea
              rows={12}
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              className="w-full p-3 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Live Device Preview Column */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Live Client Preview</h2>
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setDevicePreview('desktop')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center space-x-1 transition ${
                  devicePreview === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDevicePreview('mobile')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center space-x-1 transition ${
                  devicePreview === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* Preview Canvas */}
          <div
            className={`transition-all duration-300 border border-slate-300 bg-white shadow-md rounded-lg overflow-hidden ${
              devicePreview === 'mobile' ? 'w-[360px] min-h-[500px]' : 'w-full min-h-[500px]'
            }`}
          >
            {/* Mock client header */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 text-xs text-slate-600 space-y-0.5">
              <p><strong className="text-slate-800">From:</strong> Sarah from Weekly Disruption &lt;sarah@disruption.pixlo.local&gt;</p>
              <p><strong className="text-slate-800">To:</strong> Alex Rivera &lt;alex.dev@example.com&gt;</p>
              <p><strong className="text-slate-800">Subject:</strong> {subject}</p>
            </div>

            {/* Rendered Email Body */}
            <div className="p-6 text-slate-800 text-sm leading-relaxed space-y-4">
              <div className="border-b-2 border-slate-100 pb-3">
                <h1 className="text-xl font-bold text-slate-900">The Weekly Disruption</h1>
                <p className="text-xs text-slate-400">Independent Architectural Insights</p>
              </div>

              <div
                className="prose prose-sm max-w-none text-slate-700"
                dangerouslySetInnerHTML={{ __html: renderedPreview }}
              />

              {/* RFC 8058 Guaranteed Unsubscribe Footer */}
              <div className="border-t border-slate-200 pt-4 mt-6 text-center text-xs text-slate-400 space-y-1">
                <p>You received this email because you subscribed to The Weekly Disruption as alex.dev@example.com.</p>
                <p>
                  <a href="#unsubscribe" className="text-slate-500 underline">One-click unsubscribe</a> &bull;{' '}
                  <a href="#preferences" className="text-slate-500 underline">Preferences</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Send Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Send Test Preview Email</h3>
            <p className="text-xs text-slate-500">
              Dispatches a test edition with populated demo merge tags to verify layout across email clients.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Email</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendTest}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition flex items-center space-x-1.5"
              >
                {testSent ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                <span>{testSent ? 'Sent!' : 'Send Test'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
