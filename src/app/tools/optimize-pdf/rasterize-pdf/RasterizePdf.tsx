'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import AdSlot from '@/components/AdSlot';
import FeedbackWidget from '@/components/FeedbackWidget';
import RelatedTools from '@/components/RelatedTools';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';
import { PDFDocument } from 'pdf-lib';

export default function RasterizePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [dpi, setDpi] = useState<number>(150);
  const [imageFormat, setImageFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [jpegQuality, setJpegQuality] = useState<number>(0.88);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [rasterizedBlob, setRasterizedBlob] = useState<Blob | null>(null);
  const [originalPageCount, setOriginalPageCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);
    setThumbnails([]);
    setDownloadUrl(null);
    setRasterizedBlob(null);
    setErrorMsg(null);
    setProgress({ current: 0, total: 0 });

    try {
      const bytes = await uploaded.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setOriginalPageCount(pdfDoc.getPageCount());
    } catch {
      setOriginalPageCount(0);
    }
  };

  const executeRasterization = async () => {
    if (!file) return;
    if (!(window as any).pdfjsLib) {
      setErrorMsg('PDF engine is still initializing. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    abortControllerRef.current = false;
    setThumbnails([]);
    setDownloadUrl(null);
    setRasterizedBlob(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = (window as any).pdfjsLib;
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      setProgress({ current: 0, total: totalPages });

      // Calculate scale based on selected DPI (72 DPI is scale 1.0)
      const scale = dpi / 72;

      // New clean PDF document to assemble rasterized pages
      const newPdfDoc = await PDFDocument.create();
      const pageThumbnails: string[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        if (abortControllerRef.current) break;

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const originalViewport = page.getViewport({ scale: 1.0 });

        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const canvasContext = canvas.getContext('2d', { alpha: false });
        if (!canvasContext) throw new Error('Could not create canvas 2D rendering context.');

        // White background
        canvasContext.fillStyle = '#ffffff';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext,
          viewport,
        }).promise;

        let imgBytes: Uint8Array;
        let thumbUrl: string;

        if (imageFormat === 'png') {
          thumbUrl = canvas.toDataURL('image/png');
          const res = await fetch(thumbUrl);
          const buf = await res.arrayBuffer();
          imgBytes = new Uint8Array(buf);
          const embeddedImage = await newPdfDoc.embedPng(imgBytes);
          const newPdfPage = newPdfDoc.addPage([originalViewport.width, originalViewport.height]);
          newPdfPage.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: originalViewport.width,
            height: originalViewport.height,
          });
        } else {
          thumbUrl = canvas.toDataURL('image/jpeg', jpegQuality);
          const res = await fetch(thumbUrl);
          const buf = await res.arrayBuffer();
          imgBytes = new Uint8Array(buf);
          const embeddedImage = await newPdfDoc.embedJpg(imgBytes);
          const newPdfPage = newPdfDoc.addPage([originalViewport.width, originalViewport.height]);
          newPdfPage.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: originalViewport.width,
            height: originalViewport.height,
          });
        }

        pageThumbnails.push(thumbUrl);
        setThumbnails([...pageThumbnails]);
        setProgress({ current: pageNum, total: totalPages });
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      setRasterizedBlob(blob);

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: '🧱 PDF Rasterized into Secure Images Successfully!' },
        })
      );
    } catch (err: any) {
      console.error('Rasterize error:', err);
      setErrorMsg(err.message || 'An error occurred while rasterizing the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelRasterization = () => {
    abortControllerRef.current = true;
    setIsProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={handleScriptLoad}
        strategy="afterInteractive"
      />

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Rasterize PDF</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-zinc-800 flex items-center justify-center text-white text-xl shadow-sm">
            🧱
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Rasterize PDF Document
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Flatten all vector paths, text layers, annotations, and hidden scripts into high-resolution bitmap images. Makes PDF completely unselectable, untamperable, and 100% secure.
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
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-3 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform">
                🧱
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Select PDF to Rasterize
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                Drag &amp; drop your PDF here or choose file from device
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
                <span className="w-10 h-10 rounded-lg bg-slate-500/10 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xl shrink-0 font-bold">
                  📄
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {originalPageCount > 0 ? `${originalPageCount} Pages` : 'Calculating pages...'} • {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setDownloadUrl(null);
                  setRasterizedBlob(null);
                  setThumbnails([]);
                }}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors font-medium"
              >
                Choose Different PDF
              </button>
            </div>

            {/* Rasterization Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
              {/* DPI / Resolution */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Output Resolution (DPI)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '72 DPI', value: 72, note: 'Web / Small' },
                    { label: '150 DPI', value: 150, note: 'Balanced' },
                    { label: '300 DPI', value: 300, note: 'Print Sharp' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setDpi(item.value)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        dpi === item.value
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold shadow-xs'
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{item.note}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Raster Format */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Image Encoding Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'JPEG (Compact)', value: 'jpeg' as const, note: 'Optimized file size' },
                    { label: 'PNG (Lossless)', value: 'png' as const, note: 'Crisp line art & text' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setImageFormat(item.value)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        imageFormat === item.value
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold shadow-xs'
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{item.note}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Security Benefit Notice */}
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-3">
              <span className="text-base shrink-0">🛡️</span>
              <p className="leading-relaxed">
                <strong>Permanent Anti-Extraction Security:</strong> Rasterizing eliminates all selectable text, hidden object streams, sensitive metadata, vector coordinates, and interactive JavaScript. The new document contains strictly flat bitmap graphics.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-slate-300">
                  <span>
                    Rasterizing Page {progress.current} of {progress.total}...
                  </span>
                  <span>
                    {progress.total > 0
                      ? `${Math.round((progress.current / progress.total) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 to-indigo-600 transition-all duration-300"
                    style={{
                      width: `${
                        progress.total > 0 ? (progress.current / progress.total) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={cancelRasterization}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={executeRasterization}
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-primary-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Pages...</span>
                  </>
                ) : (
                  <>
                    <span>Rasterize &amp; Recompile PDF</span>
                    <span>→</span>
                  </>
                )}
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={`rasterized-${file.name}`}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  <span>Download Rasterized PDF ↓</span>
                </a>
              )}
            </div>

            {/* Thumbnails Gallery */}
            {thumbnails.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Rasterized Page Previews ({thumbnails.length})
                  </h3>
                  <span className="text-[11px] text-gray-400 dark:text-slate-400">Pure Flat Images</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-80 overflow-y-auto p-2 bg-gray-50 dark:bg-slate-950/50 rounded-xl border border-gray-200 dark:border-slate-800">
                  {thumbnails.map((thumb, i) => (
                    <div
                      key={i}
                      className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 bg-white shadow-xs group"
                    >
                      <img
                        src={thumb}
                        alt={`Page ${i + 1}`}
                        className="w-full h-28 object-contain bg-white"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-[10px] text-white font-bold px-1.5 py-0.5 rounded">
                        P.{i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Result Viewer */}
            {rasterizedBlob && (
              <div className="pt-4">
                <DocumentLiveViewer
                  file={rasterizedBlob}
                  fileName={`rasterized-${file.name}`}
                  title="Rasterized Image-PDF Preview"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <FeedbackWidget toolName="Rasterize PDF" />
      <RelatedTools currentSlug="rasterize-pdf" />

      {/* How to Use Section */}
      <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          How to Rasterize a PDF to Flat Images
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-primary-600 text-sm">1. Choose PDF File</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Upload Vector PDF</p>
            <p className="mt-0.5">
              Select any PDF containing sensitive fonts, digital signatures, hidden comments, or vector artwork.
            </p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">2. Choose DPI &amp; Format</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Select Quality</p>
            <p className="mt-0.5">
              Pick 150 DPI for balanced everyday documents or 300 DPI for crystal clear print reproduction.
            </p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">3. Download Protected PDF</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Pure Image PDF</p>
            <p className="mt-0.5">
              Download your new raster PDF. No text can be copied or searched, and all vector objects are safely flattened.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
