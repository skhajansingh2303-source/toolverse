'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';

export default function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [scaleQuality, setScaleQuality] = useState<'fast' | 'hd'>('fast');
  const abortControllerRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
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
      setFile(e.target.files[0]);
      setImages([]);
      setProgress({ current: 0, total: 0 });
    }
  };

  const convertToImages = async () => {
    if (!file || !(window as any).pdfjsLib) return;
    setIsProcessing(true);
    abortControllerRef.current = false;
    setImages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setProgress({ current: 0, total: numPages });

      const scale = scaleQuality === 'fast' ? 1.5 : 2.0;
      const jpegQuality = scaleQuality === 'fast' ? 0.85 : 0.92;

      for (let i = 1; i <= numPages; i++) {
        if (abortControllerRef.current) break;

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        const pageDataUrl = canvas.toDataURL('image/jpeg', jpegQuality);

        // Immediate visual streaming feedback
        setImages((prev) => [...prev, pageDataUrl]);
        setProgress({ current: i, total: numPages });
      }

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `⚡ Converted ${numPages} pages to JPG successfully!` },
        })
      );
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      alert('An error occurred during conversion. Please check if the PDF is corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelConversion = () => {
    abortControllerRef.current = true;
    setIsProcessing(false);
  };

  const downloadImage = (dataUrl: string, index: number) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    const pad = images.length >= 100 ? 3 : 2;
    const pageNum = String(index + 1).padStart(pad, '0');
    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document';
    a.download = `${baseName}_page_${pageNum}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllAsZip = async () => {
    if (images.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const folderName = file?.name.replace(/\.[^/.]+$/, '') || 'pdf_images';
      const folder = zip.folder(folderName) || zip;
      const pad = images.length >= 100 ? 3 : 2;

      images.forEach((dataUrl, idx) => {
        const base64Data = dataUrl.split(',')[1];
        const pageNum = String(idx + 1).padStart(pad, '0');
        folder.file(`page_${pageNum}.jpg`, base64Data, { base64: true });
      });

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}_all_pages_jpg.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `📦 Downloaded all ${images.length} pages in ZIP archive!` },
        })
      );
    } catch (err) {
      console.error('Error creating zip:', err);
      alert('Failed to generate ZIP archive.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={handleScriptLoad}
      />
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-semibold">PDF to JPG</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl shadow-sm">
              🖼️
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              PDF to JPG Converter
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            Convert all PDF pages to individual JPG images or download everything in 1 click as a ZIP file. 100% processed in your browser.
          </p>
        </header>

        <AdSlot format="horizontal" />

        {/* Upload Screen */}
        {!file ? (
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 rounded-2xl p-10 transition-colors group bg-white dark:bg-slate-900 shadow-sm mb-8 mt-6">
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
                🖼️
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Choose PDF to Convert
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-400 mb-4">
                or drag and drop your document here
              </span>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-6 mb-6">
            <DocumentLiveViewer
              file={file}
              onFileChange={(newFile) => {
                setFile(newFile);
                setImages([]);
                setProgress({ current: 0, total: 0 });
              }}
              onRemove={() => {
                setFile(null);
                setImages([]);
                setProgress({ current: 0, total: 0 });
              }}
            />
          </div>
        )}

        {/* Conversion Controller Card */}
        {file && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Ready to Convert
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-sm sm:max-w-md">
                  {file.name}
                </p>
              </div>

              {/* Quality Preset Toggle */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setScaleQuality('fast')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    scaleQuality === 'fast'
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  ⚡ Fast (High Speed)
                </button>
                <button
                  type="button"
                  onClick={() => setScaleQuality('hd')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    scaleQuality === 'hd'
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  🔍 Ultra HD (Sharpest)
                </button>
              </div>
            </div>

            {/* Action Buttons & Progress Bar */}
            <div className="pt-6">
              {!isProcessing ? (
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={convertToImages}
                    disabled={!pdfjsLoaded}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-primary-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    <span>⚡</span>
                    <span>
                      {images.length > 0 ? 'Re-convert PDF to JPG' : 'Convert PDF to JPG'}
                    </span>
                  </button>

                  {images.length > 0 && (
                    <button
                      onClick={downloadAllAsZip}
                      disabled={isZipping}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      <span>📦</span>
                      <span>
                        {isZipping
                          ? 'Generating ZIP...'
                          : `Download All as ZIP (${images.length} JPGs)`}
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-600 animate-ping" />
                      Converting page {progress.current} of {progress.total}...
                    </span>
                    <span className="text-primary-600 dark:text-primary-400 font-mono">
                      {progress.total > 0
                        ? Math.round((progress.current / progress.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-600 to-indigo-600 h-full transition-all duration-200 rounded-full"
                      style={{
                        width: `${
                          progress.total > 0
                            ? (progress.current / progress.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <button
                    onClick={cancelConversion}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                  >
                    Cancel Conversion
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Streamed Converted Images Gallery */}
        {images.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Converted Pages ({images.length})
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Click download on individual pages or download all together in a single ZIP file.
                </p>
              </div>

              <button
                onClick={downloadAllAsZip}
                disabled={isZipping}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0"
              >
                <span>📦</span>
                <span>{isZipping ? 'Creating ZIP...' : 'Download All as ZIP'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden flex flex-col bg-gray-50 dark:bg-slate-800/50 shadow-2xs hover:shadow-md transition-shadow group"
                >
                  <div className="relative p-2 flex items-center justify-center bg-gray-100 dark:bg-slate-800 min-h-[220px]">
                    <img
                      src={img}
                      alt={`Page ${index + 1}`}
                      className="max-h-60 w-auto object-contain rounded-lg shadow-sm"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Page {index + 1}
                    </span>
                  </div>
                  <div className="p-3.5 bg-white dark:bg-slate-900 flex justify-between items-center mt-auto border-t border-gray-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                      Page {index + 1}.jpg
                    </span>
                    <button
                      onClick={() => downloadImage(img, index)}
                      className="text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg shadow-2xs transition-all active:scale-95 flex items-center gap-1"
                    >
                      <span>↓</span>
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to Use Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
            How to Convert PDF to JPG Online
          </h2>
          <ol className="list-decimal list-inside text-xs text-gray-600 dark:text-slate-400 space-y-2 leading-relaxed">
            <li>
              Upload your PDF document by dragging and dropping it into the upload box or clicking Browse Files.
            </li>
            <li>
              Select your quality mode (Fast for quick conversion or Ultra HD for crisp print resolution).
            </li>
            <li>
              Click <strong className="text-gray-900 dark:text-white">Convert PDF to JPG</strong>. Converted pages will stream onto your screen in real time.
            </li>
            <li>
              Click <strong className="text-gray-900 dark:text-white">Download All as ZIP</strong> to get all converted pages in one organized archive, or download individual pages as needed.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
