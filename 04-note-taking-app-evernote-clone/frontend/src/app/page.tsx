'use client';

import React, { useState, useEffect } from 'react';
import { NotebookSidebar } from '../components/NotebookSidebar';
import { NoteList } from '../components/NoteList';
import { NoteEditor } from '../components/NoteEditor';

const INITIAL_NOTEBOOKS = [
  { id: 'nb-1', name: 'Daily Inbox', isDefault: true, color: '#059669', _count: { notes: 2 } },
  { id: 'nb-2', name: 'System Architecture', isDefault: false, color: '#2563eb', _count: { notes: 1 } },
  { id: 'nb-3', name: 'Book Summaries', isDefault: false, color: '#7c3aed', _count: { notes: 0 } },
];

const INITIAL_TAGS = [
  { id: 'tag-1', name: 'Architecture', slug: 'architecture', color: '#2563eb' },
  { id: 'tag-2', name: 'Critical', slug: 'critical', color: '#dc2626' },
  { id: 'tag-3', name: 'Ideas', slug: 'ideas', color: '#10b981' },
];

const INITIAL_NOTES = [
  {
    id: 'note-1',
    title: 'Offline-First Concurrency Model',
    content: `# Offline-First Concurrency Model

Our client-side sync layer coordinates edits between local IndexedDB and server PostgreSQL.

## Architecture Guidelines
- Notes hold a monotonic serverRevision integer.
- Edits submit the baseRevision they branched from.
- 3-way text merger resolves non-overlapping edits.
- Overlapping diffs fork into an explicit conflict copy.

\`\`\`typescript
interface SyncEnvelope {
  noteId: string;
  clientOpId: string;
  baseRevision: number;
}
\`\`\`

### Verification Checklist
- [x] Optimistic Concurrency 409 rejection verified
- [x] Client FIFO queue replay tested with retry backoff
- [ ] Implement browser camera document scanning
`,
    plainText: 'Offline-First Concurrency Model. Our client-side sync layer coordinates edits between local IndexedDB and server PostgreSQL.',
    isPinned: true,
    isStarred: true,
    serverRevision: 3,
    updatedAt: new Date(Date.now() - 3600000 * 2),
    notebook: { id: 'nb-2', name: 'System Architecture' },
    revisions: [
      { id: 'rev-3', revisionNumber: 3, title: 'Offline-First Concurrency Model', reason: 'MANUAL_SAVE', createdAt: new Date() },
      { id: 'rev-2', revisionNumber: 2, title: 'Offline-First Concurrency Model', reason: 'AUTOSAVE', createdAt: new Date(Date.now() - 3600000) },
      { id: 'rev-1', revisionNumber: 1, title: 'Initial Draft', reason: 'MANUAL_SAVE', createdAt: new Date(Date.now() - 3600000 * 4) },
    ],
  },
  {
    id: 'note-2',
    title: 'Weekly Sprint Action Items',
    content: `# Weekly Sprint Action Items

- [x] Complete Phase 3 News Aggregator
- [x] Test RSS and Atom parsing streams
- [ ] Implement Note-Taking optimistic concurrency
- [ ] Verify device session revocation
`,
    plainText: 'Weekly Sprint Action Items. Complete Phase 3 News Aggregator. Test RSS and Atom parsing streams.',
    isPinned: false,
    isStarred: false,
    serverRevision: 1,
    updatedAt: new Date(Date.now() - 3600000 * 5),
    notebook: { id: 'nb-1', name: 'Daily Inbox' },
    revisions: [
      { id: 'rev-1-1', revisionNumber: 1, title: 'Weekly Sprint Action Items', reason: 'MANUAL_SAVE', createdAt: new Date() },
    ],
  },
];

export default function WorkspacePage() {
  const [notes, setNotes] = useState<any[]>(INITIAL_NOTES);
  const [notebooks, setNotebooks] = useState<any[]>(INITIAL_NOTEBOOKS);
  const [tags, setTags] = useState<any[]>(INITIAL_TAGS);
  const [activeNoteId, setActiveNoteId] = useState<string | null>('note-1');
  const [currentFilter, setCurrentFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncState, setSyncState] = useState<'LOCAL_ONLY' | 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'CONFLICT' | 'ERROR'>('SYNCED');

  useEffect(() => {
    fetch('http://localhost:4004/api/notes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setNotes(data);
          setActiveNoteId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  const handleCreateNote = () => {
    const newNote = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      content: '',
      plainText: '',
      isPinned: false,
      isStarred: false,
      serverRevision: 1,
      updatedAt: new Date(),
      notebook: notebooks[0],
      revisions: [
        { id: `rev-${Date.now()}`, revisionNumber: 1, title: 'Untitled Note', reason: 'MANUAL_SAVE', createdAt: new Date() },
      ],
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleSaveNote = (updates: { title?: string; content?: string }) => {
    setSyncState('SYNCING');
    setNotes((prevNotes) =>
      prevNotes.map((n) => {
        if (n.id === activeNoteId) {
          const updated = {
            ...n,
            title: updates.title !== undefined ? updates.title : n.title,
            content: updates.content !== undefined ? updates.content : n.content,
            plainText: (updates.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
            updatedAt: new Date(),
            serverRevision: n.serverRevision + 1,
          };
          return updated;
        }
        return n;
      }),
    );
    setTimeout(() => setSyncState('SYNCED'), 400);
  };

  const handleTogglePin = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)));
  };

  const handleToggleStar = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, isStarred: !n.isStarred } : n)));
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
    if (activeNoteId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleRestoreRevision = (noteId: string, revisionNumber: number) => {
    setNotes(
      notes.map((n) => {
        if (n.id === noteId) {
          const rev = n.revisions?.find((r: any) => r.revisionNumber === revisionNumber);
          if (rev) {
            return {
              ...n,
              title: rev.title,
              serverRevision: n.serverRevision + 1,
            };
          }
        }
        return n;
      }),
    );
  };

  // Filter notes based on currentFilter & searchQuery
  const filteredNotes = notes.filter((n) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = n.title?.toLowerCase().includes(q) || n.plainText?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (currentFilter === 'STARRED') return n.isStarred;
    if (currentFilter.startsWith('NOTEBOOK_')) {
      const nbId = currentFilter.replace('NOTEBOOK_', '');
      return n.notebook?.id === nbId;
    }
    return true;
  });

  return (
    <div className="flex w-full h-full">
      {/* 1. Left Navigation Sidebar */}
      <NotebookSidebar
        currentFilter={currentFilter}
        onSelectFilter={(f, id) => setCurrentFilter(id ? `NOTEBOOK_${id}` : f)}
        onCreateNote={handleCreateNote}
        syncState={syncState}
        notebooks={notebooks}
        stacks={[]}
        tags={tags}
        totalNotesCount={notes.length}
        trashCount={0}
      />

      {/* 2. Middle Notes List */}
      <NoteList
        notes={filteredNotes}
        activeNoteId={activeNoteId}
        onSelectNote={(id) => setActiveNoteId(id)}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        titleHeader={
          currentFilter === 'STARRED'
            ? 'Starred Notes'
            : currentFilter === 'REMINDERS'
            ? 'Scheduled Reminders'
            : 'All Notes'
        }
      />

      {/* 3. Right Focused Note Editor Canvas */}
      <NoteEditor
        note={activeNote}
        onSave={handleSaveNote}
        onTogglePin={handleTogglePin}
        onToggleStar={handleToggleStar}
        onDelete={handleDelete}
        onRestoreRevision={handleRestoreRevision}
        notebooks={notebooks}
      />
    </div>
  );
}
