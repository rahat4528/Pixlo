"use client";

import React, { useState } from "react";
import { Puzzle, Shield, Key, Plus, CheckCircle2, Copy, Check, Radio } from "lucide-react";

interface PluginState {
  name: string;
  slug: string;
  description: string;
  version: string;
  isEnabled: boolean;
  hooks: string[];
}

interface ApiTokenCard {
  id: string;
  name: string;
  tokenType: string;
  createdAt: string;
}

export default function PluginsAndTokensPage() {
  const [plugins, setPlugins] = useState<PluginState[]>([
    {
      name: "SEO & Reading Time Engine",
      slug: "seo-engine",
      description: "Auto-generates URL slugs from title fields and computes estimated reading times.",
      version: "1.0.0",
      isEnabled: true,
      hooks: ["beforeCreate", "beforeUpdate"],
    },
    {
      name: "Webhook Dispatcher",
      slug: "webhook-dispatcher",
      description: "Dispatches HTTP POST webhooks to downstream microservices and static deploy targets.",
      version: "1.0.0",
      isEnabled: true,
      hooks: ["afterCreate", "afterUpdate", "afterDelete"],
    },
  ]);

  const [tokens, setTokens] = useState<ApiTokenCard[]>([
    {
      id: "tok-1",
      name: "Next.js Consumer Frontend",
      tokenType: "READ_ONLY",
      createdAt: "2026-11-16 08:00",
    },
    {
      id: "tok-2",
      name: "Mobile App Production Token",
      tokenType: "READ_ONLY",
      createdAt: "2026-11-15 14:30",
    },
  ]);

  const [newTokenName, setNewTokenName] = useState("");
  const [generatedTokenSecret, setGeneratedTokenSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const togglePlugin = (slug: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, isEnabled: !p.isEnabled } : p))
    );
  };

  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;

    const secret = `cms_live_${Math.random().toString(36).substring(2)}${Date.now()}`;
    const token: ApiTokenCard = {
      id: `tok-${Date.now().toString().slice(-4)}`,
      name: newTokenName,
      tokenType: "READ_ONLY",
      createdAt: "Just now",
    };

    setTokens([token, ...tokens]);
    setGeneratedTokenSecret(secret);
    setNewTokenName("");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Plugins, Webhooks &amp; API Tokens
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Extend core CMS lifecycle events with sandboxed plugins and secure API tokens.
        </p>
      </div>

      {/* Plugins Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Puzzle className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Installed Plugins</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plugins.map((plugin) => (
            <div
              key={plugin.slug}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white">{plugin.name}</h3>
                  <button
                    onClick={() => togglePlugin(plugin.slug)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${
                      plugin.isEnabled
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}
                  >
                    {plugin.isEnabled ? "Active" : "Disabled"}
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{plugin.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Version: v{plugin.version}</span>
                <span>Hooks: {plugin.hooks.join(", ")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Tokens Section */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div className="flex items-center space-x-2">
          <Key className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">API Tokens (Headless Access)</h2>
        </div>

        {generatedTokenSecret && (
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-indigo-300 block">
              Save your generated API token secret:
            </span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={generatedTokenSecret}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-emerald-400 font-bold"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedTokenSecret);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Generate Token Form */}
        <form onSubmit={handleGenerateToken} className="flex gap-3">
          <input
            type="text"
            required
            value={newTokenName}
            onChange={(e) => setNewTokenName(e.target.value)}
            placeholder="Token description (e.g. Mobile iOS Client)..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Token</span>
          </button>
        </form>

        {/* Active Tokens Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Token Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Created At</th>
                <th className="p-4 text-right">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {tokens.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-semibold text-white">{t.name}</td>
                  <td className="p-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold">
                      {t.tokenType}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{t.createdAt}</td>
                  <td className="p-4 text-right font-mono text-slate-400">content:read</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
