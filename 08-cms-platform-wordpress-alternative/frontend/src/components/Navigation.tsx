"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Image,
  Puzzle,
  FileText,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  Radio,
} from "lucide-react";

interface ContentTypeItem {
  name: string;
  slug: string;
}

const defaultContentTypes: ContentTypeItem[] = [
  { name: "Articles", slug: "articles" },
  { name: "Products", slug: "products" },
  { name: "Authors", slug: "authors" },
];

export default function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div>
          {/* Logo / Header */}
          <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">
                Pixlo Studio
              </span>
              <span className="text-[10px] text-indigo-400 font-mono font-semibold">
                Headless CMS Engine
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-6 overflow-y-auto">
            {/* General */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-2">
                Studio
              </span>
              <div className="space-y-1">
                <Link
                  href="/"
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/")
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/schemas"
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/schemas")
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>Schema Builder</span>
                </Link>
                <Link
                  href="/media"
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/media")
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Image className="w-4 h-4" />
                  <span>Media Library</span>
                </Link>
                <Link
                  href="/plugins"
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/plugins")
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Puzzle className="w-4 h-4" />
                  <span>Plugins &amp; Webhooks</span>
                </Link>
              </div>
            </div>

            {/* Content Types Collections */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Collections
                </span>
                <Link href="/schemas" title="Add Content Type">
                  <PlusCircle className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-400" />
                </Link>
              </div>
              <div className="space-y-1">
                {defaultContentTypes.map((ct) => (
                  <Link
                    key={ct.slug}
                    href={`/content/${ct.slug}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      pathname === `/content/${ct.slug}`
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <FileText className="w-4 h-4" />
                      <span>{ct.name}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-50">/api/{ct.slug}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-400 py-1">
            <span className="flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono">Port 4008 API</span>
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
              v1.0.0
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Workspace: <strong>Default Production</strong></span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="http://localhost:4008/api/v1/content/articles"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-slate-400 hover:text-indigo-400 flex items-center space-x-1 transition"
            >
              <span>Inspect API</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-indigo-600/30">
              AD
            </div>
          </div>
        </header>

        {/* Child Pages */}
        <div className="flex-1 bg-slate-950 p-8">{children}</div>
      </div>
    </div>
  );
}
