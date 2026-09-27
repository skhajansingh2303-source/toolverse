'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ToolResultCardProps {
  title?: string;
  filename: string;
  downloadUrl: string;
  fileSize?: number | string;
  originalSize?: number | string;
  badgeText?: string;
  details?: { label: string; value: string | number }[];
  onReset?: () => void;
  resetButtonText?: string;
  previewUrl?: string;
  previewType?: 'pdf' | 'image' | 'text' | 'auto';
  previewText?: string;
  nextTool?: {
    name: string;
    url: string;
    description?: string;
  };
  suggestedTools?: {
    name: string;
    url: string;
    icon?: string;
    badge?: string;
  }[];
}

const DEFAULT_SUGGESTED_TOOLS = [
  { name: 'Compress PDF', url: '/tools/optimize-pdf/compress-pdf/', icon: '🗜️', badge: 'Save Space' },
  { name: 'Sign Document', url: '/tools/pdf-security/sign-pdf/', icon: '✍️', badge: 'Legal & Private' },
  { name: 'Protect with Password', url: '/tools/pdf-security/protect-pdf/', icon: '🔒', badge: 'AES-256' },
  { name: 'Merge Documents', url: '/tools/organize-pdf/merge-pdf/', icon: '📎', badge: 'Combine' },
];

