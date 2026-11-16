"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, BookOpen, ExternalLink } from "lucide-react";

interface SearchHit {
  id: string;
  title: string;
  slug: string;
  version: string;
  score: number;
  snippet: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectSlug: string;
  currentVersion: string;
}

export default function SearchModal({
  isOpen,
  onClose,
  projectSlug,
  currentVersion,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    // Mock search results fallback
    setTimeout(() => {
      const mockData: SearchHit[] = [
        {
          id: "hit-1",
          title: "Getting Started & Environment Setup",
          slug: "getting-started",
          version: currentVersion,
          score: 8.5,
          snippet: `Configure <mark>${q}</mark> settings and spin up services with docker-compose.`,
        },
        {
          id: "hit-2",
          title: "API Authentication & JWT Tokens",
          slug: "authentication",
          version: currentVersion,
          score: 5.2,
          snippet: `Authenticate using Bearer tokens for secure <mark>${q}</mark> endpoints.`,
        },
        {
          id: "hit-3",
          title: "Cluster Architecture & Scaling",
          slug: "architecture",
          version: currentVersion,
          score: 3.8,
          snippet: `High-availability setup with multi-node replication and <mark>${q}</mark> monitoring.`,
        },
      ];
      setResults(mockData);
      setIsSearching(false);
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={`Search ${projectSlug} (${currentVersion}) documentation...`}
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => handleSearch("")} className="text-slate-400 hover:text-slate-600 mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {isSearching && (
            <p className="text-xs text-slate-400 py-6 text-center">Searching documentation index...</p>
          )}

          {!isSearching && query.trim() && results.length === 0 && (
            <p className="text-xs text-slate-400 py-6 text-center">
              No results found for &ldquo;{query}&rdquo;.
            </p>
          )}

          {!isSearching && !query.trim() && (
            <div className="py-8 text-center text-slate-400 text-xs">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Type keywords to search across guides, API endpoints, and versioned specs.
            </div>
          )}

          {results.map((hit) => (
            <Link
              key={hit.id}
              href={`/docs/${projectSlug}/${hit.version}/${hit.slug}`}
              onClick={onClose}
              className="block p-3 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/40 transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 flex items-center">
                  {hit.title}
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-0 group-hover:opacity-100 transition" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                  {hit.version}
                </span>
              </div>
              <div
                className="text-xs text-slate-500 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: hit.snippet }}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
