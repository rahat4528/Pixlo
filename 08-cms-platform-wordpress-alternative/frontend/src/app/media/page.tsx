"use client";

import React, { useState } from "react";
import { UploadCloud, Image as ImageIcon, FileText, Trash2, CheckCircle2, Copy, Check } from "lucide-react";

interface MediaCard {
  id: string;
  fileName: string;
  fileHash: string;
  mimeType: string;
  fileSizeKb: number;
  url: string;
  dimensions?: string;
  createdAt: string;
}

const mockMedia: MediaCard[] = [
  {
    id: "m-1",
    fileName: "keyboard-hero-shot.png",
    fileHash: "5640ff841340731b9f5465e242fe0beef523a40252cefe9fbe19a4483efdfc07",
    mimeType: "image/png",
    fileSizeKb: 1420,
    url: "/media/uploads/keyboard-hero-shot.png",
    dimensions: "1920x1080",
    createdAt: "2026-11-16 11:20",
  },
  {
    id: "m-2",
    fileName: "architecture-diagram.svg",
    fileHash: "9a7b2c4d8e1f5a3b7c9d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b",
    mimeType: "image/svg+xml",
    fileSizeKb: 45,
    url: "/media/uploads/architecture-diagram.svg",
    createdAt: "2026-11-15 14:10",
  },
  {
    id: "m-3",
    fileName: "api-specifications-whitepaper.pdf",
    fileHash: "1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f",
    mimeType: "application/pdf",
    fileSizeKb: 3850,
    url: "/media/uploads/api-specifications-whitepaper.pdf",
    createdAt: "2026-11-14 09:30",
  },
];

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaCard[]>(mockMedia);
  const [selectedAsset, setSelectedAsset] = useState<MediaCard | null>(mockMedia[0]);
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleUploadSimulate = () => {
    const newAsset: MediaCard = {
      id: `m-${Date.now().toString().slice(-4)}`,
      fileName: `upload-${Date.now().toString().slice(-3)}.png`,
      fileHash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      mimeType: "image/png",
      fileSizeKb: 850,
      url: `/media/uploads/upload-${Date.now().toString().slice(-3)}.png`,
      dimensions: "1200x800",
      createdAt: "Just now",
    };
    setAssets([newAsset, ...assets]);
    setSelectedAsset(newAsset);
    setNotification("Asset uploaded successfully and responsive formats generated.");
    setTimeout(() => setNotification(null), 4000);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Media Library</h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized digital asset manager with SHA-256 deduplication and responsive image variants.
          </p>
        </div>

        <button
          onClick={handleUploadSimulate}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/20"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="font-bold">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className={`bg-slate-900 border rounded-2xl p-3 cursor-pointer transition flex flex-col justify-between group ${
                selectedAsset?.id === asset.id
                  ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-md"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="aspect-video w-full rounded-xl bg-slate-950 flex items-center justify-center text-slate-600 overflow-hidden mb-2">
                {asset.mimeType.startsWith("image/") ? (
                  <ImageIcon className="w-8 h-8 text-indigo-400/60 group-hover:scale-110 transition duration-200" />
                ) : (
                  <FileText className="w-8 h-8 text-amber-400/60 group-hover:scale-110 transition duration-200" />
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-white block truncate">{asset.fileName}</span>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>{(asset.fileSizeKb / 1024).toFixed(1)} MB</span>
                  <span className="uppercase">{asset.mimeType.split("/")[1]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Asset Inspector */}
        <div className="lg:col-span-1">
          {selectedAsset ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm sticky top-24 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                Asset Specifications
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block uppercase font-semibold text-[10px]">File Name</span>
                  <span className="font-bold text-white break-all">{selectedAsset.fileName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-semibold text-[10px]">MIME Type</span>
                  <span className="font-mono text-slate-300">{selectedAsset.mimeType}</span>
                </div>
                {selectedAsset.dimensions && (
                  <div>
                    <span className="text-slate-500 block uppercase font-semibold text-[10px]">Dimensions</span>
                    <span className="font-mono text-slate-300">{selectedAsset.dimensions} px</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 block uppercase font-semibold text-[10px]">SHA-256 Checksum</span>
                  <span className="font-mono text-[10px] text-slate-400 break-all bg-slate-950 p-2 rounded block border border-slate-800">
                    {selectedAsset.fileHash}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-semibold text-[10px]">Static URL</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={selectedAsset.url}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[11px] font-mono text-slate-300"
                    />
                    <button
                      onClick={() => copyUrl(selectedAsset.url)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                      title="Copy URL"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
              Select an asset from the media library to inspect metadata and format variants.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
