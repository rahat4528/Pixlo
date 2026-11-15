'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Upload, Search, CheckCircle, Clock, AlertOctagon, UserX, Trash2 } from 'lucide-react';

export default function SubscribersPage() {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [useDoubleOptIn, setUseDoubleOptIn] = useState(true);

  const [csvContent, setCsvContent] = useState('email,firstName,lastName\nsam.carter@example.com,Sam,Carter\npat.taylor@example.com,Pat,Taylor');
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const [subscribers, setSubscribers] = useState([
    { id: '1', email: 'alex.dev@example.com', firstName: 'Alex', lastName: 'Rivera', status: 'CONFIRMED', joined: 'Jan 10, 2026' },
    { id: '2', email: 'elena.tech@example.com', firstName: 'Elena', lastName: 'Rostova', status: 'CONFIRMED', joined: 'Jan 15, 2026' },
    { id: '3', email: 'marcus.eng@example.com', firstName: 'Marcus', lastName: 'Vance', status: 'CONFIRMED', joined: 'Feb 01, 2026' },
    { id: '4', email: 'chloe.sys@example.com', firstName: 'Chloe', lastName: 'Dupont', status: 'CONFIRMED', joined: 'Feb 12, 2026' },
    { id: '5', email: 'pending.reader@example.com', firstName: 'Jordan', lastName: 'Lee', status: 'PENDING_CONFIRMATION', joined: 'Feb 14, 2026' },
    { id: '6', email: 'unsub.reader@example.com', firstName: 'David', lastName: 'Miller', status: 'UNSUBSCRIBED', joined: 'Jan 05, 2026' },
    { id: '7', email: 'bounced.box@example.com', firstName: 'Invalid', lastName: 'Box', status: 'CLEANED', joined: 'Jan 01, 2026' },
  ]);

  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    const newSub = {
      id: `sub_${Date.now()}`,
      email: newEmail,
      firstName: newFirstName,
      lastName: newLastName,
      status: useDoubleOptIn ? 'PENDING_CONFIRMATION' : 'CONFIRMED',
      joined: 'Just now',
    };

    setSubscribers([newSub, ...subscribers]);
    setShowAddModal(false);
    setNewEmail('');
    setNewFirstName('');
    setNewLastName('');
  };

  const handleImportCsv = () => {
    const lines = csvContent.trim().split('\n').slice(1);
    let count = 0;
    const imported = lines.map((line) => {
      const parts = line.split(',');
      count++;
      return {
        id: `sub_csv_${Date.now()}_${count}`,
        email: parts[0]?.trim() || '',
        firstName: parts[1]?.trim() || '',
        lastName: parts[2]?.trim() || '',
        status: 'CONFIRMED',
        joined: 'Just now (CSV)',
      };
    }).filter(s => s.email.includes('@'));

    setSubscribers([...imported, ...subscribers]);
    setImportSummary(`Successfully imported ${imported.length} subscribers.`);
    setTimeout(() => {
      setShowImportModal(false);
      setImportSummary(null);
    }, 1500);
  };

  const filtered = subscribers.filter((s) => {
    if (activeTab !== 'ALL' && s.status !== activeTab) return false;
    if (search) {
      const matchEmail = s.email.toLowerCase().includes(search.toLowerCase());
      const matchFirst = s.firstName.toLowerCase().includes(search.toLowerCase());
      const matchLast = s.lastName.toLowerCase().includes(search.toLowerCase());
      if (!matchEmail && !matchFirst && !matchLast) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audience & Subscribers</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage subscriber records, double opt-in statuses, and suppression lists
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 transition shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Subscriber</span>
          </button>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between gap-3 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search audience by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'ALL', label: 'All Subscribers' },
            { id: 'CONFIRMED', label: 'Confirmed' },
            { id: 'PENDING_CONFIRMATION', label: 'Pending Opt-in' },
            { id: 'UNSUBSCRIBED', label: 'Unsubscribed' },
            { id: 'CLEANED', label: 'Cleaned / Bounced' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5 font-semibold">Subscriber</th>
              <th className="px-6 py-3.5 font-semibold">Lifecycle Status</th>
              <th className="px-6 py-3.5 font-semibold">Onboarded</th>
              <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {sub.firstName ? sub.firstName[0] : sub.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{sub.firstName} {sub.lastName}</p>
                      <p className="text-xs text-slate-500 font-mono">{sub.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sub.status === 'CONFIRMED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : sub.status === 'PENDING_CONFIRMATION'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : sub.status === 'UNSUBSCRIBED'
                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {sub.status === 'CONFIRMED' && <CheckCircle className="w-3 h-3 mr-1 inline" />}
                    {sub.status === 'PENDING_CONFIRMATION' && <Clock className="w-3 h-3 mr-1 inline" />}
                    {sub.status === 'UNSUBSCRIBED' && <UserX className="w-3 h-3 mr-1 inline" />}
                    {sub.status === 'CLEANED' && <AlertOctagon className="w-3 h-3 mr-1 inline" />}
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">{sub.joined}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSubscribers(subscribers.filter(s => s.id !== sub.id))}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                    title="Remove subscriber"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddSubscriber} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Subscriber</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="doubleOptIn"
                checked={useDoubleOptIn}
                onChange={(e) => setUseDoubleOptIn(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <label htmlFor="doubleOptIn" className="text-xs text-slate-600">
                Send double opt-in confirmation email first
              </label>
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition"
              >
                Add Subscriber
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Import Subscribers from CSV</h3>
            <p className="text-xs text-slate-500">
              Paste CSV text formatted as <code>email,firstName,lastName</code>. Imported entries are assigned to the default subscriber list.
            </p>
            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {importSummary && (
              <p className="text-xs font-semibold text-emerald-600">{importSummary}</p>
            )}
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportCsv}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition"
              >
                Import Subscribers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
