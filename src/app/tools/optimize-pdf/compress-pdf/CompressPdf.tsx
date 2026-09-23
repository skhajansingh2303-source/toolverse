'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import AdSlot from '@/components/AdSlot';
import FeedbackWidget from '@/components/FeedbackWidget';
import RelatedTools from '@/components/RelatedTools';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';
import ToolResultCard from '@/components/ToolResultCard';
import { PDFDocument, PDFName } from 'pdf-lib';

interface CompressionResult {
  original: number;
  compressed: number;
  blobUrl: string;
  blob: Blob;
  name: string;
  savedBytes: number;
  savedPercentage: number;
}

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [compressionMode, setCompressionMode] = useState<'smart' | 'vector'>('smart');
  const [compressionLevel, setCompressionLevel] = useState<'extreme' | 'recommended' | 'less'>('recommended');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [previewTab, setPreviewTab] = useState<'compressed' | 'original'>('compressed');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const abortControllerRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfjsLoaded(true);
    }
  }, []);

  const handleScriptLoad = () => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfjsLoaded(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setResult(null);
      setErrorMsg(null);
      setPreviewTab('compressed');
    }
  };

  const optimizePdfVector = async (buffer: ArrayBuffer): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    });

    // Strip bloated metadata
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('ToolsVerse PDF Optimizer');
    pdfDoc.setCreator('ToolsVerse');

    try {
      const catalog = pdfDoc.catalog;
      const metadataKey = PDFName.of('Metadata');
      if (catalog.has(metadataKey)) catalog.delete(metadataKey);
      const pieceInfoKey = PDFName.of('PieceInfo');
      if (catalog.has(pieceInfoKey)) catalog.delete(pieceInfoKey);
      const structTreeKey = PDFName.of('StructTreeRoot');
      if (catalog.has(structTreeKey)) catalog.delete(structTreeKey);
    } catch {
      // Structure cleanup fallback
    }

    return await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);
    abortControllerRef.current = false;
    setProgress({ current: 0, total: 0, percentage: 0 });

    try {
      const arrayBuffer = await file.arrayBuffer();
      let finalPdfBytes: Uint8Array;

      if (compressionMode === 'vector') {
        // Pure vector & stream structure optimization
        finalPdfBytes = await optimizePdfVector(arrayBuffer);
      } else {
        // Smart Visual Compression
        if (!(window as any).pdfjsLib) {
          throw new Error('PDF compression engine is initializing. Please wait a moment and try again.');
        }

        const pdfjs = (window as any).pdfjsLib;
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        setProgress({ current: 0, total: totalPages, percentage: 0 });

        // Parameters based on chosen level
        let scale = 1.35;
        let jpegQuality = 0.72;

        if (compressionLevel === 'extreme') {
          scale = 1.0; // ~72 DPI
          jpegQuality = 0.50;
        } else if (compressionLevel === 'less') {
          scale = 1.8; // ~130 DPI
          jpegQuality = 0.85;
        }

        const newPdfDoc = await PDFDocument.create();

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          if (abortControllerRef.current) {
            setIsProcessing(false);
            return;
          }

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });
          const originalViewport = page.getViewport({ scale: 1.0 });

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.floor(viewport.width));
          canvas.height = Math.max(1, Math.floor(viewport.height));

          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) throw new Error('Could not initialize rendering canvas context.');

          // Render clean white page background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          await page.render({
            canvasContext: ctx,
            viewport,
          }).promise;

          // Convert canvas directly to compressed JPEG Blob
          const imageBlob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/jpeg', jpegQuality);
          });

          // Immediately free GPU / canvas memory
          canvas.width = 0;
          canvas.height = 0;

          if (!imageBlob) throw new Error(`Could not process page ${pageNum}.`);

          const imgBuffer = await imageBlob.arrayBuffer();
          const embeddedImage = await newPdfDoc.embedJpg(imgBuffer);

          const newPage = newPdfDoc.addPage([originalViewport.width, originalViewport.height]);
          newPage.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: originalViewport.width,
            height: originalViewport.height,
          });

          const pct = Math.round((pageNum / totalPages) * 100);
          setProgress({ current: pageNum, total: totalPages, percentage: pct });

          // Yield briefly to keep browser UI responsive
          await new Promise((r) => setTimeout(r, 10));
        }

        let compressedBytes = await newPdfDoc.save({ useObjectStreams: true });

        // Safeguard: If visual compression somehow produced a larger file
        // (e.g., tiny 1-page vector document with a few words), fallback to vector optimization
        if (compressedBytes.byteLength >= file.size) {
          const vectorBytes = await optimizePdfVector(arrayBuffer);
          if (vectorBytes.byteLength < compressedBytes.byteLength) {
            compressedBytes = vectorBytes;
          }
        }

        finalPdfBytes = compressedBytes;
      }

      const blob = new Blob([finalPdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const savedBytes = Math.max(0, file.size - blob.size);
      const savedPercentage = file.size > 0 ? Math.round((savedBytes / file.size) * 100) : 0;

      setResult({
        original: file.size,
        compressed: blob.size,
        blobUrl: url,
        blob,
        name: `compressed_${file.name}`,
        savedBytes,
        savedPercentage,
      });

      setPreviewTab('compressed');

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: {
            message: savedPercentage > 0
              ? `🗜️ PDF Compressed successfully! Saved ${savedPercentage}%`
              : '🗜️ PDF Optimized successfully!',
          },
        })
      );
    } catch (error: any) {
      console.error('Compression error:', error);
      setErrorMsg(error.message || 'Error compressing PDF. Please make sure the PDF is not password protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelCompression = () => {
    abortControllerRef.current = true;
    setIsProcessing(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* PDF.js script loader */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Compress PDF</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white text-xl shadow-sm">
            🗜️
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Compress PDF
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Significantly reduce PDF file size while preserving high visual clarity. Works 100% in your browser with complete privacy.
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
                🗜️
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Choose PDF to Compress
              </span>
              <span className="text-xs text-gray-400 mb-4">or drag and drop your PDF file here</span>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium flex items-center justify-between">
                <span>⚠️ {errorMsg}</span>
                <button
                  onClick={() => setErrorMsg(null)}
                  className="text-red-500 hover:text-red-700 font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Live Document Viewer with Preview Switcher when Result is Ready */}
            {result ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-800 p-1.5 rounded-xl text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewTab('compressed')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        previewTab === 'compressed'
                          ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs'
                          : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
                      }`}
                    >
                      🗜️ Compressed PDF ({formatSize(result.compressed)})
                    </button>
                    <button
                      onClick={() => setPreviewTab('original')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        previewTab === 'original'
                          ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs'
                          : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
                      }`}
                    >
                      📄 Original PDF ({formatSize(result.original)})
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-500 hidden sm:inline px-2">
                    {previewTab === 'compressed' ? 'Live preview of compressed file' : 'Original file preview'}
                  </span>
                </div>

                <DocumentLiveViewer
                  file={previewTab === 'compressed' ? result.blob : file}
                  fileName={previewTab === 'compressed' ? result.name : file.name}
                  onFileChange={(newFile) => {
                    setFile(newFile);
                    setResult(null);
                    setErrorMsg(null);
                  }}
                  onRemove={() => {
                    setFile(null);
                    setResult(null);
                    setErrorMsg(null);
                  }}
                />
              </div>
            ) : (
              <DocumentLiveViewer
                file={file}
                fileName={file.name}
                onFileChange={(newFile) => {
                  setFile(newFile);
                  setResult(null);
                  setErrorMsg(null);
                }}
                onRemove={() => {
                  setFile(null);
                  setResult(null);
                  setErrorMsg(null);
                }}
              />
            )}

            {!result ? (
              <div className="space-y-6">
                {/* Compression Strategy Mode Selector */}
                <div className="space-y-2">
                  <label className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">
                    Compression Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCompressionMode('smart')}
                      className={`text-left p-3.5 rounded-xl border-2 transition-all ${
                        compressionMode === 'smart'
                          ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 text-primary-900 dark:text-white'
                          : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-gray-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">✨ Smart Visual Compression</span>
                        <span className="text-[10px] bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-bold">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">
                        Drastically reduces file size (up to 90%). Best for scanned documents, images, forms &amp; upload limits.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCompressionMode('vector')}
                      className={`text-left p-3.5 rounded-xl border-2 transition-all ${
                        compressionMode === 'vector'
                          ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 text-primary-900 dark:text-white'
                          : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-gray-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">🔤 Digital Vector Cleanup</span>
                        <span className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                          Preserve Text
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">
                        Strips bloated metadata &amp; repacks streams without modifying vector text or font outlines.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Compression Level Selector (for Smart Visual mode) */}
                {compressionMode === 'smart' && (
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">
                      Select Compression Level
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label
                        className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          compressionLevel === 'extreme'
                            ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40'
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-gray-900 dark:text-white">Extreme</span>
                          <input
                            type="radio"
                            name="compression"
                            checked={compressionLevel === 'extreme'}
                            onChange={() => setCompressionLevel('extreme')}
                            className="text-primary-600"
                          />
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400">
                          Lowest file size (Up to 90% reduction). Fits strict portal limits.
                        </span>
                      </label>

                      <label
                        className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          compressionLevel === 'recommended'
                            ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40'
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-gray-900 dark:text-white">Recommended</span>
                          <input
                            type="radio"
                            name="compression"
                            checked={compressionLevel === 'recommended'}
                            onChange={() => setCompressionLevel('recommended')}
                            className="text-primary-600"
                          />
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400">
                          Great quality, standard compression (65-80% reduction).
                        </span>
                      </label>

                      <label
                        className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          compressionLevel === 'less'
                            ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40'
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-gray-900 dark:text-white">High Quality</span>
                          <input
                            type="radio"
                            name="compression"
                            checked={compressionLevel === 'less'}
                            onChange={() => setCompressionLevel('less')}
                            className="text-primary-600"
                          />
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400">
                          Crisp resolution, gentle compression (30-50% reduction).
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Progress Bar when processing */}
                {isProcessing && (
                  <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-primary-900 dark:text-primary-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary-600 animate-ping" />
                        {progress.total > 0
                          ? `Compressing page ${progress.current} of ${progress.total}...`
                          : 'Analyzing & optimizing PDF structure...'}
                      </span>
                      <span className="font-extrabold text-primary-600 dark:text-primary-400">
                        {progress.percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={cancelCompression}
                        className="text-[11px] font-semibold text-gray-500 hover:text-red-600 transition-colors"
                      >
                        Cancel Process
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCompress}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-primary-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>🗜️</span>
                    {isProcessing ? 'Compressing Document...' : 'Compress PDF Now →'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <ToolResultCard
                  title="PDF Compressed Successfully!"
                  filename={result.name}
                  downloadUrl={result.blobUrl}
                  fileSize={result.compressed}
                  badgeText={result.savedPercentage > 0 ? `Saved ${result.savedPercentage}% (${formatSize(result.savedBytes)})` : 'PDF Optimized'}
                  previewUrl={result.blobUrl}
                  previewType="pdf"
                  details={[
                    { label: 'Original Size', value: formatSize(result.original) || '' },
                    { label: 'Optimized Size', value: formatSize(result.compressed) || '' },
                    { label: 'Saved Space', value: formatSize(result.savedBytes) || '0 KB' },
                    { label: 'Reduction', value: `-${result.savedPercentage}%` }
                  ]}
                  onReset={() => setResult(null)}
                  resetButtonText="Compress Another PDF / Adjust Settings"
                  nextTool={{
                    name: 'Protect PDF',
                    url: '/tools/pdf-security/protect-pdf',
                    description: 'Encrypt and password protect your newly compressed PDF.'
                  }}
                />
              </div>
            )}

          </div>
        )}
      </div>

      <FeedbackWidget toolName="Compress PDF" />
      <RelatedTools currentSlug="compress-pdf" />

      {/* How to Use Section */}
      <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          How to Compress PDF Files Online
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-primary-600 text-sm">1. Upload &amp; Preview</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Choose Your PDF</p>
            <p className="mt-0.5">Upload and immediately inspect your document in the live interactive viewer.</p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">2. Choose Compression</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Adjust Quality &amp; Mode</p>
            <p className="mt-0.5">Pick Smart Visual Compression for scanned documents or Digital Vector Cleanup to keep selectable text.</p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">3. Instant Save</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Download Compressed PDF</p>
            <p className="mt-0.5">Save your drastically reduced PDF in seconds with 100% private client-side processing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
