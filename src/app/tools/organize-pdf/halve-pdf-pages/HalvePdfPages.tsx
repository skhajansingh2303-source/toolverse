'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import FeedbackWidget from '@/components/FeedbackWidget';
import RelatedTools from '@/components/RelatedTools';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';
import { PDFDocument } from 'pdf-lib';

type SplitDirection = 'vertical' | 'horizontal';
type VerticalOrder = 'ltr' | 'rtl';
type HorizontalOrder = 'top-to-bottom' | 'bottom-to-top';

export default function HalvePdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [splitDirection, setSplitDirection] = useState<SplitDirection>('vertical');
  const [verticalOrder, setVerticalOrder] = useState<VerticalOrder>('ltr');
  const [horizontalOrder, setHorizontalOrder] = useState<HorizontalOrder>('top-to-bottom');
  const [skipFirstPage, setSkipFirstPage] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [halvedBlob, setHalvedBlob] = useState<Blob | null>(null);
  const [originalPageCount, setOriginalPageCount] = useState<number>(0);
  const [resultingPageCount, setResultingPageCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);
    setDownloadUrl(null);
    setHalvedBlob(null);
    setErrorMsg(null);

    try {
      const buffer = await uploaded.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();
      setOriginalPageCount(count);
      setResultingPageCount(skipFirstPage ? 1 + (count - 1) * 2 : count * 2);
    } catch {
      setOriginalPageCount(0);
    }
  };

  const executeHalving = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pageCount = srcDoc.getPageCount();

      const destDoc = await PDFDocument.create();

      for (let i = 0; i < pageCount; i++) {
        // If skipping cover page (Page 1)
        if (i === 0 && skipFirstPage) {
          const [singlePage] = await destDoc.copyPages(srcDoc, [0]);
          destDoc.addPage(singlePage);
          continue;
        }

        const srcPage = srcDoc.getPage(i);
        const { x: origX, y: origY, width, height } = srcPage.getMediaBox();

        if (splitDirection === 'vertical') {
          const halfWidth = width / 2;

          // Copy page twice: once for left half, once for right half
          const [leftHalf, rightHalf] = await destDoc.copyPages(srcDoc, [i, i]);

          // Left Half
          leftHalf.setMediaBox(origX, origY, halfWidth, height);
          leftHalf.setCropBox(origX, origY, halfWidth, height);

          // Right Half
          rightHalf.setMediaBox(origX + halfWidth, origY, halfWidth, height);
          rightHalf.setCropBox(origX + halfWidth, origY, halfWidth, height);

          if (verticalOrder === 'ltr') {
            destDoc.addPage(leftHalf);
            destDoc.addPage(rightHalf);
          } else {
            destDoc.addPage(rightHalf);
            destDoc.addPage(leftHalf);
          }
        } else {
          // Horizontal Split
          const halfHeight = height / 2;

          const [part1, part2] = await destDoc.copyPages(srcDoc, [i, i]);

          // Top Half (PDF Y starts at bottom)
          const topHalf = part1;
          topHalf.setMediaBox(origX, origY + halfHeight, width, halfHeight);
          topHalf.setCropBox(origX, origY + halfHeight, width, halfHeight);

          // Bottom Half
          const bottomHalf = part2;
          bottomHalf.setMediaBox(origX, origY, width, halfHeight);
          bottomHalf.setCropBox(origX, origY, width, halfHeight);

          if (horizontalOrder === 'top-to-bottom') {
            destDoc.addPage(topHalf);
            destDoc.addPage(bottomHalf);
          } else {
            destDoc.addPage(bottomHalf);
            destDoc.addPage(topHalf);
          }
        }
      }

      const pdfBytes = await destDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      setHalvedBlob(blob);

      const countAfter = destDoc.getPageCount();
      setResultingPageCount(countAfter);

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `📖 Spreads Halved into ${countAfter} Single Pages!` },
        })
      );
    } catch (err: any) {
      console.error('Halving error:', err);
      setErrorMsg(
        err.message || 'Failed to halve PDF spreads. Please verify document is not encrypted.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Halve PDF Pages</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xl shadow-sm">
            📖
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Halve PDF Double-Page Spreads
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Split 2-page scanned book spreads, magazine spreads, and 2-up PDFs into individual, reading-friendly single pages.
        </p>
      </div>

      <AdSlot format="horizontal" />

      {/* Main Container */}
      <div className="mt-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
        {!file ? (
          <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 rounded-3xl p-10 transition-colors group bg-gray-50/50 dark:bg-slate-950/40 text-center">
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                handleFileUpload(e);
                e.target.value = '';
              }}
            />
            <div className="pointer-events-none flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-3xl mb-3 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                📖
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Upload Two-Page Spread PDF
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                Drag &amp; drop your scanned book or magazine PDF here
              </p>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/60">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0 font-bold">
                  📄
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {originalPageCount} Original Spreads → ~{resultingPageCount || originalPageCount * 2} Single Pages
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setDownloadUrl(null);
                  setHalvedBlob(null);
                }}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors font-medium"
              >
                Choose Different PDF
              </button>
            </div>

            {/* Split Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
              {/* Split Options */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                    Split Cut Orientation
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSplitDirection('vertical')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        splitDirection === 'vertical'
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold'
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>║</span>
                        <span>Vertical Split</span>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                        Left &amp; Right Pages (Standard Books)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSplitDirection('horizontal')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        splitDirection === 'horizontal'
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold'
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>═</span>
                        <span>Horizontal Split</span>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                        Top &amp; Bottom Pages (Calendars/Notepads)
                      </div>
                    </button>
                  </div>
                </div>

                {/* Reading Order Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                    Reading Order Sequence
                  </label>
                  {splitDirection === 'vertical' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setVerticalOrder('ltr')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          verticalOrder === 'ltr'
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold'
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">Left → Right (LTR)</div>
                        <div className="text-[10px] text-gray-400 dark:text-slate-400">English, Latin, Spanish</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVerticalOrder('rtl')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          verticalOrder === 'rtl'
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold'
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">Right → Left (RTL)</div>
                        <div className="text-[10px] text-gray-400 dark:text-slate-400">Arabic, Hebrew, Manga</div>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setHorizontalOrder('top-to-bottom')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          horizontalOrder === 'top-to-bottom'
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold'
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">Top → Bottom</div>
                        <div className="text-[10px] text-gray-400 dark:text-slate-400">Upper page first</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHorizontalOrder('bottom-to-top')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          horizontalOrder === 'bottom-to-top'
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold'
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">Bottom → Top</div>
                        <div className="text-[10px] text-gray-400 dark:text-slate-400">Lower page first</div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Exclude Cover Page Option */}
                <div className="pt-1">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={skipFirstPage}
                      onChange={(e) => {
                        setSkipFirstPage(e.target.checked);
                        setResultingPageCount(
                          e.target.checked
                            ? 1 + (originalPageCount - 1) * 2
                            : originalPageCount * 2
                        );
                      }}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-slate-700"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-gray-900 dark:text-white block">
                        Keep Page 1 as Single Cover Page
                      </span>
                      <span className="text-gray-500 dark:text-slate-400 text-[11px]">
                        Leave front cover untouched; halve only subsequent spreads (Pages 2+)
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Visual Split Guide Diagram */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Live Split Cut Visualization
                </span>

                <div className="relative w-56 h-36 border-2 border-primary-500/80 rounded-lg bg-gray-50 dark:bg-slate-950 shadow-inner overflow-hidden flex">
                  {splitDirection === 'vertical' ? (
                    <>
                      {/* Left Half */}
                      <div className="w-1/2 h-full flex flex-col items-center justify-center p-2 text-center bg-blue-50/40 dark:bg-blue-950/20 border-r-2 border-dashed border-red-500 relative">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-600 text-white shadow-xs">
                          {verticalOrder === 'ltr' ? 'Page 1' : 'Page 2'}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-400 mt-1">Left Half</span>
                      </div>

                      {/* Right Half */}
                      <div className="w-1/2 h-full flex flex-col items-center justify-center p-2 text-center bg-emerald-50/40 dark:bg-emerald-950/20 relative">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-600 text-white shadow-xs">
                          {verticalOrder === 'ltr' ? 'Page 2' : 'Page 1'}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-400 mt-1">Right Half</span>
                      </div>

                      {/* Cut line tag */}
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                        CUT ✂
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col">
                      {/* Top Half */}
                      <div className="w-full h-1/2 flex items-center justify-between px-4 bg-blue-50/40 dark:bg-blue-950/20 border-b-2 border-dashed border-red-500 relative">
                        <span className="text-[10px] text-gray-400 dark:text-slate-400">Top Half</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-600 text-white shadow-xs">
                          {horizontalOrder === 'top-to-bottom' ? 'Page 1' : 'Page 2'}
                        </span>
                      </div>

                      {/* Bottom Half */}
                      <div className="w-full h-1/2 flex items-center justify-between px-4 bg-emerald-50/40 dark:bg-emerald-950/20 relative">
                        <span className="text-[10px] text-gray-400 dark:text-slate-400">Bottom Half</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-600 text-white shadow-xs">
                          {horizontalOrder === 'top-to-bottom' ? 'Page 2' : 'Page 1'}
                        </span>
                      </div>

                      {/* Cut line tag */}
                      <div className="absolute top-1/2 left-2 -translate-y-1/2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                        CUT ✂
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-3 text-center max-w-xs">
                  Original vector quality and selectable text are 100% preserved using precise viewport boundary clipping.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={executeHalving}
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Halving PDF Spreads...</span>
                  </>
                ) : (
                  <>
                    <span>Halve Pages &amp; Download PDF</span>
                    <span>→</span>
                  </>
                )}
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={`halved-${file.name}`}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  <span>Download Halved PDF ↓</span>
                </a>
              )}
            </div>

            {/* Live Document Preview */}
            {halvedBlob && (
              <div className="pt-4">
                <DocumentLiveViewer
                  file={halvedBlob}
                  fileName={`halved-${file.name}`}
                  title="Halved Single-Page PDF Preview"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <FeedbackWidget toolName="Halve PDF Pages" />
      <RelatedTools currentSlug="halve-pdf-pages" />

      {/* How to Use Section */}
      <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          How to Halve PDF Double-Page Spreads
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-primary-600 text-sm">1. Upload 2-Page Spreads</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Select Book or Magazine</p>
            <p className="mt-0.5">
              Choose any PDF where two pages are placed side-by-side on a single landscape sheet.
            </p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">2. Choose Cut &amp; Reading Order</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Configure Split</p>
            <p className="mt-0.5">
              Select Vertical Split for standard books, pick Left-to-Right or Right-to-Left (for RTL / manga), or preserve the cover.
            </p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">3. Download Individual Pages</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Read on e-Readers</p>
            <p className="mt-0.5">
              Instantly download clean single pages, perfectly formatted for tablets, Kindle, and mobile reading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
