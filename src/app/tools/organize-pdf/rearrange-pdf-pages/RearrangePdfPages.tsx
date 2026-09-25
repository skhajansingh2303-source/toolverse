'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import FeedbackWidget from '@/components/FeedbackWidget';
import RelatedTools from '@/components/RelatedTools';
import { PDFDocument } from 'pdf-lib';

export default function RearrangePdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile || uploadedFile.type !== 'application/pdf') return;

    setFile(uploadedFile);
    try {
      const bytes = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();
      setPageOrder(Array.from({ length: count }, (_, i) => i));
    } catch {
      setPageOrder([]);
    }
  };

  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pageOrder.length) return;
    const updated = [...pageOrder];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setPageOrder(updated);
  };

  const reverseOrder = () => {
    setPageOrder((prev) => [...prev].reverse());
  };

  const resetOrder = () => {
    if (!file) return;
    setPageOrder(Array.from({ length: pageOrder.length }, (_, i) => i));
  };

  const saveReordered = async () => {
    if (!file || pageOrder.length === 0) return;
    setIsProcessing(true);

    try {
      const sourceBytes = await file.arrayBuffer();
      const sourceDoc = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
      const outputDoc = await PDFDocument.create();

      const copiedPages = await outputDoc.copyPages(sourceDoc, pageOrder);
      copiedPages.forEach((page) => outputDoc.addPage(page));

      const pdfBytes = await outputDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reordered-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.dispatchEvent(new CustomEvent('toolsverse-toast', { detail: { message: '📄 PDF Pages Reordered & Downloaded!' } }));
    } catch (err) {
      console.error(err);
      alert('Error reordering PDF pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Rearrange PDF Pages</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-sm">
              📑
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Rearrange &amp; Sort PDF Pages
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
            Reorder pages, reverse order, and organize multi-page documents visually.
          </p>
        </div>

        {file && pageOrder.length > 0 && (
          <button
            onClick={saveReordered}
            disabled={isProcessing}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-primary-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
          >
            {isProcessing ? <span>Processing...</span> : <span>Save &amp; Download PDF ↓</span>}
          </button>
        )}
      </div>

      <AdSlot format="horizontal" />

      {/* Main Container */}
      <div className="mt-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
        {!file ? (
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 rounded-2xl p-10 transition-colors group bg-gray-50/50 dark:bg-slate-950/40">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                handleFileUpload(e);
                e.target.value = '';
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title=""
            />
            <div className="pointer-events-none flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-2xl text-primary-600 dark:text-primary-400 mb-3 group-hover:scale-110 transition-transform">
                📂
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Choose PDF to Reorder
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-400 mb-4">Drag and drop your document here</span>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
              <div className="text-xs">
                <span className="font-bold text-gray-900 dark:text-white">{file.name}</span>
                <span className="text-gray-400 dark:text-slate-400 ml-2">({pageOrder.length} pages)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={reverseOrder}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors shadow-2xs"
                >
                  🔄 Reverse All
                </button>
                <button
                  onClick={resetOrder}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors shadow-2xs"
                >
                  Reset
                </button>
                <button
                  onClick={() => setFile(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Visual Page Reordering Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {pageOrder.map((pageIdx, currentPosition) => (
                <div
                  key={`${pageIdx}-${currentPosition}`}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 flex flex-col justify-between items-center text-center group hover:shadow-md transition-all"
                >
                  {/* Page Preview Placeholder */}
                  <div className="w-full aspect-[3/4] rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-2xs flex flex-col items-center justify-center p-2 mb-2">
                    <span className="text-xs uppercase font-extrabold text-gray-400 dark:text-slate-400">Orig</span>
                    <span className="text-lg font-black text-primary-600 dark:text-primary-400">
                      p.{pageIdx + 1}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-400 mt-1">
                      → Pos {currentPosition + 1}
                    </span>
                  </div>

                  {/* Move Controls */}
                  <div className="flex items-center gap-1 w-full justify-between pt-1 border-t border-gray-200 dark:border-slate-700">
                    <button
                      onClick={() => movePage(currentPosition, currentPosition - 1)}
                      disabled={currentPosition === 0}
                      className="p-1 rounded bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-200 disabled:opacity-30 text-xs hover:bg-gray-100 dark:hover:bg-slate-600 font-bold"
                      title="Move left"
                    >
                      ←
                    </button>
                    <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">
                      #{currentPosition + 1}
                    </span>
                    <button
                      onClick={() => movePage(currentPosition, currentPosition + 1)}
                      disabled={currentPosition === pageOrder.length - 1}
                      className="p-1 rounded bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-200 disabled:opacity-30 text-xs hover:bg-gray-100 dark:hover:bg-slate-600 font-bold"
                      title="Move right"
                    >
                      →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Save Button */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={saveReordered}
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-primary-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? <span>Reordering Pages...</span> : <span>Save &amp; Download Reordered PDF ↓</span>}
              </button>
            </div>

          </div>
        )}
      </div>

      <FeedbackWidget toolName="Rearrange PDF Pages" />
      <RelatedTools currentSlug="rearrange-pdf-pages" />

      {/* How to Use Section */}
      <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          How to Rearrange Pages in a PDF
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-primary-600 text-sm">1. Upload Document</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Choose Any Multi-Page PDF</p>
            <p className="mt-0.5">Upload your file to load all pages in a visual interactive grid.</p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">2. Move &amp; Sort</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Adjust Positions</p>
            <p className="mt-0.5">Use the arrow buttons to shift pages left or right, or click Reverse to invert sequence.</p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">3. Download Result</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Instant Export</p>
            <p className="mt-0.5">Download your neatly reorganized PDF in milliseconds with 100% privacy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
