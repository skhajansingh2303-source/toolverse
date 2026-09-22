'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

interface PngPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
  sizeKb: number;
}

export default function PdfToPng() {
  const [file, setFile] = useState<File | null>(null);
  const [pngPages, setPngPages] = useState<PngPage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [scaleFactor, setScaleFactor] = useState<number>(2.0); // 1.5x, 2.0x, 3.0x
  const [isTransparent, setIsTransparent] = useState<boolean>(false);
  const [zoomModalPage, setZoomModalPage] = useState<PngPage | null>(null);
  const [pdfjsLoaded, setPdfjsLoaded] = useState<boolean>(false);

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

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPngPages([]);
      setProgress({ current: 0, total: 0 });
    }
  };

  const convertToPng = async () => {
    if (!file || !(window as any).pdfjsLib) return;
    setIsProcessing(true);
    abortControllerRef.current = false;
    setPngPages([]);

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await (window as any).pdfjsLib.getDocument({ data: buffer }).promise;
      const numPages = pdf.numPages;
      setProgress({ current: 0, total: numPages });

      for (let i = 1; i <= numPages; i++) {
        if (abortControllerRef.current) break;

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: scaleFactor });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d', { alpha: isTransparent });
        if (ctx) {
          if (!isTransparent) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }

        await page.render({
          canvasContext: ctx,
          viewport,
          background: isTransparent ? 'rgba(0,0,0,0)' : 'rgb(255,255,255)',
        }).promise;

        const dataUrl = canvas.toDataURL('image/png');
        const approxKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        setPngPages((prev) => [
          ...prev,
          {
            pageNumber: i,
            dataUrl,
            width: viewport.width,
            height: viewport.height,
            sizeKb: approxKb,
          },
        ]);

        setProgress({ current: i, total: numPages });
      }

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `Successfully converted ${numPages} pages to lossless PNG!` },
        })
      );
    } catch (err) {
      console.error('Error converting PDF to PNG:', err);
      alert('Could not convert PDF to PNG. Please ensure the document is not corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelConversion = () => {
    abortControllerRef.current = true;
    setIsProcessing(false);
  };

  const downloadSinglePng = (png: PngPage) => {
    const a = document.createElement('a');
    a.href = png.dataUrl;
    const pad = pngPages.length >= 100 ? 3 : 2;
    const pageStr = String(png.pageNumber).padStart(pad, '0');
    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document';
    a.download = `${baseName}_page_${pageStr}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllAsZip = async () => {
    if (pngPages.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document_png';
      const folder = zip.folder(baseName) || zip;
      const pad = pngPages.length >= 100 ? 3 : 2;

      pngPages.forEach((item) => {
        const base64Data = item.dataUrl.split(',')[1];
        const pageNum = String(item.pageNumber).padStart(pad, '0');
        folder.file(`page_${pageNum}.png`, base64Data, { base64: true });
      });

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_png_lossless.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: 'All PNG pages downloaded as ZIP successfully!' },
        })
      );
    } catch (err) {
      console.error('Error bundling PNG zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">PDF to PNG</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            PDF to PNG Lossless Image Converter
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Convert every PDF page to crisp, high-resolution PNG format with transparent background support and 1-click ZIP archive download.
          </p>
        </div>

        {/* Upload Dropzone */}
        {pngPages.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-10">
            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-400 rounded-3xl p-8 sm:p-12 text-center transition-colors group">
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => {
                  handleFile(e);
                  e.target.value = '';
                }}
              />
              <div className="pointer-events-none flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-105 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Upload PDF to Convert to PNG
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Extracts lossless PNG pages with high-DPI scaling and transparency. 100% private in-browser.
                </p>
                <span className="inline-flex items-center px-6 py-3 rounded-xl bg-primary-600 group-hover:bg-primary-700 text-white font-semibold shadow-md transition-all">
                  Browse Files
                </span>
              </div>
            </div>

            {/* Options Strip */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Resolution Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                  Image Resolution
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setScaleFactor(1.5)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      scaleFactor === 1.5
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    1.5x (Fast)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScaleFactor(2.0)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      scaleFactor === 2.0
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    2.0x (HD Crisp)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScaleFactor(3.0)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      scaleFactor === 3.0
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    3.0x (Ultra 4K)
                  </button>
                </div>
              </div>

              {/* Transparency Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                  Background Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTransparent(false)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      !isTransparent
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-white border border-gray-400" />
                    Clean White
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTransparent(true)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      isTransparent
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:3px_3px] border border-gray-400" />
                    Transparent Alpha
                  </button>
                </div>
              </div>
            </div>

            {file && (
              <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-lg font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white block">{file.name}</span>
                    <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {isProcessing && (
                    <button
                      onClick={cancelConversion}
                      className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={convertToPng}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Rendering Page {progress.current}/{progress.total}...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        Convert to PNG Images
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gallery Workspace */}
        {pngPages.length > 0 && (
          <div className="space-y-6">
            {/* Gallery Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  PNG
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    {pngPages.length} {pngPages.length === 1 ? 'Page' : 'Pages'} Converted
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Lossless PNG • {scaleFactor}x Resolution • {isTransparent ? 'Transparent' : 'Opaque White'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={downloadAllAsZip}
                  disabled={isZipping}
                  className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isZipping ? (
                    'Packaging ZIP Archive...'
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download All as ZIP
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setPngPages([]);
                    setFile(null);
                  }}
                  className="px-4 py-3 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Convert Another
                </button>
              </div>
            </div>

            {/* PNG Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pngPages.map((png) => (
                <div
                  key={png.pageNumber}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail / Image Preview Container */}
                  <div
                    onClick={() => setZoomModalPage(png)}
                    className="relative aspect-[1/1.3] cursor-pointer overflow-hidden p-3 flex items-center justify-center bg-gray-100 dark:bg-slate-950"
                    style={
                      isTransparent
                        ? {
                            backgroundImage:
                              'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                            backgroundSize: '16px 16px',
                            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                          }
                        : {}
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={png.dataUrl}
                      alt={`Page ${png.pageNumber}`}
                      className="max-w-full max-h-full object-contain shadow-xs group-hover:scale-[1.02] transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="px-3 py-1.5 rounded-lg bg-white/90 text-gray-900 text-xs font-bold shadow">
                        Click to Zoom
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-gray-900 dark:text-white block">
                        Page {png.pageNumber}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {png.width} × {png.height} px • {png.sizeKb} KB
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadSinglePng(png)}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
                      title="Download Page PNG"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Zoom Preview */}
        {zoomModalPage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setZoomModalPage(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-3 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  Page {zoomModalPage.pageNumber} Preview ({zoomModalPage.width} × {zoomModalPage.height} px)
                </span>
                <button
                  onClick={() => setZoomModalPage(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-auto flex items-center justify-center max-h-[75vh] bg-gray-100 dark:bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={zoomModalPage.dataUrl}
                  alt={`Zoomed Page ${zoomModalPage.pageNumber}`}
                  className="max-h-full object-contain rounded shadow-lg"
                />
              </div>
              <div className="px-6 py-3 border-t border-gray-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => downloadSinglePng(zoomModalPage)}
                  className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-colors"
                >
                  Download This PNG
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ad Slot */}
        <AdSlot format="horizontal" />

        {/* How to Use Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Convert PDF to PNG
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                1
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Select PDF File</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drop your PDF into the upload zone. Choose your target resolution (1.5x, 2x HD, or 3x 4K).
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                2
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Select Transparency</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toggle &quot;Transparent Alpha&quot; to strip white paper backgrounds for logos, badges, and graphic assets, or keep &quot;Clean White&quot;.
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                3
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Download PNG or ZIP</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download individual PNG pages or click &quot;Download All as ZIP&quot; for instant 1-click download of all rendered pages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
