'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Pin,
  Star,
  Trash2,
  Download,
  History,
  CheckCircle,
  Clock,
  RotateCcw,
  Tag,
  Book,
  Code,
  CheckSquare,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface NoteEditorProps {
  note: any | null;
  onSave: (updates: { title?: string; content?: string }) => void;
  onTogglePin: (id: string) => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
  onRestoreRevision: (noteId: string, revisionNumber: number) => void;
  notebooks: any[];
}

export function NoteEditor({
  note,
  onSave,
  onTogglePin,
  onToggleStar,
  onDelete,
  onRestoreRevision,
  notebooks,
}: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'SAVED' | 'SAVING'>('SAVED');
  const [showHistory, setShowHistory] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setSaveStatus('SAVED');
    }
  }, [note?.id]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    triggerDebouncedSave(newTitle, content);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    triggerDebouncedSave(title, newContent);
  };

  const triggerDebouncedSave = (t: string, c: string) => {
    setSaveStatus('SAVING');
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      onSave({ title: t, content: c });
      setSaveStatus('SAVED');
    }, 800);
  };

  const handleExportMarkdown = () => {
    if (!note) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'note'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
        Select a note from the list or create a new one to begin editing.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-white overflow-hidden">
      {/* Editor Top Utility Header */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 font-medium bg-slate-100 px-2 py-1 rounded">
            <Book className="w-3.5 h-3.5 text-slate-500" />
            <span>{note.notebook?.name || 'Inbox'}</span>
          </span>

          <span className="text-slate-400 font-mono text-[11px]">
            Server Revision: <strong>v{note.serverRevision}</strong>
          </span>

          {/* Autosave status indicator */}
          <div className="flex items-center space-x-1 text-slate-400">
            {saveStatus === 'SAVED' ? (
              <span className="flex items-center space-x-1 text-emerald-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Autosaved</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-amber-600 font-medium">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onTogglePin(note.id)}
            className={`p-1.5 rounded hover:bg-slate-100 transition ${
              note.isPinned ? 'text-emerald-600' : 'text-slate-400'
            }`}
            title="Pin Note"
          >
            <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-emerald-600' : ''}`} />
          </button>

          <button
            onClick={() => onToggleStar(note.id)}
            className={`p-1.5 rounded hover:bg-slate-100 transition ${
              note.isStarred ? 'text-amber-500' : 'text-slate-400'
            }`}
            title="Star Note"
          >
            <Star className={`w-4 h-4 ${note.isStarred ? 'fill-amber-500' : ''}`} />
          </button>

          <button
            onClick={handleExportMarkdown}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition"
            title="Export as Markdown (.md)"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1.5 rounded hover:bg-slate-100 transition ${
              showHistory ? 'text-blue-600 bg-blue-50' : 'text-slate-600'
            }`}
            title="Revision History"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
            title="Move to Trash"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Main Canvas & Revision Drawer */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-8 overflow-y-auto max-w-3xl mx-auto w-full space-y-4">
          {/* Note Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled Note"
            className="text-2xl sm:text-3xl font-black text-slate-900 border-none outline-none focus:ring-0 placeholder:text-slate-300 w-full"
          />

          {/* Quick Markdown Helpers */}
          <div className="flex items-center space-x-2 py-1 text-xs text-slate-400 border-b border-slate-100">
            <span>Markdown supported:</span>
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600"># Heading</span>
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">- [ ] Checklist</span>
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">```code```</span>
          </div>

          {/* Note Content Textarea */}
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Type your notes, ideas, code snippets, or checklists here..."
            className="flex-1 w-full text-sm leading-relaxed text-slate-800 border-none outline-none focus:ring-0 resize-none font-sans min-h-[400px]"
          />
        </div>

        {/* Revision History Sidebar Drawer */}
        {showHistory && (
          <aside className="w-72 border-l border-slate-200 bg-slate-50 p-4 flex flex-col h-full overflow-y-auto space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Revision History
              </span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {note.revisions?.map((rev: any) => (
                <div
                  key={rev.id}
                  className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>Revision #{rev.revisionNumber}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {rev.reason}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] truncate">{rev.title}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span>
                      {formatDistanceToNow(new Date(rev.createdAt), { addSuffix: true })}
                    </span>
                    {rev.revisionNumber !== note.serverRevision && (
                      <button
                        onClick={() => onRestoreRevision(note.id, rev.revisionNumber)}
                        className="text-emerald-700 font-semibold hover:underline flex items-center space-x-1"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Restore</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
