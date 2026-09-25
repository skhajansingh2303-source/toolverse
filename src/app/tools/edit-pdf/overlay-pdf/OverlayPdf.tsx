'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import { PDFDocument } from 'pdf-lib';

export default function OverlayPdf() {
  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [basePageCount, setBasePageCount] = useState<number>(0);
  const [overlayPageCount, setOverlayPageCount] = useState<number>(0);

  // Overlay settings
  const [position, setPosition] = useState<'background' | 'foreground'>('background');
  const [opacity, setOpacity] = useState<number>(100);
  const [pageScope, setPageScope] = useState<'all' | 'first' | 'except-first' | 'custom'>('all');
  const [customRange, setCustomRange] = useState<string>('1');
  const [scaleMode, setScaleMode] = useState<'fit' | 'center'>('fit');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const baseInputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);

  const handleBaseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Base document must be a PDF file.');
      return;
    }
    setErrorMsg('');
    setBaseFile(file);
    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setBasePageCount(doc.getPageCount());
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not read base PDF. The file may be password protected or invalid.');
      setBaseFile(null);
      setBasePageCount(0);
    }
  };

  const handleOverlayUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Overlay / stationery file must be a PDF document.');
      return;
    }
    setErrorMsg('');
    setOverlayFile(file);
    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setOverlayPageCount(doc.getPageCount());
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not read overlay PDF. The file may be password protected or invalid.');
      setOverlayFile(null);
      setOverlayPageCount(0);
    }
  };

  const parsePagesToApply = (scope: string, maxPages: number, customStr: string): Set<number> => {
    const set = new Set<number>();
    if (scope === 'all') {
      for (let i = 0; i < maxPages; i++) set.add(i);
    } else if (scope === 'first') {
      if (maxPages > 0) set.add(0);
    } else if (scope === 'except-first') {
      for (let i = 1; i < maxPages; i++) set.add(i);
    } else if (scope === 'custom') {
      const parts = customStr.split(',').map((p) => p.trim()).filter(Boolean);
      for (const part of parts) {
        if (part.includes('-')) {
          const [s, e] = part.split('-').map((n) => parseInt(n, 10));
          if (!isNaN(s) && !isNaN(e)) {
            const start = Math.max(1, Math.min(s, e));
            const end = Math.min(maxPages, Math.max(s, e));
            for (let i = start; i <= end; i++) set.add(i - 1);
          }
        } else {
          const p = parseInt(part, 10);
          if (!isNaN(p) && p >= 1 && p <= maxPages) set.add(p - 1);
        }
      }
    }
    return set;
  };

  const processOverlay = async () => {
    if (!baseFile || !overlayFile) {
      setErrorMsg('Please select both a Base Document and an Overlay / Letterhead PDF.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const [baseBytes, overlayBytes] = await Promise.all([
        baseFile.arrayBuffer(),
        overlayFile.arrayBuffer(),
      ]);

      const baseDoc = await PDFDocument.load(baseBytes, { ignoreEncryption: true });
      const overlayDoc = await PDFDocument.load(overlayBytes, { ignoreEncryption: true });

      const totalBasePages = baseDoc.getPageCount();
      const totalOverlayPages = overlayDoc.getPageCount();

      const pagesToOverlay = parsePagesToApply(pageScope, totalBasePages, customRange);
      const opacityFloat = Math.max(0.1, Math.min(1.0, opacity / 100));

      const resultDoc = await PDFDocument.create();

      // Embed overlay pages into result doc
      const embeddedOverlayPages = await resultDoc.embedPdf(
        overlayDoc,
        Array.from({ length: totalOverlayPages }, (_, i) => i)
      );

      // Embed base document pages into result doc
      const embeddedBasePages = await resultDoc.embedPdf(
        baseDoc,
        Array.from({ length: totalBasePages }, (_, i) => i)
      );

      for (let i = 0; i < totalBasePages; i++) {
        const basePage = baseDoc.getPage(i);
        const { width: bWidth, height: bHeight } = basePage.getSize();
        const page = resultDoc.addPage([bWidth, bHeight]);

        const shouldOverlay = pagesToOverlay.has(i);
        const overlayIdx = Math.min(i, totalOverlayPages - 1);
        const embeddedOverlay = embeddedOverlayPages[overlayIdx];
        const embeddedBase = embeddedBasePages[i];

        // Determine overlay dimension and offset
        let oX = 0;
        let oY = 0;
        let oWidth = bWidth;
        let oHeight = bHeight;

        if (scaleMode === 'center') {
          const overlayOrigPage = overlayDoc.getPage(overlayIdx);
          const { width: origOWidth, height: origOHeight } = overlayOrigPage.getSize();
          oWidth = origOWidth;
          oHeight = origOHeight;
          oX = (bWidth - oWidth) / 2;
          oY = (bHeight - oHeight) / 2;
        }

        if (shouldOverlay) {
          if (position === 'background') {
            // Draw overlay first (underneath), then draw base page on top
            page.drawPage(embeddedOverlay, {
              x: oX,
              y: oY,
              width: oWidth,
              height: oHeight,
              opacity: opacityFloat,
            });
            page.drawPage(embeddedBase, {
              x: 0,
              y: 0,
              width: bWidth,
              height: bHeight,
              opacity: 1.0,
            });
          } else {
            // Draw base page first, then stamp overlay on top
            page.drawPage(embeddedBase, {
              x: 0,
              y: 0,
              width: bWidth,
              height: bHeight,
              opacity: 1.0,
            });
            page.drawPage(embeddedOverlay, {
              x: oX,
              y: oY,
              width: oWidth,
              height: oHeight,
              opacity: opacityFloat,
            });
          }
        } else {
          // No overlay on this page, simply draw base page
          page.drawPage(embeddedBase, {
            x: 0,
            y: 0,
            width: bWidth,
            height: bHeight,
            opacity: 1.0,
          });
        }
      }

      const mergedBytes = await resultDoc.save();
      const blob = new Blob([mergedBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseFile.name.replace(/\.[^/.]+$/, '')}_overlaid.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMsg(`Successfully stamped overlay onto ${pagesToOverlay.size} page(s)! Your merged PDF is downloading.`);
      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: '📄 PDF Overlay merged and downloaded successfully!' },
        })
      );
    } catch (err: any) {
      console.error('Overlay error:', err);
      setErrorMsg(err.message || 'An error occurred while merging the overlay PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const swapDocuments = () => {
    const tempFile = baseFile;
    const tempCount = basePageCount;
    setBaseFile(overlayFile);
    setBasePageCount(overlayPageCount);
    setOverlayFile(tempFile);
    setOverlayPageCount(tempCount);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-semibold">PDF Overlay</span>
        </nav>

        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-700 flex items-center justify-center text-white text-xl shadow-sm">
              📄
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              PDF Overlay - Stamp Letterhead & Stationery
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            Overlay or stamp letterhead, stationery, and templates onto your PDF documents easily. Merge in background or foreground with custom opacity.
          </p>
        </header>

        <AdSlot format="horizontal" />

        {/* Dual Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-6">
          {/* Base Document Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  1. Base Document
                </span>
                <span className="text-[11px] text-gray-400 dark:text-slate-400">Contract, invoice, report</span>
              </div>

              {!baseFile ? (
                <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 rounded-2xl p-8 text-center transition-colors group bg-gray-50/50 dark:bg-slate-950">
                  <input
                    type="file"
                    ref={baseInputRef}
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      handleBaseUpload(e);
                      e.target.value = '';
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="pointer-events-none flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                      📄
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                      Choose Base PDF
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mb-3">
                      Drop document to be stamped
                    </p>
                    <span className="px-4 py-1.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-semibold rounded-lg shadow-xs inline-block">
                      Browse Files
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📋</span>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-xs text-gray-900 dark:text-white truncate max-w-[200px]">
                          {baseFile.name}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400">
                          {basePageCount} pages • {(baseFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setBaseFile(null);
                        setBasePageCount(0);
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Overlay / Stationery Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  2. Overlay / Stationery PDF
                </span>
                <span className="text-[11px] text-gray-400 dark:text-slate-400">Letterhead, border, watermark</span>
              </div>

              {!overlayFile ? (
                <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-purple-500 rounded-2xl p-8 text-center transition-colors group bg-gray-50/50 dark:bg-slate-950">
                  <input
                    type="file"
                    ref={overlayInputRef}
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      handleOverlayUpload(e);
                      e.target.value = '';
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="pointer-events-none flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                      🎨
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                      Choose Overlay PDF
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mb-3">
                      Drop letterhead or template
                    </p>
                    <span className="px-4 py-1.5 bg-purple-600 group-hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs inline-block">
                      Browse Files
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🖼️</span>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-xs text-gray-900 dark:text-white truncate max-w-[200px]">
                          {overlayFile.name}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400">
                          {overlayPageCount} pages • {(overlayFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setOverlayFile(null);
                        setOverlayPageCount(0);
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Swap button if both are selected */}
        {baseFile && overlayFile && (
          <div className="flex justify-center -mt-4 mb-6">
            <button
              onClick={swapDocuments}
              className="text-xs font-bold px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xs text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
            >
              🔄 Swap Base & Overlay
            </button>
          </div>
        )}

        {/* Settings & Execution Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm mb-8">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
            Overlay Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Position */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 dark:text-slate-300 mb-2">
                Layer Placement
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPosition('background')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    position === 'background'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <p className="font-extrabold mb-0.5">Underneath (Background)</p>
                  <p className="text-[11px] font-normal text-gray-500 dark:text-slate-400">
                    Ideal for letterhead & stationery
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPosition('foreground')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    position === 'foreground'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <p className="font-extrabold mb-0.5">On Top (Foreground)</p>
                  <p className="text-[11px] font-normal text-gray-500 dark:text-slate-400">
                    Ideal for stamps, logos & borders
                  </p>
                </button>
              </div>
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase text-gray-700 dark:text-slate-300">
                  Overlay Opacity: {opacity}%
                </label>
                <span className="text-[11px] text-gray-400 dark:text-slate-400">
                  {opacity === 100 ? 'Solid (100%)' : opacity < 40 ? 'Watermark' : 'Semi-transparent'}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={opacity}
                onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
                className="w-full accent-primary-600 h-2 bg-gray-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-400 mt-1">
                <span>10% (Faint)</span>
                <span>50%</span>
                <span>100% (Full)</span>
              </div>
            </div>

            {/* Page Scope */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 dark:text-slate-300 mb-2">
                Apply Overlay To
              </label>
              <select
                value={pageScope}
                onChange={(e) => setPageScope(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Pages ({basePageCount || 0})</option>
                <option value="first">First Page Only (Cover / Header)</option>
                <option value="except-first">All Except First Page</option>
                <option value="custom">Custom Page Range</option>
              </select>

              {pageScope === 'custom' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customRange}
                    onChange={(e) => setCustomRange(e.target.value)}
                    placeholder="e.g. 1-2, 4"
                    className="w-full text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-2.5"
                  />
                  <p className="text-[10px] text-gray-400 dark:text-slate-400 mt-1">Comma-separated page numbers or ranges (e.g. 1, 3-5)</p>
                </div>
              )}
            </div>

            {/* Scale Mode */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 dark:text-slate-300 mb-2">
                Scaling & Dimensions
              </label>
              <select
                value={scaleMode}
                onChange={(e) => setScaleMode(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-primary-500"
              >
                <option value="fit">Fit / Stretch Overlay to Base Page Dimensions</option>
                <option value="center">Preserve Original Dimensions & Center</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
              {successMsg}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={processOverlay}
              disabled={isProcessing || !baseFile || !overlayFile}
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-xl px-8 py-3 text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Merging Overlay...
                </>
              ) : (
                <>✨ Merge & Download Overlay PDF</>
              )}
            </button>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use PDF Overlay
          </h2>
          <ol className="list-decimal pl-5 space-y-2.5 text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            <li>
              Upload your <strong>Base Document</strong> (such as an invoice, contract, or report).
            </li>
            <li>
              Upload your <strong>Overlay PDF</strong> (such as your organization&apos;s letterhead, background graphics, or watermark).
            </li>
            <li>
              Select whether to place the overlay in the <strong>Background</strong> (behind base content) or <strong>Foreground</strong> (on top), and customize the opacity level.
            </li>
            <li>
              Choose the target pages (All, First Page Only, or a Custom Range), and click <strong>&quot;Merge & Download Overlay PDF&quot;</strong>.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