export default function ToolResultCard({
  title = 'Processing Completed Successfully!',
  filename,
  downloadUrl,
  fileSize,
  originalSize,
  badgeText = 'Result Ready',
  details = [],
  onReset,
  resetButtonText = 'Process Another File',
  previewUrl,
  previewType = 'auto',
  previewText,
  nextTool,
  suggestedTools,
}: ToolResultCardProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Format bytes helper
  const formatSize = (bytes: number | string | undefined) => {
    if (bytes === undefined || bytes === null || bytes === '') return null;
    if (typeof bytes === 'string') return bytes;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const formattedSize = formatSize(fileSize);
  const formattedOriginalSize = formatSize(originalSize);

  // Calculate savings percentage if both original & new are numbers
  let savingsPercentage: number | null = null;
  if (
    typeof originalSize === 'number' &&
    typeof fileSize === 'number' &&
    originalSize > 0 &&
    fileSize < originalSize
  ) {
    savingsPercentage = Math.round(((originalSize - fileSize) / originalSize) * 100);
  }

  // Keyboard shortcut: Ctrl+S / ⌘S triggers download
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [downloadUrl, filename]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyPreviewText = () => {
    if (previewText) {
      navigator.clipboard.writeText(previewText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  // Auto detect preview type
  const isPdf =
    previewType === 'pdf' ||
    (previewType === 'auto' &&
      (filename.toLowerCase().endsWith('.pdf') || (previewUrl && previewUrl.includes('pdf'))));
  const isImage =
    previewType === 'image' ||
    (previewType === 'auto' && /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(filename));
  const isText = previewType === 'text' || Boolean(previewText);

  const displaySuggested = suggestedTools && suggestedTools.length > 0
    ? suggestedTools
    : DEFAULT_SUGGESTED_TOOLS;

  return (
    <div className="w-full my-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/5 dark:to-slate-950/20 border-2 border-emerald-500/40 dark:border-emerald-500/50 shadow-2xl backdrop-blur-xs transition-all animate-in fade-in zoom-in-95 duration-300">
      
      {/* Top Status & Pro Feature Guarantee Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/30">
            ✓
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-950 dark:text-white tracking-tight">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                {badgeText}
              </span>
              <span className="text-[11px] text-gray-400 dark:text-slate-500">•</span>
              <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400">
                Processed 100% In-Browser
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Free Pro Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 shadow-2xs">
            <span>👑</span>
            <span>Premium Quality — 100% Free Forever</span>
          </div>

          {/* Share / Copy Tool Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:border-primary-500 transition-colors shadow-2xs"
            title="Share this tool"
          >
            <span>{copiedLink ? '✓' : '🔗'}</span>
            <span>{copiedLink ? 'Link Copied!' : 'Share Tool'}</span>
          </button>
        </div>
      </div>

      {/* Reduction & Space Savings Highlight Bar (When Available) */}
      {(savingsPercentage !== null || formattedOriginalSize) && (
        <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-bold">
              🎉
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {savingsPercentage !== null && savingsPercentage > 0
                  ? `Optimized & Reduced by ${savingsPercentage}%`
                  : 'Document Successfully Optimized'}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                {formattedOriginalSize && (
                  <span>
                    Original: <strong className="line-through text-gray-400">{formattedOriginalSize}</strong>
                  </span>
                )}
                {formattedOriginalSize && formattedSize && <span>→</span>}
                {formattedSize && (
                  <span>
                    Optimized: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formattedSize}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {savingsPercentage !== null && savingsPercentage > 0 && (
            <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-white shadow-xs">
              Saved {savingsPercentage}% Space
            </span>
          )}
        </div>
      )}

      {/* 1. EMBEDDED LIVE PREVIEW */}
      {previewUrl && (isPdf || isImage) && (
        <div className="mb-6 rounded-2xl overflow-hidden border border-emerald-500/30 bg-gray-100 dark:bg-slate-900 shadow-md">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Interactive Output Preview</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 font-semibold"
              >
                <span>New Tab</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          {showPreview && (
            <div className="relative">
              {isPdf ? (
                <iframe
                  src={`${previewUrl}#view=FitH`}
                  title="Live Result Document Preview"
                  className="w-full h-80 sm:h-[480px] bg-white dark:bg-slate-950 border-0"
                />
              ) : (
                <div className="p-4 flex items-center justify-center bg-gray-100 dark:bg-slate-900/60 min-h-[240px]">
                  <img
                    src={previewUrl}
                    alt={filename}
                    className="max-h-96 max-w-full rounded-xl object-contain shadow-md"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Text Preview for code / ocr / converted data */}
      {isText && previewText && (
        <div className="mb-6 rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-900 text-slate-100 shadow-md">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-xs font-semibold text-slate-300">
            <span>Result Preview</span>
            <button
              onClick={handleCopyPreviewText}
              className="text-primary-400 hover:text-primary-300 font-bold flex items-center gap-1"
            >
              <span>{copiedText ? '✓' : '📋'}</span>
              <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>
          <pre className="p-4 max-h-64 overflow-auto text-xs font-mono whitespace-pre-wrap selection:bg-primary-600">
            {previewText}
          </pre>
        </div>
      )}

      {/* 2. FILE INFO & PROMINENT DOWNLOAD CTA */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/20 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0">
            {isImage ? '🖼️' : '📄'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-gray-950 dark:text-white truncate" title={filename}>
              {filename}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              {formattedSize && (
                <span>
                  Size: <strong className="text-gray-900 dark:text-slate-200">{formattedSize}</strong>
                </span>
              )}
              {details.map((d, idx) => (
                <span key={idx}>
                  • {d.label}: <strong className="text-gray-900 dark:text-slate-200">{d.value}</strong>
                </span>
              ))}
              <span>• 🔒 In-Browser Private</span>
            </div>
          </div>
        </div>

        {/* Big Download Button with Keyboard Hint */}
        <div className="flex flex-col sm:items-end gap-1 sm:shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={downloadUrl}
              download={filename}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all active:scale-95 flex items-center justify-center gap-2.5"
            >
              <span className="text-xl">📥</span>
              <span>Download Processed File</span>
              {formattedSize && <span className="text-xs font-normal opacity-90">({formattedSize})</span>}
            </a>

            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                title="View full document"
              >
                <span>👁️</span>
                <span>Full View</span>
              </a>
            )}
          </div>
          <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono hidden sm:block">
            Keyboard shortcut: ⌘S or Ctrl+S
          </span>
        </div>
      </div>

      {/* 3. FREE TIER UNLOCKED FEATURES & TRUST PILLARS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs text-gray-600 dark:text-slate-300">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-gray-200/80 dark:border-slate-800">
          <span className="text-emerald-500 font-black text-sm">✓</span>
          <div>
            <strong className="text-gray-900 dark:text-white block">100% In-Browser Private</strong>
            <span className="text-[11px] text-gray-500 dark:text-slate-400">Zero files ever uploaded to servers</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-gray-200/80 dark:border-slate-800">
          <span className="text-emerald-500 font-black text-sm">✓</span>
          <div>
            <strong className="text-gray-900 dark:text-white block">Unlimited File Size</strong>
            <span className="text-[11px] text-gray-500 dark:text-slate-400">No daily counters or queue limits</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-gray-200/80 dark:border-slate-800">
          <span className="text-emerald-500 font-black text-sm">✓</span>
          <div>
            <strong className="text-gray-900 dark:text-white block">Zero Watermarks</strong>
            <span className="text-[11px] text-gray-500 dark:text-slate-400">Commercial & legal grade output</span>
          </div>
        </div>
      </div>

      {/* 4. RECOMMENDED NEXT WORKFLOW ACTIONS */}
      <div className="mb-6 pt-5 border-t border-emerald-500/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>⚡</span>
            <span>Recommended Next Steps:</span>
          </span>
          <span className="text-[11px] text-gray-400 dark:text-slate-500">Continue workflow seamlessly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {nextTool && (
            <Link
              href={nextTool.url}
              className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800/80 hover:border-primary-500 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">🚀</span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-primary-600 text-white">
                  Direct Next
                </span>
              </div>
              <span className="text-xs font-bold text-primary-950 dark:text-primary-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                {nextTool.name}
              </span>
            </Link>
          )}

          {displaySuggested.map((tool, idx) => (
            <Link
              key={idx}
              href={tool.url}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">{tool.icon}</span>
                {tool.badge && (
                  <span className="text-[9px] font-bold uppercase text-gray-400 dark:text-slate-500">
                    {tool.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                {tool.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 5. BOTTOM ACTIONS: RESET */}
      {onReset && (
        <div className="flex items-center justify-between pt-4 border-t border-emerald-500/20 text-xs">
          <span className="text-gray-400 dark:text-slate-500">Finished with this task?</span>
          <button
            onClick={onReset}
            className="font-bold text-gray-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60"
          >
            <span>🔄</span>
            <span>{resetButtonText}</span>
          </button>
        </div>
      )}
    </div>
  );
}
