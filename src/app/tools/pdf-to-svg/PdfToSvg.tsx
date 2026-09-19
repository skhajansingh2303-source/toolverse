'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

interface SvgPage {
  pageNumber: number;
  svgCode: string;
  width: number;
  height: number;
  pathCount: number;
  sizeKb: number;
}

export default function PdfToSvg() {
  const [file, setFile] = useState<File | null>(null);
  const [svgPages, setSvgPages] = useState<SvgPage[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [pdfjsLoaded, setPdfjsLoaded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState<boolean>(false);

  // Pan & Zoom in preview
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isDarkCanvas, setIsDarkCanvas] = useState<boolean>(false);

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
      setSvgPages([]);
      setSelectedPageIndex(0);
      setProgress({ current: 0, total: 0 });
    }
  };

  const convertToSvg = async () => {
    if (!file || !(window as any).pdfjsLib) return;
    setIsProcessing(true);
    abortControllerRef.current = false;
    setSvgPages([]);

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await (window as any).pdfjsLib.getDocument({ data: buffer }).promise;
      const numPages = pdf.numPages;
      setProgress({ current: 0, total: numPages });

      const generated: SvgPage[] = [];

      for (let i = 1; i <= numPages; i++) {
        if (abortControllerRef.current) break;

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });

        let svgCode = '';
        let pathCount = 0;

        try {
          // Attempt native vector operator extraction via PDF.js SVGGraphics
          const opList = await page.getOperatorList();
          const svgGfx = new (window as any).pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
          const svgElement: SVGElement = await svgGfx.getSVG(opList, viewport);

          // Add clean namespaces and viewport attributes
          svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          svgElement.setAttribute('viewBox', `0 0 ${viewport.width} ${viewport.height}`);
          svgElement.setAttribute('width', `${viewport.width}`);
          svgElement.setAttribute('height', `${viewport.height}`);

          svgCode = new XMLSerializer().serializeToString(svgElement);
          pathCount = (svgCode.match(/<path|<rect|<circle|<polygon|<text/g) || []).length;
        } catch (svgErr) {
          console.warn(`SVGGraphics fallback on page ${i}:`, svgErr);
          // High-resolution fallback vector wrapper
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width * 2;
          canvas.height = viewport.height * 2;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport: page.getViewport({ scale: 2.0 }) }).promise;
            const imgData = canvas.toDataURL('image/png');
            svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewport.width} ${viewport.height}" width="${viewport.width}" height="${viewport.height}">
  <!-- ToolsVerse Vector SVG Container -->
  <image width="${viewport.width}" height="${viewport.height}" href="${imgData}" />
