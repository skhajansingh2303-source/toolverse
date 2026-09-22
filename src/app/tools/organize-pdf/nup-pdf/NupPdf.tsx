'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import FeedbackWidget from '@/components/FeedbackWidget';
import RelatedTools from '@/components/RelatedTools';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';
import { PDFDocument, rgb } from 'pdf-lib';

export default function NupPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [layout, setLayout] = useState<'2up' | '4up'>('2up');
  const [drawBorder, setDrawBorder] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile || uploadedFile.type !== 'application/pdf') return;

    setFile(uploadedFile);
    try {
      const bytes = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setPageCount(pdfDoc.getPageCount());
    } catch {
      setPageCount(null);
    }
  };

  const outputSheetCount = useMemo(() => {
    if (!pageCount) return 0;
    const perSheet = layout === '2up' ? 2 : 4;
    return Math.ceil(pageCount / perSheet);
  }, [pageCount, layout]);

  const processNup = async () => {
    if (!file || !pageCount) return;
    setIsProcessing(true);

    try {
      const sourceBytes = await file.arrayBuffer();
      const outputPdf = await PDFDocument.create();

      if (layout === '2up') {
        // A4 Landscape: 841.89 x 595.28
        const sheetWidth = 841.89;
        const sheetHeight = 595.28;
        const margin = 24;
        const gap = 16;
        const slotWidth = (sheetWidth - (margin * 2) - gap) / 2;
        const slotHeight = sheetHeight - (margin * 2);

        for (let i = 0; i < pageCount; i += 2) {
          const newPage = outputPdf.addPage([sheetWidth, sheetHeight]);
          const pagesToEmbed = [i];
          if (i + 1 < pageCount) pagesToEmbed.push(i + 1);

          const embeddedPages = await outputPdf.embedPdf(sourceBytes, pagesToEmbed);

          embeddedPages.forEach((emb, idx) => {
            const slotX = margin + idx * (slotWidth + gap);
            const slotY = margin;

            // Maintain aspect ratio within slot
            const scale = Math.min(slotWidth / emb.width, slotHeight / emb.height);
            const drawW = emb.width * scale;
            const drawH = emb.height * scale;
            const offsetX = slotX + (slotWidth - drawW) / 2;
            const offsetY = slotY + (slotHeight - drawH) / 2;

            if (drawBorder) {
              newPage.drawRectangle({
                x: offsetX,
                y: offsetY,
                width: drawW,
                height: drawH,
                borderColor: rgb(0.8, 0.8, 0.8),
                borderWidth: 0.5,
              });
            }

            newPage.drawPage(emb, {
              x: offsetX,
              y: offsetY,
              width: drawW,
              height: drawH,
            });
          });
        }
      } else {
        // 4-Up: A4 Portrait: 595.28 x 841.89 (2x2 grid)
        const sheetWidth = 595.28;
        const sheetHeight = 841.89;
        const margin = 20;
        const gap = 12;
        const slotWidth = (sheetWidth - (margin * 2) - gap) / 2;
        const slotHeight = (sheetHeight - (margin * 2) - gap) / 2;

        for (let i = 0; i < pageCount; i += 4) {
          const newPage = outputPdf.addPage([sheetWidth, sheetHeight]);
          const pagesToEmbed = [];
          for (let j = 0; j < 4 && (i + j) < pageCount; j++) {
            pagesToEmbed.push(i + j);
          }

          const embeddedPages = await outputPdf.embedPdf(sourceBytes, pagesToEmbed);

          embeddedPages.forEach((emb, idx) => {
            // idx 0: top-left, 1: top-right, 2: bottom-left, 3: bottom-right
            const col = idx % 2;
            const row = Math.floor(idx / 2); // 0 = top, 1 = bottom

            const slotX = margin + col * (slotWidth + gap);
            const slotY = row === 0
              ? sheetHeight - margin - slotHeight
              : margin;

            const scale = Math.min(slotWidth / emb.width, slotHeight / emb.height);
            const drawW = emb.width * scale;
            const drawH = emb.height * scale;
            const offsetX = slotX + (slotWidth - drawW) / 2;
            const offsetY = slotY + (slotHeight - drawH) / 2;

            if (drawBorder) {
              newPage.drawRectangle({
                x: offsetX,
                y: offsetY,
                width: drawW,
                height: drawH,
                borderColor: rgb(0.8, 0.8, 0.8),
                borderWidth: 0.5,
              });
            }

            newPage.drawPage(emb, {
              x: offsetX,
              y: offsetY,
              width: drawW,
              height: drawH,
            });
          });
        }
      }

      const pdfBytes = await outputPdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${layout}-printed-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.dispatchEvent(new CustomEvent('toolsverse-toast', { detail: { message: `🖨️ Converted to ${layout.toUpperCase()}! Paper saved.` } }));
    } catch (err) {
      console.error(err);
      alert('Error formatting pages per sheet. Please try another PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Pages Per Sheet</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl shadow-sm">
            🖨️
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Multiple Pages Per Sheet (N-Up PDF)
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Put 2 or 4 pages side-by-side on a single printed sheet. Ideal for handouts, presentation slides, study packets, and saving printing paper.
        </p>
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
                📑
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Choose PDF to Format
              </span>
              <span className="text-xs text-gray-400 mb-4">Drag and drop slides, notes, or essays here</span>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Live Document Viewer with Change Document Button */}
            <DocumentLiveViewer
              file={file}
              onFileChange={(newFile) => {
                setFile(newFile);
              }}
              onRemove={() => {
                setFile(null);
              }}
            />

            {/* Layout Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 2-Up Option */}
              <div
                onClick={() => setLayout('2up')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                  layout === '2up'
                    ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 text-primary-950 dark:text-primary-200 shadow-xs'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center font-black text-sm shrink-0">
                  2:1
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">2 Pages Per Sheet</span>
                    {layout === '2up' && <span className="text-[10px] bg-primary-600 text-white px-1.5 py-0.2 rounded-full font-bold">Active</span>}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Side-by-side on Landscape A4. Best for reading slides and large text.
                  </p>
                </div>
              </div>

              {/* 4-Up Option */}
              <div
                onClick={() => setLayout('4up')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                  layout === '4up'
                    ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 text-primary-950 dark:text-primary-200 shadow-xs'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center font-black text-sm shrink-0">
                  4:1
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">4 Pages Per Sheet</span>
                    {layout === '4up' && <span className="text-[10px] bg-primary-600 text-white px-1.5 py-0.2 rounded-full font-bold">Active</span>}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                    2x2 Grid on Portrait A4. Maximum 75% paper &amp; ink savings.
                  </p>
                </div>
              </div>

            </div>

            {/* Extra Options */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={drawBorder}
                  onChange={(e) => setDrawBorder(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                <span>Draw subtle border frame around each page</span>
              </label>

              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Reduced to {outputSheetCount} total sheets ({pageCount && pageCount > outputSheetCount ? Math.round(((pageCount - outputSheetCount) / pageCount) * 100) : 0}% paper saved)
              </span>
            </div>

            {/* Action button */}
            <button
              onClick={processNup}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-primary-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>Formatting &amp; Embedding...</span>
              ) : (
                <>
                  <span>Download {layout.toUpperCase()} PDF</span>
                  <span>↓</span>
                </>
              )}
            </button>

          </div>
        )}
      </div>

      <FeedbackWidget toolName="Pages Per Sheet" />
      <RelatedTools currentSlug="nup-pdf" />

      {/* How to Use Section */}
      <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          How to Print Multiple PDF Pages per Sheet
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-primary-600 text-sm">1. Upload PDF</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Choose Presentation or Notes</p>
            <p className="mt-0.5">Select your multi-page PDF document or slides.</p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">2. Choose Grid Mode</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">2-Up or 4-Up</p>
            <p className="mt-0.5">Pick 2 pages side-by-side or a 4-page quadrant layout.</p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">3. Instant Download</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Save Print-Ready Document</p>
            <p className="mt-0.5">Download your combined sheets ready for duplex printing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
