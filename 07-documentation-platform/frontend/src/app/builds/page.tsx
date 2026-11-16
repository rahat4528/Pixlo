"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import { Play, CheckCircle2, AlertTriangle, XCircle, Clock, FileCode, Link2, RefreshCw } from "lucide-react";

interface BuildRun {
  id: string;
  projectSlug: string;
  projectName: string;
  version: string;
  triggerType: "MANUAL" | "WEBHOOK" | "CLI";
  status: "SUCCESS" | "WARNING" | "FAILED";
  totalPages: number;
  brokenLinksCount: number;
  buildDurationMs: number;
  createdAt: string;
  logOutput: string;
}

const mockBuildRuns: BuildRun[] = [
  {
    id: "run-101",
    projectSlug: "pixlo-core",
    projectName: "Pixlo Core Engine",
    version: "v2.0.0",
    triggerType: "MANUAL",
    status: "SUCCESS",
    totalPages: 24,
    brokenLinksCount: 0,
    buildDurationMs: 420,
    createdAt: "2026-11-16 11:20:15",
    logOutput: "Compiled 24 pages into dist/pixlo-core/v2.0.0. Inverted search index built (482 tokens). Link audit: 0 dead links detected. Status: SUCCESS.",
  },
  {
    id: "run-102",
    projectSlug: "graph-sdk",
    projectName: "Knowledge Graph SDK",
    version: "v1.4.0",
    triggerType: "WEBHOOK",
    status: "WARNING",
    totalPages: 16,
    brokenLinksCount: 1,
    buildDurationMs: 310,
    createdAt: "2026-11-16 09:45:02",
    logOutput: "Compiled 16 pages into dist/graph-sdk/v1.4.0. Link audit warning: 1 dead anchor detected on 'architecture.md#graph-cycles'. Build exited with status WARNING.",
  },
  {
    id: "run-103",
    projectSlug: "edge-delivery",
    projectName: "Edge Delivery Network",
    version: "v1.0.0",
    triggerType: "CLI",
    status: "SUCCESS",
    totalPages: 11,
    brokenLinksCount: 0,
    buildDurationMs: 195,
    createdAt: "2026-11-15 18:10:44",
    logOutput: "Compiled 11 pages into dist/edge-delivery/v1.0.0. Generated OpenAPI static viewer. Link audit: clean. Status: SUCCESS.",
  },
];

export default function BuildsDashboardPage() {
  const [runs, setRuns] = useState<BuildRun[]>(mockBuildRuns);
  const [selectedRun, setSelectedRun] = useState<BuildRun | null>(mockBuildRuns[0]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildSuccessMessage, setBuildSuccessMessage] = useState<string | null>(null);

  const handleTriggerBuild = () => {
    setIsBuilding(true);
    setTimeout(() => {
      const newRun: BuildRun = {
        id: `run-${Date.now().toString().slice(-3)}`,
        projectSlug: "pixlo-core",
        projectName: "Pixlo Core Engine",
        version: "v2.0.0",
        triggerType: "MANUAL",
        status: "SUCCESS",
        totalPages: 25,
        brokenLinksCount: 0,
        buildDurationMs: 380,
        createdAt: "Just now",
        logOutput: "Manual trigger executed. Built 25 pages in 380ms. Link validator verified 42 hyperlinks with 0 dead targets. Search index updated. Status: SUCCESS.",
      };
      setRuns([newRun, ...runs]);
      setSelectedRun(newRun);
      setIsBuilding(false);
      setBuildSuccessMessage("Static site generation completed successfully!");
      setTimeout(() => setBuildSuccessMessage(null), 4000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Build Runs &amp; Deployment Previews
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Static site generator compile history, link validation audits, and performance metrics.
            </p>
          </div>

          <button
            onClick={handleTriggerBuild}
            disabled={isBuilding}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold transition shadow-sm"
          >
            {isBuilding ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling Static Site...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Trigger Manual Build</span>
              </>
            )}
          </button>
        </div>

        {buildSuccessMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{buildSuccessMessage}</span>
            </div>
            <button onClick={() => setBuildSuccessMessage(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Builds History List */}
          <div className="lg:col-span-2 space-y-3">
            {runs.map((run) => (
              <div
                key={run.id}
                onClick={() => setSelectedRun(run)}
                className={`bg-white rounded-2xl border p-5 cursor-pointer transition ${
                  selectedRun?.id === run.id
                    ? "border-indigo-600 ring-2 ring-indigo-50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        run.status === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-800"
                          : run.status === "WARNING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {run.status === "SUCCESS" && <CheckCircle2 className="w-3 h-3" />}
                      {run.status === "WARNING" && <AlertTriangle className="w-3 h-3" />}
                      {run.status === "FAILED" && <XCircle className="w-3 h-3" />}
                      <span>{run.status}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800">{run.projectName}</span>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {run.version}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{run.createdAt}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <FileCode className="w-3.5 h-3.5 text-slate-400" />
                    <span>{run.totalPages} pages</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Link2 className={`w-3.5 h-3.5 ${run.brokenLinksCount === 0 ? "text-emerald-500" : "text-amber-500"}`} />
                    <span>{run.brokenLinksCount} dead links</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{run.buildDurationMs}ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Run Detail Inspector */}
          <div className="lg:col-span-1">
            {selectedRun ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Build Log Inspector
                </h3>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block uppercase font-semibold text-[10px]">Project</span>
                    <span className="font-bold text-slate-800">{selectedRun.projectName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-semibold text-[10px]">Target Version</span>
                    <span className="font-mono text-slate-700">{selectedRun.version}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-semibold text-[10px]">Trigger Mode</span>
                    <span className="text-slate-700">{selectedRun.triggerType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-semibold text-[10px]">Link Audit Status</span>
                    <span className={`font-semibold ${selectedRun.brokenLinksCount === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                      {selectedRun.brokenLinksCount === 0 ? "All internal links & anchors valid" : `${selectedRun.brokenLinksCount} dead anchor(s) detected`}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block uppercase font-semibold text-[10px] mb-1.5">
                    Compiler Console Output
                  </span>
                  <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed max-h-48 whitespace-pre-wrap">
                    {selectedRun.logOutput}
                  </pre>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/docs/${selectedRun.projectSlug}/${selectedRun.version}/index`}
                    className="block w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-center rounded-lg text-xs font-semibold transition"
                  >
                    Open Live Docs Preview &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
                Select a build run to inspect execution logs and compiler diagnostics.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
