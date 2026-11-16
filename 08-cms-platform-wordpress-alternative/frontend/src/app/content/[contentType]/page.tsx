"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, CheckCircle2, Clock, Trash2, Globe, Send } from "lucide-react";

interface PageProps {
  params: {
    contentType: string;
  };
}

interface DynamicEntry {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  locale: string;
  updatedAt: string;
  data: Record<string, any>;
}

const mockEntries: Record<string, DynamicEntry[]> = {
  articles: [
    {
      id: "art-1",
      title: "Building Microfrontends with Module Federation",
      status: "PUBLISHED",
      locale: "en",
      updatedAt: "2026-11-16 12:40",
      data: { slug: "building-microfrontends", readingTime: "4 min" },
    },
    {
      id: "art-2",
      title: "Introduction to Rust Memory Safety",
      status: "DRAFT",
      locale: "en",
      updatedAt: "2026-11-16 10:15",
      data: { slug: "intro-to-rust", readingTime: "8 min" },
    },
  ],
  products: [
    {
      id: "prod-1",
      title: "Mechanical Wireless Keyboard",
      status: "PUBLISHED",
      locale: "en",
      updatedAt: "2026-11-15 16:20",
      data: { price: 149.99, inStock: true, category: "Hardware" },
    },
    {
      id: "prod-2",
      title: "Precision USB-C Gaming Mouse",
      status: "DRAFT",
      locale: "en",
      updatedAt: "2026-11-14 11:00",
      data: { price: 59.99, inStock: false, category: "Accessories" },
    },
  ],
};

export default function ContentManagerPage({ params }: PageProps) {
  const { contentType } = params;
  const initialData = mockEntries[contentType] || [
    {
      id: "sample-1",
      title: `Sample ${contentType} Entry`,
      status: "PUBLISHED",
      locale: "en",
      updatedAt: "Just now",
      data: {},
    },
  ];

  const [entries, setEntries] = useState<DynamicEntry[]>(initialData);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const filtered = entries.filter((e) => {
    if (filterStatus === "ALL") return true;
    return e.status === filterStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEntry: DynamicEntry = {
      id: `entry-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      status: "DRAFT",
      locale: "en",
      updatedAt: "Just now",
      data: {},
    };

    setEntries([newEntry, ...entries]);
    setNewTitle("");
    setIsModalOpen(false);
    setNotification(`Entry "${newTitle}" created successfully in draft state.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handlePublish = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "PUBLISHED", updatedAt: "Just now" } : e))
    );
    setNotification(`Entry published.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setNotification(`Entry deleted.`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white capitalize">
              {contentType}
            </h1>
            <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              /api/v1/content/{contentType}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse, compose, and publish dynamic records for the {contentType} collection.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center space-x-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Filter Status:</span>
        {(["ALL", "PUBLISHED", "DRAFT"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === tab
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Entries Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="p-4">Title / Primary Field</th>
              <th className="p-4">Status</th>
              <th className="p-4">Locale</th>
              <th className="p-4">Last Updated</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition">
                <td className="p-4 font-semibold text-white">
                  <div>
                    <span>{item.title}</span>
                    <span className="text-[10px] font-mono text-slate-500 block">{item.id}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.status === "PUBLISHED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {item.status === "PUBLISHED" ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span>{item.status}</span>
                  </span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center space-x-1 font-mono text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>{item.locale}</span>
                  </span>
                </td>
                <td className="p-4 text-slate-400">{item.updatedAt}</td>
                <td className="p-4 text-right space-x-2">
                  {item.status === "DRAFT" && (
                    <button
                      onClick={() => handlePublish(item.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Create New {contentType} Entry
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Title / Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter entry title..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
