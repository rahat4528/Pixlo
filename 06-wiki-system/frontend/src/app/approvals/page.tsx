"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navigation from "../../components/Navigation";

interface ApprovalRequest {
  id: string;
  pageId: string;
  pageTitle: string;
  spaceSlug: string;
  spaceTitle: string;
  author: string;
  authorEmail: string;
  submittedAt: string;
  status: "IN_REVIEW" | "APPROVED" | "REJECTED";
  proposedSummary: string;
  currentRevisionNumber: number;
  proposedRevisionNumber: number;
  reviewerNotes?: string;
}

const mockApprovals: ApprovalRequest[] = [
  {
    id: "app-1",
    pageId: "page-1",
    pageTitle: "Architecture Guidelines v2",
    spaceSlug: "engineering",
    spaceTitle: "Engineering Space",
    author: "Alice Developer",
    authorEmail: "alice@pixlo.local",
    submittedAt: "2026-11-16 10:15",
    status: "IN_REVIEW",
    proposedSummary: "Updated microservice database connection pool policies and retry backoff limits.",
    currentRevisionNumber: 3,
    proposedRevisionNumber: 4,
  },
  {
    id: "app-2",
    pageId: "page-2",
    pageTitle: "Security & Zero Trust Perimeter",
    spaceSlug: "security",
    spaceTitle: "Information Security",
    author: "Bob Admin",
    authorEmail: "bob@pixlo.local",
    submittedAt: "2026-11-16 09:40",
    status: "IN_REVIEW",
    proposedSummary: "Mandated mTLS requirement across all internal services and updated cipher suites.",
    currentRevisionNumber: 5,
    proposedRevisionNumber: 6,
  },
  {
    id: "app-3",
    pageId: "page-3",
    pageTitle: "Employee Onboarding Checklist",
    spaceSlug: "operations",
    spaceTitle: "People Operations",
    author: "Carol HR",
    authorEmail: "carol@pixlo.local",
    submittedAt: "2026-11-15 16:30",
    status: "APPROVED",
    proposedSummary: "Added hardware ordering lead times and workstation configuration steps.",
    currentRevisionNumber: 2,
    proposedRevisionNumber: 3,
    reviewerNotes: "Approved by Lead Ops. Meets our Q4 guidelines.",
  },
];

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(mockApprovals);
  const [filter, setFilter] = useState<"ALL" | "IN_REVIEW" | "APPROVED" | "REJECTED">("IN_REVIEW");
  const [selectedItem, setSelectedItem] = useState<ApprovalRequest | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredApprovals = approvals.filter((item) => {
    if (filter === "ALL") return true;
    return item.status === filter;
  });

  const handleDecision = (id: string, decision: "APPROVED" | "REJECTED") => {
    setApprovals((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: decision,
              reviewerNotes: reviewNote || (decision === "APPROVED" ? "Approved by editor." : "Changes requested."),
            }
          : item
      )
    );
    setActionSuccess(`Proposal marked as ${decision}.`);
    setSelectedItem(null);
    setReviewNote("");
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Review & Approval Queue</h1>
            <p className="text-slate-600 mt-1 text-sm">
              Review pending wiki proposals, inspect diff summaries, and approve or reject revisions.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filter:</span>
            {(["IN_REVIEW", "APPROVED", "REJECTED", "ALL"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                  filter === tab
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tab.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {actionSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List column */}
          <div className="lg:col-span-2 space-y-4">
            {filteredApprovals.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                <p className="text-base font-medium">No items found matching filter &quot;{filter}&quot;.</p>
                <p className="text-xs text-slate-400 mt-1">All proposed wiki revisions have been resolved.</p>
              </div>
            ) : (
              filteredApprovals.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setReviewNote(item.reviewerNotes || "");
                  }}
                  className={`bg-white rounded-xl border p-5 transition cursor-pointer hover:shadow-md ${
                    selectedItem?.id === item.id ? "border-indigo-600 ring-2 ring-indigo-100" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.spaceTitle}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            item.status === "IN_REVIEW"
                              ? "bg-amber-100 text-amber-800"
                              : item.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{item.pageTitle}</h3>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{item.submittedAt}</span>
                  </div>

                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{item.proposedSummary}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Author: <strong className="text-slate-700">{item.author}</strong> ({item.authorEmail})
                    </span>
                    <span>
                      Rev {item.currentRevisionNumber} &rarr; <strong className="text-indigo-600">Rev {item.proposedRevisionNumber}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Review Details Column */}
          <div className="lg:col-span-1">
            {selectedItem ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Review Details</h2>
                
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase">Page</span>
                    <p className="font-semibold text-slate-800">{selectedItem.pageTitle}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase">Space</span>
                    <p className="text-slate-700">{selectedItem.spaceTitle}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase">Change Summary</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-150 mt-1 text-xs leading-relaxed">
                      {selectedItem.proposedSummary}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase">Target Page Link</span>
                    <p className="mt-1">
                      <Link
                        href={`/spaces/${selectedItem.spaceSlug}`}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium underline"
                      >
                        Open Space View &rarr;
                      </Link>
                    </p>
                  </div>

                  {selectedItem.status === "IN_REVIEW" && (
                    <div className="pt-3 border-t border-slate-100">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Reviewer Feedback / Comments:
                      </label>
                      <textarea
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="Add editorial notes or explain rejection criteria..."
                        rows={3}
                        className="w-full text-xs p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleDecision(selectedItem.id, "APPROVED")}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition shadow-sm"
                        >
                          Approve & Publish
                        </button>
                        <button
                          onClick={() => handleDecision(selectedItem.id, "REJECTED")}
                          className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold transition shadow-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedItem.reviewerNotes && selectedItem.status !== "IN_REVIEW" && (
                    <div className="pt-3 border-t border-slate-100">
                      <span className="text-xs font-medium text-slate-400 uppercase">Reviewer Notes</span>
                      <p className="text-xs text-slate-700 mt-1 italic">&ldquo;{selectedItem.reviewerNotes}&rdquo;</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-sm">
                Select a proposal from the queue to inspect details and make an editorial decision.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
