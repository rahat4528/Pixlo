'use client';

import React from 'react';
import { Search, Pin, Star, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface NoteListProps {
  notes: any[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  titleHeader: string;
}

export function NoteList({
  notes,
  activeNoteId,
  onSelectNote,
  searchQuery,
  onSearchChange,
  titleHeader,
}: NoteListProps) {
  return (
    <div className="w-80 border-r border-slate-200 bg-white flex flex-col h-screen shrink-0">
      {/* Header & Search */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 tracking-wide">{titleHeader}</h2>
          <span className="text-xs text-slate-500 font-medium">{notes.length} notes</span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes and tags..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Note Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {notes.length > 0 ? (
          notes.map((note) => {
            const isActive = note.id === activeNoteId;
            const updatedTime = formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true });

            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`p-3.5 cursor-pointer transition select-none flex flex-col justify-between ${
                  isActive
                    ? 'bg-emerald-50/60 border-l-4 border-emerald-600'
                    : 'hover:bg-slate-50 border-l-4 border-transparent'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-500 truncate max-w-[140px]">
                      {note.notebook?.name || 'Inbox'}
                    </span>
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      {note.isPinned && <Pin className="w-3 h-3 text-emerald-600 fill-emerald-600" />}
                      {note.isStarred && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                      <span className="font-mono text-[10px] bg-slate-100 px-1 rounded text-slate-600">
                        v{note.serverRevision}
                      </span>
                    </div>
                  </div>

                  <h3
                    className={`font-semibold text-xs leading-snug line-clamp-1 ${
                      isActive ? 'text-emerald-950 font-bold' : 'text-slate-800'
                    }`}
                  >
                    {note.title || 'Untitled Note'}
                  </h3>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal">
                    {note.plainText || note.content?.slice(0, 80) || 'No additional text'}
                  </p>
                </div>

                <div className="mt-2 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{updatedTime}</span>
                  {note.title?.includes('[Conflict Copy]') && (
                    <span className="text-red-600 font-bold flex items-center space-x-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>Conflict</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No notes found. Click "New Note" to create your first note.
          </div>
        )}
      </div>
    </div>
  );
}
