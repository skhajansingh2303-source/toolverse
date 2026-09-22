'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import FeedbackWidget from '@/components/FeedbackWidget';
import RelatedTools from '@/components/RelatedTools';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';
import { PDFDocument } from 'pdf-lib';

type PagePreset = 'a4' | 'letter' | 'a3' | 'a5' | 'legal' | 'tabloid' | 'custom';
type Orientation = 'auto' | 'portrait' | 'landscape';
type ScalingMode = 'fit' | 'stretch' | 'original';

interface PresetDefinition {
  id: PagePreset;
  name: string;
  widthPt: number;
  heightPt: number;
  desc: string;
}

const PRESETS: PresetDefinition[] = [
  { id: 'a4', name: 'A4', widthPt: 595.28, heightPt: 841.89, desc: '210 × 297 mm (Standard International)' },
  { id: 'letter', name: 'US Letter', widthPt: 612, heightPt: 792, desc: '8.5 × 11 in (US Standard)' },
  { id: 'a3', name: 'A3', widthPt: 841.89, heightPt: 1190.55, desc: '297 × 420 mm (Double A4 Posters)' },
  { id: 'a5', name: 'A5', widthPt: 419.53, heightPt: 595.28, desc: '148 × 210 mm (Booklets & Flyers)' },
  { id: 'legal', name: 'US Legal', widthPt: 612, heightPt: 1008, desc: '8.5 × 14 in (Legal Contracts)' },
  { id: 'tabloid', name: 'Tabloid / Ledger', widthPt: 792, heightPt: 1224, desc: '11 × 17 in (Broadsheet / Spread)' },
];

