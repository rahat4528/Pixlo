"use client";

import React from "react";
import Link from "next/link";
import {
  Database,
  FileText,
  Image,
  Puzzle,
  PlusCircle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function StudioDashboard() {
  const stats = [
    { label: "Content Schemas", value: "3", icon: Database, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Total Entries", value: "48", icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Media Assets", value: "19", icon: Image, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Active Plugins", value: "2", icon: Puzzle, color: "text-violet-400", bg: "bg-violet-500/10" },
  ];

  const recentEntries = [
    {
      id: "e-1",
      title: "How to Build Decoupled Next.js Frontends with Pixlo Headless CMS",
      type: "Articles",
      status: "PUBLISHED",
      locale: "en",
      updatedAt: "10 mins ago",
    },
    {
      id: "e-2",
      title: "Ergonomic Mechanical Keyboard v2",
      type: "Products",
      status: "DRAFT",
      locale: "en",
      updatedAt: "1 hour ago",
    },
    {
      id: "e-3",
      title: "Enterprise Deployment Guidelines for Kubernetes",
      type: "Articles",
      status: "PUBLISHED",
      locale: "en",
      updatedAt: "Yesterday",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Studio Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic content model management, headless REST APIs, and plugin extensions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/schemas"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Content Type</span>
          </Link>
          <Link
            href="/media"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700"
          >
            <Image className="w-4 h-4" />
            <span>Upload Media</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs text-slate-400 block font-medium">{s.label}</span>
                <span className="text-2xl font-extrabold text-white mt-1 block tracking-tight">
                  {s.value}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Entries */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Content Entries</h2>
            <p className="text-xs text-slate-400">Recently updated or published dynamic records</p>
          </div>
          <Link
            href="/content/articles"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Title / Primary Field</th>
                <th className="p-3.5">Content Type</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Locale</th>
                <th className="p-3.5">Updated</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-semibold text-white">{entry.title}</td>
                  <td className="p-3.5">
                    <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded font-mono text-[11px]">
                      {entry.type}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                        entry.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {entry.status === "PUBLISHED" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      <span>{entry.status}</span>
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-400">{entry.locale}</td>
                  <td className="p-3.5 text-slate-400">{entry.updatedAt}</td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/content/${entry.type.toLowerCase()}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Edit &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