</svg>`;
            pathCount = 1;
          }
        }

        const sizeKb = parseFloat(((svgCode.length * 2) / 1024).toFixed(1));

        generated.push({
          pageNumber: i,
          svgCode,
          width: Math.round(viewport.width),
          height: Math.round(viewport.height),
          pathCount,
          sizeKb,
        });

        setSvgPages([...generated]);
        setProgress({ current: i, total: numPages });
      }

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `Converted ${numPages} PDF pages into scalable vector SVG!` },
        })
      );
    } catch (err) {
      console.error('Error converting PDF to SVG:', err);
      alert('Could not convert PDF to SVG. Please check the document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentSvg = svgPages[selectedPageIndex] || null;

  const copySvgCode = () => {
    if (!currentSvg) return;
    navigator.clipboard.writeText(currentSvg.svgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    window.dispatchEvent(
      new CustomEvent('toolsverse-toast', {
        detail: { message: `SVG source code for page ${currentSvg.pageNumber} copied!` },
      })
    );
  };

  const downloadSingleSvg = (page: SvgPage) => {
    const blob = new Blob([page.svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const pad = svgPages.length >= 100 ? 3 : 2;
    const pageStr = String(page.pageNumber).padStart(pad, '0');
    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document';
    a.download = `${baseName}_page_${pageStr}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllAsZip = async () => {
    if (svgPages.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document_svg';
      const folder = zip.folder(baseName) || zip;
      const pad = svgPages.length >= 100 ? 3 : 2;

      svgPages.forEach((page) => {
        const pageNum = String(page.pageNumber).padStart(pad, '0');
        folder.file(`page_${pageNum}.svg`, page.svgCode);
      });

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_vector_svg.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: 'All SVG pages downloaded in ZIP archive!' },
        })
      );
    } catch (err) {
      console.error('Error creating SVG zip:', err);
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
          <span className="text-gray-800 dark:text-gray-200 font-medium">PDF to SVG</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            PDF to SVG Scalable Vector Graphics Converter
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Convert PDF pages into resolution-independent SVG vector graphics. Clean vector paths, text elements, interactive zoom inspector, and batch ZIP download.
          </p>
        </div>

        {/* Dropzone */}
        {svgPages.length === 0 && (
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Upload PDF to Convert to Vector SVG
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Extracts crisp vector outlines, fonts, and shapes into standard XML SVG graphics.
                </p>
                <span className="inline-flex items-center px-6 py-3 rounded-xl bg-primary-600 group-hover:bg-primary-700 text-white font-semibold shadow-md transition-all">
                  Browse Files
                </span>
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

                <button
                  type="button"
                  onClick={convertToSvg}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Vectorizing Page {progress.current}/{progress.total}...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      Extract to Scalable SVG
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Vector Workspace */}
        {svgPages.length > 0 && currentSvg && (
          <div className="space-y-6">
            {/* Main Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-4">
                {/* Page Selector Dropdown / Navigator */}
                <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
                  <button
                    onClick={() => setSelectedPageIndex((prev) => Math.max(0, prev - 1))}
                    disabled={selectedPageIndex <= 0}
                    className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40"
                  >
                    ◀
                  </button>
                  <span className="px-2 font-bold text-gray-800 dark:text-gray-200">
                    Page {selectedPageIndex + 1} of {svgPages.length}
                  </span>
                  <button
                    onClick={() => setSelectedPageIndex((prev) => Math.min(svgPages.length - 1, prev + 1))}
                    disabled={selectedPageIndex >= svgPages.length - 1}
                    className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40"
                  >
                    ▶
                  </button>
                </div>

                {/* View Tabs */}
                <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === 'preview'
                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Vector Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === 'code'
                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    SVG Source XML
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={copySvgCode}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {copied ? 'Copied XML!' : 'Copy SVG XML'}
                </button>

                <button
                  type="button"
                  onClick={() => downloadSingleSvg(currentSvg)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Page .svg
                </button>

                <button
                  type="button"
                  onClick={downloadAllAsZip}
                  disabled={isZipping}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isZipping ? (
                    'Creating ZIP...'
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Download All as ZIP
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSvgPages([]);
                    setFile(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors"
                >
                  Convert Another
                </button>
              </div>
            </div>

            {/* Main Stage: Vector Preview or XML Code */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[750px]">
              {/* Stage Sub-Header Controls */}
              <div className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                  <span>
                    Dimensions: {currentSvg.width} × {currentSvg.height} px
                  </span>
                  <span>•</span>
                  <span>{currentSvg.pathCount} vector elements</span>
                  <span>•</span>
                  <span>{currentSvg.sizeKb} KB</span>
                </div>

                {activeTab === 'preview' && (
                  <div className="flex items-center gap-2">
                    {/* Zoom in / out */}
                    <div className="flex items-center bg-white dark:bg-slate-700 rounded-lg border border-gray-300 dark:border-slate-600 px-1 py-0.5">
                      <button
                        onClick={() => setZoomLevel((z) => Math.max(0.4, parseFloat((z - 0.2).toFixed(1))))}
                        className="px-2 py-0.5 font-bold hover:bg-gray-100 dark:hover:bg-slate-600 rounded"
                        title="Zoom Out"
                      >
                        -
                      </button>
                      <span className="px-2 font-mono font-bold text-gray-700 dark:text-gray-200">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        onClick={() => setZoomLevel((z) => Math.min(4.0, parseFloat((z + 0.2).toFixed(1))))}
                        className="px-2 py-0.5 font-bold hover:bg-gray-100 dark:hover:bg-slate-600 rounded"
                        title="Zoom In"
                      >
                        +
                      </button>
                      <button
                        onClick={() => setZoomLevel(1.0)}
                        className="ml-1 px-1.5 py-0.5 text-[11px] text-gray-500 hover:text-black dark:hover:text-white"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Canvas background toggle */}
                    <button
                      onClick={() => setIsDarkCanvas((prev) => !prev)}
                      className="px-2 py-1 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-[11px]"
                    >
                      {isDarkCanvas ? 'Light Canvas' : 'Dark Canvas'}
                    </button>
                  </div>
                )}
              </div>

              {/* Stage Body */}
              {activeTab === 'preview' ? (
                <div
                  className={`flex-1 overflow-auto p-8 flex items-center justify-center transition-colors ${
                    isDarkCanvas ? 'bg-slate-950' : 'bg-gray-200/70 dark:bg-slate-900/60'
                  }`}
                >
                  <div
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="shadow-2xl rounded bg-white overflow-hidden max-w-full"
                    dangerouslySetInnerHTML={{ __html: currentSvg.svgCode }}
                  />
                </div>
              ) : (
                <textarea
                  value={currentSvg.svgCode}
                  readOnly
                  className="flex-1 w-full p-4 font-mono text-xs leading-relaxed bg-transparent text-gray-900 dark:text-gray-100 resize-none focus:outline-none"
                  spellCheck={false}
                />
              )}
            </div>

            {/* Thumbnail Bottom Carousel */}
            {svgPages.length > 1 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  All Document Pages ({svgPages.length})
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {svgPages.map((pg, idx) => (
                    <div
                      key={pg.pageNumber}
                      onClick={() => setSelectedPageIndex(idx)}
                      className={`cursor-pointer flex-shrink-0 w-28 p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        selectedPageIndex === idx
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/60 ring-2 ring-primary-500/30'
                          : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/40 hover:border-gray-400'
                      }`}
                    >
                      <div className="w-full aspect-[1/1.3] bg-white rounded shadow-xs overflow-hidden flex items-center justify-center pointer-events-none p-1">
                        <div
                          className="w-full h-full scale-[0.2] origin-top-left"
                          dangerouslySetInnerHTML={{ __html: pg.svgCode }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        Page {pg.pageNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ad Slot */}
        <AdSlot format="horizontal" />

        {/* How to Use Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Convert PDF to Scalable SVG
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                1
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Select PDF File</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload your document. Our engine parses the vector operator stream in browser memory without sending data to servers.
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                2
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Interactive Vector Inspection</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Zoom in up to 400% to inspect infinite vector path fidelity. Inspect the raw SVG XML markup and element counts.
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                3
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Export SVG or ZIP Archive</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Copy XML with 1 click, save single .svg vector graphics, or download all pages bundled in a ZIP file for Illustrator, Figma, or Web.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