export default function ChangePdfPageSize() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<PagePreset>('a4');
  const [orientation, setOrientation] = useState<Orientation>('auto');
  const [scalingMode, setScalingMode] = useState<ScalingMode>('fit');
  const [marginPt, setMarginPt] = useState<number>(0);
  const [customWidth, setCustomWidth] = useState<number>(210);
  const [customHeight, setCustomHeight] = useState<number>(297);
  const [customUnit, setCustomUnit] = useState<'mm' | 'in' | 'pt'>('mm');

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [sampleOriginalDims, setSampleOriginalDims] = useState<{ width: number; height: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);
    setDownloadUrl(null);
    setResizedBlob(null);
    setErrorMsg(null);

    try {
      const buffer = await uploaded.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();
      setPageCount(count);

      if (count > 0) {
        const p1 = pdfDoc.getPage(0);
        setSampleOriginalDims({
          width: Math.round(p1.getWidth()),
          height: Math.round(p1.getHeight()),
        });
      }
    } catch {
      setPageCount(0);
      setSampleOriginalDims(null);
    }
  };

  const getTargetBaseDimensions = () => {
    if (preset === 'custom') {
      let wPt = customWidth;
      let hPt = customHeight;
      if (customUnit === 'mm') {
        wPt = (customWidth * 72) / 25.4;
        hPt = (customHeight * 72) / 25.4;
      } else if (customUnit === 'in') {
        wPt = customWidth * 72;
        hPt = customHeight * 72;
      }
      return { width: wPt, height: hPt };
    }
    const found = PRESETS.find((p) => p.id === preset) || PRESETS[0];
    return { width: found.widthPt, height: found.heightPt };
  };

  const executeResize = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const totalPages = srcDoc.getPageCount();

      const baseTarget = getTargetBaseDimensions();
      const destDoc = await PDFDocument.create();

      for (let i = 0; i < totalPages; i++) {
        const srcPage = srcDoc.getPage(i);

        // Ensure empty pages don't throw embedding errors
        if (!srcPage.node.Contents()) {
          const emptyStream = srcDoc.context.register(srcDoc.context.stream(''));
          srcPage.node.set(srcPage.node.context.obj('Contents'), emptyStream);
        }

        const [embedded] = await destDoc.embedPages([srcPage]);

        const origW = embedded.width;
        const origH = embedded.height;
        const isOrigLandscape = origW > origH;

        let targetW = baseTarget.width;
        let targetH = baseTarget.height;

        // Apply orientation
        if (orientation === 'auto') {
          if (isOrigLandscape && targetW < targetH) {
            // Swap to landscape
            [targetW, targetH] = [targetH, targetW];
          } else if (!isOrigLandscape && targetW > targetH) {
            // Swap to portrait
            [targetW, targetH] = [targetH, targetW];
          }
        } else if (orientation === 'landscape') {
          if (targetW < targetH) [targetW, targetH] = [targetH, targetW];
        } else if (orientation === 'portrait') {
          if (targetW > targetH) [targetW, targetH] = [targetH, targetW];
        }

        const availW = Math.max(1, targetW - 2 * marginPt);
        const availH = Math.max(1, targetH - 2 * marginPt);

        let drawW = availW;
        let drawH = availH;
        let x = marginPt;
        let y = marginPt;

        if (scalingMode === 'fit') {
          const scale = Math.min(availW / origW, availH / origH);
          drawW = origW * scale;
          drawH = origH * scale;
          x = marginPt + (availW - drawW) / 2;
          y = marginPt + (availH - drawH) / 2;
        } else if (scalingMode === 'original') {
          drawW = origW;
          drawH = origH;
          x = marginPt + (availW - drawW) / 2;
          y = marginPt + (availH - drawH) / 2;
        } else {
          // stretch
          drawW = availW;
          drawH = availH;
          x = marginPt;
          y = marginPt;
        }

        const newPage = destDoc.addPage([targetW, targetH]);
        newPage.drawPage(embedded, {
          x,
          y,
          width: drawW,
          height: drawH,
        });
      }

      const pdfBytes = await destDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      setResizedBlob(blob);

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `📐 PDF Pages Resized to ${preset.toUpperCase()} Successfully!` },
        })
      );
    } catch (err: any) {
      console.error('Resize error:', err);
      setErrorMsg(err.message || 'Failed to resize PDF pages. Check if document is protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  const targetDims = getTargetBaseDimensions();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Change PDF Page Size</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-sm">
            📐
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Change PDF Page Size &amp; Scale
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Resize PDF pages to standard paper formats like A4, US Letter, A3, Legal, or custom millimeter and inch dimensions with smart aspect ratio preservation.
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
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-3xl mb-3 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                📐
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Select PDF to Resize
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                Drag &amp; drop PDF file here, or click to browse
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
                <span className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0 font-bold">
                  📄
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {pageCount} Pages {sampleOriginalDims ? `• Original Size: ${sampleOriginalDims.width} × ${sampleOriginalDims.height} pt` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setDownloadUrl(null);
                  setResizedBlob(null);
                  setSampleOriginalDims(null);
                }}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors font-medium"
              >
                Choose Different PDF
              </button>
            </div>

            {/* Target Preset Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                Target Page Size Format
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreset(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      preset === p.id
                        ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold shadow-xs'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.name}</div>
                    <div className="text-[10px] text-gray-400 dark:text-slate-500 truncate mt-0.5">
                      {p.desc}
                    </div>
                  </button>
                ))}

                {/* Custom size button */}
                <button
                  type="button"
                  onClick={() => setPreset('custom')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    preset === 'custom'
                      ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold shadow-xs'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs font-bold">Custom Size</div>
                  <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                    User Specified Dimensions
                  </div>
                </button>
              </div>

              {/* Custom Dimensions Form */}
              {preset === 'custom' && (
                <div className="mt-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700 dark:text-slate-300">Width:</span>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700 dark:text-slate-300">Height:</span>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700 dark:text-slate-300">Unit:</span>
                    <select
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value as any)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    >
                      <option value="mm">Millimeters (mm)</option>
                      <option value="in">Inches (in)</option>
                      <option value="pt">Points (pt)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Scaling & Orientation Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
              {/* Orientation */}
              <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                  Page Orientation
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'auto' as const, label: 'Auto' },
                    { id: 'portrait' as const, label: 'Portrait' },
                    { id: 'landscape' as const, label: 'Landscape' },
                  ].map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setOrientation(o.id)}
                      className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition-all ${
                        orientation === o.id
                          ? 'bg-primary-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scaling Mode */}
              <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                  Scaling Strategy
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'fit' as const, label: 'Fit & Center' },
                    { id: 'stretch' as const, label: 'Stretch' },
                    { id: 'original' as const, label: '100% Size' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setScalingMode(m.id)}
                      className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition-all ${
                        scalingMode === m.id
                          ? 'bg-primary-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins */}
              <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                  Margin Padding
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { pt: 0, label: 'None' },
                    { pt: 18, label: '0.25"' },
                    { pt: 36, label: '0.5"' },
                    { pt: 72, label: '1.0"' },
                  ].map((mg) => (
                    <button
                      key={mg.pt}
                      type="button"
                      onClick={() => setMarginPt(mg.pt)}
                      className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition-all ${
                        marginPt === mg.pt
                          ? 'bg-primary-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {mg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dimension summary banner */}
            <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
              <span>
                Target Page Canvas:{' '}
                <strong>
                  {Math.round(targetDims.width)} × {Math.round(targetDims.height)} pt
                </strong>{' '}
                ({(targetDims.width / 72).toFixed(2)}″ × {(targetDims.height / 72).toFixed(2)}″)
              </span>
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                Mode: {scalingMode === 'fit' ? 'Proportional Fit' : scalingMode}
              </span>
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
                onClick={executeResize}
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Resizing Document Pages...</span>
                  </>
                ) : (
                  <>
                    <span>Resize &amp; Download PDF</span>
                    <span>→</span>
                  </>
                )}
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={`resized-${preset}-${file.name}`}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  <span>Download Resized PDF ↓</span>
                </a>
              )}
            </div>

            {/* Live Document Preview */}
            {resizedBlob && (
              <div className="pt-4">
                <DocumentLiveViewer
                  file={resizedBlob}
                  fileName={`resized-${file.name}`}
                  title="Resized Document Preview"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <FeedbackWidget toolName="Change PDF Page Size" />
      <RelatedTools currentSlug="change-pdf-page-size" />

      {/* How to Use Section */}
      <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          How to Change PDF Page Size Online
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-primary-600 text-sm">1. Select PDF Document</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Upload Any File</p>
            <p className="mt-0.5">
              Upload documents designed in US Letter, A4, or arbitrary scanner dimensions.
            </p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">2. Choose New Paper Standard</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Pick Dimensions</p>
            <p className="mt-0.5">
              Select A4, Letter, A3, Legal, or enter exact custom millimeters, inches, or points.
            </p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">3. Download Scaled PDF</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Crisp Vector Rendering</p>
            <p className="mt-0.5">
              Original fonts and graphics are scaled mathematically without raster blurring or text loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
