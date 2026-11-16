"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Search, GitBranch, Terminal, Layers } from "lucide-react";
import SearchModal from "./SearchModal";

interface NavigationProps {
  projectSlug?: string;
  projectName?: string;
  currentVersion?: string;
  versions?: Array<{ version_string: string; is_default: boolean; is_prerelease: boolean }>;
}

export default function Navigation({
  projectSlug = "pixlo-core",
  projectName = "Pixlo Documentation",
  currentVersion = "v2.0.0",
  versions = [
    { version_string: "v2.0.0", is_default: true, is_prerelease: false },
    { version_string: "v1.0.0", is_default: false, is_prerelease: false },
    { version_string: "next", is_default: false, is_prerelease: true },
  ],
}: NavigationProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight text-base block leading-none">
                  {projectName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Platform v7</span>
              </div>
            </Link>

            {/* Version Switcher Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
              <GitBranch className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={currentVersion}
                onChange={(e) => {
                  window.location.href = `/docs/${projectSlug}/${e.target.value}/index`;
                }}
                className="bg-transparent font-mono font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                {versions.map((ver) => (
                  <option key={ver.version_string} value={ver.version_string}>
                    {ver.version_string} {ver.is_default ? "(latest)" : ""} {ver.is_prerelease ? "(preview)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200/80 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200 text-xs transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search docs...</span>
              <kbd className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-400">
                ⌘K
              </kbd>
            </button>

            <Link
              href={`/docs/${projectSlug}/${currentVersion}/api-reference`}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center space-x-1 transition"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>API Reference</span>
            </Link>

            <Link
              href="/builds"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center space-x-1 transition"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Build Runs</span>
            </Link>
          </div>
        </div>
      </header>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        projectSlug={projectSlug}
        currentVersion={currentVersion}
      />
    </>
  );
}
