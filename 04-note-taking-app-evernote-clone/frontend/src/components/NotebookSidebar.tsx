'use client';

import React from 'react';
import Link from 'next/link';
import {
  Book,
  Folder,
  FileText,
  Star,
  Trash2,
  Tag,
  Plus,
  RefreshCw,
  Laptop,
  Globe,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export interface SidebarProps {
  currentFilter: string;
  onSelectFilter: (filter: string, id?: string) => void;
  onCreateNote: () => void;
  syncState: 'LOCAL_ONLY' | 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'CONFLICT' | 'ERROR';
  notebooks: any[];
  stacks: any[];
  tags: any[];
  totalNotesCount: number;
  trashCount: number;
}

export function NotebookSidebar({
  currentFilter,
  onSelectFilter,
  onCreateNote,
  syncState,
  notebooks,
  stacks,
  tags,
  totalNotesCount,
  trashCount,
}: SidebarProps) {
  const getSyncBadge = () => {
    switch (syncState) {
      case 'SYNCED':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Synced</span>
          </span>
        );
      case 'SYNCING':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40 animate-pulse">
            <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
            <span>Syncing...</span>
          </span>
        );
      case 'PENDING_SYNC':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Pending Sync</span>
          </span>
        );
      case 'CONFLICT':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-800/40">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span>Conflict Copy</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            <span>Offline</span>
          </span>
        );
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between h-screen border-r border-slate-800 select-none">
      {/* Top Workspace Header */}
      <div className="p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
              P
            </div>
            <div>
              <h1 className="font-bold text-sm text-white leading-tight">Pixlo Notes</h1>
              <p className="text-[10px] text-slate-400">Personal Workspace</p>
            </div>
          </div>
          {getSyncBadge()}
        </div>

        {/* New Note Action Button */}
        <button
          onClick={onCreateNote}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>

        {/* Primary Views */}
        <div className="space-y-0.5 text-xs">
          <button
            onClick={() => onSelectFilter('ALL')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
              currentFilter === 'ALL'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>All Notes</span>
            </div>
            <span className="text-[11px] text-slate-500">{totalNotesCount}</span>
          </button>

          <button
            onClick={() => onSelectFilter('STARRED')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
              currentFilter === 'STARRED'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Starred</span>
            </div>
          </button>

          <button
            onClick={() => onSelectFilter('REMINDERS')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
              currentFilter === 'REMINDERS'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span>Reminders</span>
            </div>
          </button>

          <button
            onClick={() => onSelectFilter('TRASH')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
              currentFilter === 'TRASH'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Trash</span>
            </div>
            {trashCount > 0 && (
              <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded">
                {trashCount}
              </span>
            )}
          </button>
        </div>

        {/* Notebooks & Stacks Section */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Notebooks</span>
            <Book className="w-3.5 h-3.5" />
          </div>

          <div className="space-y-1 text-xs">
            {notebooks.map((nb) => (
              <button
                key={nb.id}
                onClick={() => onSelectFilter('NOTEBOOK', nb.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition ${
                  currentFilter === `NOTEBOOK_${nb.id}`
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: nb.color || '#4f46e5' }}
                  />
                  <span className="truncate">{nb.name}</span>
                </div>
                <span className="text-[10px] text-slate-500">{nb._count?.notes || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tags Section */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Tags</span>
            <Tag className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-wrap gap-1.5 px-1">
            {tags.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectFilter('TAG', t.id)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white transition"
              >
                #{t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Device Sessions & Tools Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs space-y-1">
        <Link
          href="/sessions"
          className="flex items-center space-x-2 px-3 py-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Device Sessions</span>
        </Link>
      </div>
    </aside>
  );
}
