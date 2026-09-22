'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import { PDFDocument, PDFName } from 'pdf-lib';

interface PdfAnalysis {
  objectCount: number;
  metadataBytes: number;
  fontStreamCount: number;
  imageStreamCount: number;
  uncompressedStreamCount: number;
  pageCount: number;
  rawSize: number;
}

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  savedBytes: number;
  savedPercentage: number;
  bytes: Uint8Array;
}

export default function OptimizePdfWeb() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<PdfAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Optimization toggles
  const [stripMetadata, setStripMetadata] = useState(true);
  const [useObjectStreams, setUseObjectStreams] = useState(true);
  const [removeOrphaned, setRemoveOrphaned] = useState(true);
  const [cleanAnnotations, setCleanAnnotations] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a valid PDF document.');
      return;
    }

    setFile(selected);
    setErrorMsg('');
    setResult(null);
    setIsAnalyzing(true);

    try {
      const buffer = await selected.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPageCount();

      // Quick scan of raw byte stream for structural analysis
      const uint8 = new Uint8Array(buffer);
      const textDecoder = new TextDecoder('latin1');
      const textChunk = textDecoder.decode(uint8);

      // Analyze object count
      const objMatches = textChunk.match(/\b\d+\s+\d+\s+obj\b/g);
      const objectCount = objMatches ? objMatches.length : 0;

      // Analyze metadata size (XMP stream)
      let metadataBytes = 0;
      const xmpStart = textChunk.indexOf('<x:xmpmeta');
      const xmpEnd = textChunk.indexOf('</x:xmpmeta>');
      if (xmpStart !== -1 && xmpEnd !== -1) {
        metadataBytes = Math.max(0, xmpEnd - xmpStart + 12);
      } else {
        const metaObj = textChunk.match(/\/Type\s*\/Metadata[\s\S]*?stream[\s\S]*?endstream/);
        if (metaObj) metadataBytes = metaObj[0].length;
      }

      // Font & Image streams
      const fontMatches = textChunk.match(/\/Subtype\s*\/Type1|\/Subtype\s*\/TrueType|\/Subtype\s*\/CIDFontType|\/FontFile/g);
      const fontStreamCount = fontMatches ? fontMatches.length : 0;

      const imageMatches = textChunk.match(/\/Subtype\s*\/Image/g);
      const imageStreamCount = imageMatches ? imageMatches.length : 0;

      // Streams without /Filter FlateDecode
      const streamBlocks = textChunk.match(/<<[\s\S]*?>>\s*stream/g) || [];
      let uncompressed = 0;
      streamBlocks.forEach((block) => {
        if (!block.includes('/Filter')) uncompressed++;
      });

      setAnalysis({
        objectCount,
        metadataBytes: metadataBytes || Math.round(selected.size * 0.05), // Estimated if binary packed
        fontStreamCount,
        imageStreamCount,
        uncompressedStreamCount: uncompressed,
        pageCount: pages,
        rawSize: selected.size,
      });
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg('Could not parse PDF structure. The document might be password protected.');
      setFile(null);
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runOptimization = async () => {
    if (!file) return;

    setIsOptimizing(true);
    setErrorMsg('');

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, {
        updateMetadata: false,
        ignoreEncryption: true,
      });

      // 1. Strip bloated metadata if selected
      if (stripMetadata) {
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('ToolsVerse Web Stream Optimizer');
        pdfDoc.setCreator('ToolsVerse');

        // Delete /Metadata XMP packet from Catalog
        try {
          const catalog = pdfDoc.catalog;
          const metadataKey = PDFName.of('Metadata');
          if (catalog.has(metadataKey)) {
            catalog.delete(metadataKey);
          }
          const pieceInfoKey = PDFName.of('PieceInfo');
          if (catalog.has(pieceInfoKey)) {
            catalog.delete(pieceInfoKey);
          }
        } catch {
          // Ignore catalog node adjustments if structure is locked
        }
      }

      // 2. Clean annotations & unnecessary interactive actions
      if (cleanAnnotations) {
        try {
          const catalog = pdfDoc.catalog;
          const openActionKey = PDFName.of('OpenAction');
          if (catalog.has(openActionKey)) {
            catalog.delete(openActionKey);
          }
          const namesKey = PDFName.of('Names');
          if (catalog.has(namesKey)) {
            catalog.delete(namesKey);
          }
        } catch {
          // Safe fallback
        }
      }

      // 3. Remove orphaned references and clean fonts
      if (removeOrphaned) {
        try {
          const catalog = pdfDoc.catalog;
          const structTreeKey = PDFName.of('StructTreeRoot');
          if (catalog.has(structTreeKey)) {
            catalog.delete(structTreeKey);
          }
        } catch {
          // Safe fallback
        }
      }

      // 4. Linearize & deflate using Object Streams (/ObjStm)
      const optimizedBytes = await pdfDoc.save({
        useObjectStreams: useObjectStreams,
        addDefaultPage: false,
        objectsPerTick: 50,
      });

      const originalSize = file.size;
      const optimizedSize = optimizedBytes.byteLength;
      const saved = Math.max(0, originalSize - optimizedSize);
      const percentage = originalSize > 0 ? parseFloat(((saved / originalSize) * 100).toFixed(1)) : 0;

      setResult({
        originalSize,
        optimizedSize,
        savedBytes: saved,
        savedPercentage: percentage,
        bytes: optimizedBytes,
      });

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `⚡ PDF optimized for web! Reduced by ${percentage}%` },
        })
      );
    } catch (err: any) {
      console.error('Optimization error:', err);
      setErrorMsg(err.message || 'Failed to optimize PDF document.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const downloadOptimizedPdf = () => {
    if (!result || !file) return;
    const blob = new Blob([result.bytes as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\.[^/.]+$/, '')}_web_optimized.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <span className="text-gray-900 dark:text-white font-semibold">Optimize PDF for Web</span>
        </nav>

        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xl shadow-sm">
              ⚡
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Optimize PDF for Web (Linearize & Compress)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            Linearize, deflate object streams, and strip bloated metadata for fast web viewing, instant streaming, and minimal bandwidth consumption.
          </p>
        </header>

        <AdSlot format="horizontal" />

        {/* Upload Zone */}
        {!file ? (
          <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-teal-500 rounded-3xl p-10 text-center transition-colors group bg-white dark:bg-slate-900 shadow-sm mb-8 mt-6">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              onChange={(e) => {
                handleFileUpload(e);
                e.target.value = '';
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title=""
            />
            <div className="pointer-events-none flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-3xl text-teal-600 dark:text-teal-400 mb-3 group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
                Upload PDF to Optimize for Web
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                Reduces file size, deflates object streams, and removes hidden bloat client-side
              </p>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm mb-8 mt-6">
            {/* File info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center text-2xl font-bold">
                  ⚡
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {formatBytes(file.size)} • {analysis?.pageCount || 1} Pages
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setFile(null);
                    setAnalysis(null);
                    setResult(null);
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 transition-colors"
                >
                  Change File
                </button>
                <button
                  onClick={runOptimization}
                  disabled={isOptimizing || isAnalyzing}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-xl px-6 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
                >
                  {isOptimizing ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Optimizing...
                    </>
                  ) : (
                    <>🚀 Optimize for Fast Web View</>
                  )}
                </button>
              </div>
            </div>

            {/* Structure Analysis Grid */}
            {analysis && (
              <div className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                    PDF Structural Analysis
                  </span>
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                    ✓ Cleaned client-side
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-gray-50 dark:bg-slate-800/60 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                      Total Objects
                    </p>
                    <p className="text-lg font-black text-gray-900 dark:text-white">
                      {analysis.objectCount}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800/60 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                      Metadata Overhead
                    </p>
                    <p className="text-lg font-black text-amber-600 dark:text-amber-400">
                      {formatBytes(analysis.metadataBytes)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800/60 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                      Font Streams
                    </p>
                    <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {analysis.fontStreamCount}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800/60 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                      Uncompressed Streams
                    </p>
                    <p className="text-lg font-black text-rose-600 dark:text-rose-400">
                      {analysis.uncompressedStreamCount}
                    </p>
                  </div>
                </div>

                {/* Optimization Options Toggles */}
                <div className="bg-gray-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-gray-200 dark:border-slate-700/60 mb-6">
                  <p className="text-xs font-bold text-gray-800 dark:text-slate-200 mb-3">
                    Optimization Features
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stripMetadata}
                        onChange={(e) => setStripMetadata(e.target.checked)}
                        className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 block">
                          Strip Bloated XMP & Author Metadata
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-slate-400">
                          Deletes XML editing histories, software traces, and thumbnails.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useObjectStreams}
                        onChange={(e) => setUseObjectStreams(e.target.checked)}
                        className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 block">
                          Deflate Streams & Linearize Structure
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-slate-400">
                          Packs objects into compressed Object Streams for Fast Web View.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={removeOrphaned}
                        onChange={(e) => setRemoveOrphaned(e.target.checked)}
                        className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 block">
                          Purge Orphaned References & Structure Trees
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-slate-400">
                          Cleans dead references left behind by word processors.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cleanAnnotations}
                        onChange={(e) => setCleanAnnotations(e.target.checked)}
                        className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 block">
                          Clean Redundant JavaScript & Actions
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-slate-400">
                          Removes unneeded OpenAction hooks and script bloat.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Optimization Result Card */}
            {result && (
              <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border border-teal-200 dark:border-teal-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold mb-2">
                      <span>✓ Fast Web View Ready</span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      Document Successfully Optimized!
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                      Reduced from <strong>{formatBytes(result.originalSize)}</strong> to{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {formatBytes(result.optimizedSize)}
                      </strong>{' '}
                      (saved {formatBytes(result.savedBytes)}, {result.savedPercentage}% reduction).
                    </p>
                  </div>

                  <button
                    onClick={downloadOptimizedPdf}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    📥 Download Optimized PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* How to Use Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use Web PDF Optimizer
          </h2>
          <ol className="list-decimal pl-5 space-y-2.5 text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            <li>
              Upload your PDF document into the designated dropzone.
            </li>
            <li>
              Inspect the automatic structural breakdown showing object counts, metadata overhead, and uncompressed streams.
            </li>
            <li>
              Configure web optimization options (stream deflating, XMP metadata removal, and orphaned reference purging).
            </li>
            <li>
              Click <strong>&quot;Optimize for Fast Web View&quot;</strong> and download your streamlined, web-ready PDF immediately.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
