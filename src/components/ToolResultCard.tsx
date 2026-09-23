'use client';

import React from 'react';
import Link from 'next/link';

interface ToolResultCardProps {
  title?: string;
  filename: string;
  downloadUrl: string;
  fileSize?: number | string;
  badgeText?: string;
  details?: { label: string; value: string | number }[];
  onReset?: () => void;
  resetButtonText?: string;
  previewUrl?: string;
  nextTool?: {
    name: string;
    url: string;
    description?: string;
  };
}

export default function ToolResultCard({
  title = 'Processing Completed Successfully!',
  filename,
  downloadUrl,
  fileSize,
  badgeText = 'Ready for Download',
  details = [],
  onReset,
  resetButtonText = 'Process Another File',
  previewUrl,
  nextTool,
}: ToolResultCardProps) {
  const formatSize = (bytes: number | string | undefined) => {
    if (!bytes) return null;
    if (typeof bytes === 'string') return bytes;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const formattedSize = formatSize(fileSize);

  return (
    <div className="w-full my-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-xl backdrop-blur-xs transition-all animate-in fade-in zoom-in-95 duration-300">
      {/* Top Status & Free Premium Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-5 border-b border-emerald-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/30">
            ✓
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              {title}
            </h3>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {badgeText}
            </span>
          </div>
        </div>

        {/* iLovePDF Premium comparison badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-2xs">
          <span>👑</span>
          <span>iLovePDF Pro Feature — 100% Free on ToolsVerse</span>
        </div>
      </div>

      {/* File Info Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/20 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0">
            📄
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate" title={filename}>
              {filename}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              {formattedSize && (
                <span>
                  Size: <strong className="text-gray-700 dark:text-slate-300">{formattedSize}</strong>
                </span>
              )}
              {details.map((d, idx) => (
                <span key={idx}>
                  • {d.label}: <strong className="text-gray-700 dark:text-slate-300">{d.value}</strong>
                </span>
              ))}
              <span>• 🔒 In-Browser Private</span>
            </div>
          </div>
        </div>

        {/* Primary Download Button */}
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <a
            href={downloadUrl}
            download={filename}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all active:scale-95 flex items-center justify-center gap-2.5"
          >
            <span className="text-lg">📥</span>
            <span>Download File</span>
            {formattedSize && <span className="text-xs font-normal opacity-90">({formattedSize})</span>}
          </a>

          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <span>👁️</span>
              <span>Preview</span>
            </a>
          )}
        </div>
      </div>

      {/* Free Tier Unlocked Features Notice */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs text-gray-600 dark:text-slate-400">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
          <span className="text-emerald-500 font-bold">✓</span>
          <span>Zero Server Uploads (100% Private)</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
          <span className="text-emerald-500 font-bold">✓</span>
          <span>No File Size or Daily Limits</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
          <span className="text-emerald-500 font-bold">✓</span>
          <span>No Watermark & No Sign-up</span>
        </div>
      </div>

      {/* Bottom Actions: Next Tool & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-emerald-500/20">
        {nextTool ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 dark:text-slate-400">Next Step:</span>
            <Link
              href={nextTool.url}
              className="font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              <span>{nextTool.name}</span>
              <span>→</span>
            </Link>
          </div>
        ) : (
          <div />
        )}

        {onReset && (
          <button
            onClick={onReset}
            className="text-xs font-bold text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>🔄</span>
            <span>{resetButtonText}</span>
          </button>
        )}
      </div>
    </div>
  );
}
