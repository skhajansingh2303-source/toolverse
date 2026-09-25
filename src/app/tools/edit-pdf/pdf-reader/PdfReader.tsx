'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import AdSlot from '@/components/AdSlot';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface SearchMatch {
  pageNumber: number;
  snippet: string;
}

export default function PdfReader() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(1.25);
  const [viewMode, setViewMode] = useState<'scroll' | 'single'>('scroll');
  const [rotation, setRotation] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pdfjsLoaded, setPdfjsLoaded] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [extractedPageTexts, setExtractedPageTexts] = useState<{ [pageNum: number]: string }>({});

  // Thumbnails data URLs
  const [thumbnails, setThumbnails] = useState<{ [pageNum: number]: string }>({});

  // Container refs
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const readerRootRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{ [pageNum: number]: HTMLDivElement | null }>({});

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

  const loadPdfData = async (data: ArrayBuffer, fileName: string) => {
    if (!(window as any).pdfjsLib) return;
    setIsLoading(true);
    try {
      const loadingTask = (window as any).pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;
      setPdfDocProxy(pdf);
      setNumPages(pdf.numPages);
      setCurrentPage(1);
      setRotation(0);
      setThumbnails({});
      setExtractedPageTexts({});
      setSearchResults([]);
      setCurrentMatchIndex(-1);

      // Pre-extract page texts for fast instant search
      const texts: { [pageNum: number]: string } = {};
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const str = textContent.items.map((item: any) => item.str).join(' ');
        texts[i] = str;
      }
      setExtractedPageTexts(texts);

      // Generate thumbnails asynchronously
      generateThumbnails(pdf);
    } catch (err) {
      console.error('Failed to load PDF document:', err);
      alert('Could not open this PDF document. Please verify the file is not password-protected or damaged.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          loadPdfData(reader.result, uploadedFile.name);
        }
      };
      reader.readAsArrayBuffer(uploadedFile);
    }
  };

  const loadSamplePdf = async () => {
    setIsLoading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Page 1: Cover & Intro
      const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
      page1.drawRectangle({
        x: 0,
        y: 800,
        width: 595.28,
        height: 42,
        color: rgb(0.31, 0.27, 0.9),
      });
      page1.drawText('ToolsVerse Reader Documentation & Spec', {
        x: 40,
        y: 814,
        size: 16,
        font: helveticaBold,
        color: rgb(1, 1, 1),
      });

      page1.drawText('Sample In-Browser Interactive PDF Document', {
        x: 40,
        y: 740,
        size: 22,
        font: helveticaBold,
        color: rgb(0.12, 0.16, 0.22),
      });

      page1.drawText('Welcome to ToolsVerse PDF Reader. This is a built-in sample document.', {
        x: 40,
        y: 710,
        size: 13,
        font: helvetica,
        color: rgb(0.35, 0.4, 0.48),
      });

      const bodyText1 = [
        'Features included in this high-performance in-browser reader:',
        '• Multi-page smooth continuous vertical scrolling or presentation single-page mode',
        '• Responsive Page Thumbnails sidebar with instant jump navigation',
        '• High-DPI canvas vector scaling from 50% to 300% zoom with Fit Width / Fit Page',
        '• Fast full-text document search with query matches and snippets',
        '• Interactive 90° clockwise and counter-clockwise page orientation rotation',
        '• Eye-comfort Dark Reader mode for fatigue-free nighttime document review',
        '• Native full-screen presentation mode for presentations and reading',
      ];

      let yPos = 660;
      bodyText1.forEach((line) => {
        page1.drawText(line, {
          x: 40,
          y: yPos,
          size: 11,
          font: line.startsWith('•') ? helvetica : helveticaBold,
          color: rgb(0.2, 0.25, 0.3),
        });
        yPos -= 24;
      });

      page1.drawRectangle({
        x: 40,
        y: 350,
        width: 515,
        height: 100,
        borderColor: rgb(0.8, 0.85, 0.9),
        borderWidth: 1,
        color: rgb(0.97, 0.98, 1),
      });
      page1.drawText('Section 1.1 - Search Test Keyword: "QUANTUM_ACCELERATOR"', {
        x: 55,
        y: 415,
        size: 13,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.8),
      });
      page1.drawText(
        'Try typing "QUANTUM" or "ACCELERATOR" in the search box in the top toolbar to test instant query finding!',
        {
          x: 55,
          y: 385,
          size: 10,
          font: helvetica,
          color: rgb(0.3, 0.35, 0.4),
        }
      );

      // Page 2: Analytical Data Table
      const page2 = pdfDoc.addPage([595.28, 841.89]);
      page2.drawText('Page 2: Performance Metrics & Data Analysis', {
        x: 40,
        y: 780,
        size: 18,
        font: helveticaBold,
        color: rgb(0.15, 0.2, 0.25),
      });
      page2.drawText(
        'The table below illustrates benchmark measurements for document parsing speeds in browser memory:',
        {
          x: 40,
          y: 750,
          size: 11,
          font: helvetica,
          color: rgb(0.4, 0.45, 0.5),
        }
      );

      // Table header
      page2.drawRectangle({
        x: 40,
        y: 690,
        width: 515,
        height: 28,
        color: rgb(0.25, 0.35, 0.6),
      });
      page2.drawText('Module / Component', { x: 55, y: 700, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
      page2.drawText('Render Mode', { x: 220, y: 700, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
      page2.drawText('FPS / Latency', { x: 360, y: 700, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
      page2.drawText('Status', { x: 470, y: 700, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });

      const rows = [
        ['Canvas Stream Painter', 'Hardware Accelerated', '60 FPS (<16ms)', 'OPTIMAL'],
        ['Text Content Extractor', 'Asynchronous Web Worker', '1.2ms / Page', 'OPTIMAL'],
        ['Vector Scaler', 'Bi-linear Interpolation', 'Smooth HiDPI', 'ACTIVE'],
        ['Color Inversion Shader', 'CSS Compositor Filter', '0ms Overhead', 'ENABLED'],
      ];

      let tableY = 662;
      rows.forEach((row, idx) => {
        if (idx % 2 === 1) {
          page2.drawRectangle({
            x: 40,
            y: tableY - 6,
            width: 515,
            height: 24,
            color: rgb(0.96, 0.97, 0.99),
          });
        }
        page2.drawText(row[0], { x: 55, y: tableY, size: 9, font: helveticaBold, color: rgb(0.2, 0.25, 0.3) });
        page2.drawText(row[1], { x: 220, y: tableY, size: 9, font: helvetica, color: rgb(0.3, 0.35, 0.4) });
        page2.drawText(row[2], { x: 360, y: tableY, size: 9, font: helvetica, color: rgb(0.3, 0.35, 0.4) });
        page2.drawText(row[3], { x: 470, y: tableY, size: 9, font: helveticaBold, color: rgb(0.1, 0.6, 0.2) });
        tableY -= 26;
      });

      // Page 3: Summary
      const page3 = pdfDoc.addPage([595.28, 841.89]);
      page3.drawText('Page 3: Privacy & Security Assurances', {
        x: 40,
        y: 780,
        size: 18,
        font: helveticaBold,
        color: rgb(0.15, 0.2, 0.25),
      });
      page3.drawText(
        'All PDF rendering, searching, and decoding operations happen 100% locally on your machine.',
        {
          x: 40,
          y: 740,
          size: 12,
          font: helvetica,
          color: rgb(0.3, 0.35, 0.4),
        }
      );
      page3.drawText(
        'Zero bytes leave your computer. Sensitive financial, legal, and personal documents stay confidential.',
        {
          x: 40,
          y: 715,
          size: 11,
          font: helvetica,
          color: rgb(0.4, 0.45, 0.5),
        }
      );

      const pdfBytes = await pdfDoc.save();
      const mockFile = new File([pdfBytes.buffer as ArrayBuffer], 'ToolsVerse_Sample_Document.pdf', { type: 'application/pdf' });
      setFile(mockFile);
      loadPdfData(pdfBytes.buffer as ArrayBuffer, 'ToolsVerse_Sample_Document.pdf');
    } catch (e) {
      console.error('Failed to create sample PDF:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const generateThumbnails = async (pdf: any) => {
    const thumbs: { [pageNum: number]: string } = {};
    for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.25 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
          thumbs[i] = canvas.toDataURL('image/jpeg', 0.7);
          setThumbnails((prev) => ({ ...prev, [i]: thumbs[i] }));
        }
      } catch (err) {
        console.warn(`Thumbnail error on page ${i}:`, err);
      }
    }
  };

  // Render a specific page to its canvas
  const renderPageCanvas = useCallback(
    async (pageNum: number, canvasEl: HTMLCanvasElement) => {
      if (!pdfDocProxy) return;
      try {
        const page = await pdfDocProxy.getPage(pageNum);
        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: zoomScale, rotation });

        canvasEl.width = Math.floor(viewport.width * dpr);
        canvasEl.height = Math.floor(viewport.height * dpr);
        canvasEl.style.width = `${Math.floor(viewport.width)}px`;
        canvasEl.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvasEl.getContext('2d');
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, viewport.width, viewport.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
        }
      } catch (err) {
        console.error(`Error rendering page ${pageNum}:`, err);
      }
    },
    [pdfDocProxy, zoomScale, rotation]
  );

  // Search execution
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentMatchIndex(-1);
      return;
    }
    setIsSearching(true);
    const q = searchQuery.toLowerCase();
    const results: SearchMatch[] = [];

    for (let i = 1; i <= numPages; i++) {
      const text = extractedPageTexts[i] || '';
      const lower = text.toLowerCase();
      let pos = 0;
      while ((pos = lower.indexOf(q, pos)) !== -1) {
        const start = Math.max(0, pos - 30);
        const end = Math.min(text.length, pos + q.length + 40);
        results.push({
          pageNumber: i,
          snippet: (start > 0 ? '...' : '') + text.substring(start, end).trim() + (end < text.length ? '...' : ''),
        });
        pos += q.length;
      }
    }
    setSearchResults(results);
    if (results.length > 0) {
      setCurrentMatchIndex(0);
      jumpToPage(results[0].pageNumber);
    } else {
      setCurrentMatchIndex(-1);
    }
    setIsSearching(false);
  };

  const nextSearchResult = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % searchResults.length;
    setCurrentMatchIndex(nextIdx);
    jumpToPage(searchResults[nextIdx].pageNumber);
  };

  const prevSearchResult = () => {
    if (searchResults.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentMatchIndex(prevIdx);
    jumpToPage(searchResults[prevIdx].pageNumber);
  };

  const jumpToPage = (pageNum: number) => {
    const target = Math.max(1, Math.min(numPages, pageNum));
    setCurrentPage(target);
    if (viewMode === 'scroll') {
      const el = pageRefs.current[target];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const rotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const rotateCounterClockwise = () => {
    setRotation((prev) => (prev + 270) % 360);
  };

  const zoomIn = () => {
    setZoomScale((prev) => Math.min(3.0, parseFloat((prev + 0.2).toFixed(2))));
  };

  const zoomOut = () => {
    setZoomScale((prev) => Math.max(0.5, parseFloat((prev - 0.2).toFixed(2))));
  };

  const fitWidth = () => {
    if (!viewerContainerRef.current) return;
    const containerWidth = viewerContainerRef.current.clientWidth - 80;
    // Base A4 width is ~595px
    const targetScale = Math.max(0.5, Math.min(3.0, containerWidth / 620));
    setZoomScale(parseFloat(targetScale.toFixed(2)));
  };

  const fitPage = () => {
    if (!viewerContainerRef.current) return;
    const containerHeight = viewerContainerRef.current.clientHeight - 60;
    const targetScale = Math.max(0.5, Math.min(3.0, containerHeight / 860));
    setZoomScale(parseFloat(targetScale.toFixed(2)));
  };

  const toggleFullscreen = () => {
    if (!readerRootRef.current) return;
    if (!document.fullscreenElement) {
      readerRootRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Update visible current page on scroll in continuous mode
  const handleContainerScroll = () => {
    if (viewMode !== 'scroll' || !viewerContainerRef.current) return;
    const containerTop = viewerContainerRef.current.scrollTop;
    for (let i = 1; i <= numPages; i++) {
      const el = pageRefs.current[i];
      if (el) {
        const top = el.offsetTop - viewerContainerRef.current.offsetTop;
        const bottom = top + el.clientHeight;
        if (containerTop >= top - 150 && containerTop < bottom) {
          setCurrentPage(i);
          break;
        }
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        jumpToPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        jumpToPage(currentPage - 1);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        zoomOut();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsDarkMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, numPages]);

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
          <span className="text-gray-800 dark:text-gray-200 font-medium">PDF Reader</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            PDF Reader & Online Viewer
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Read, search, inspect, and present PDF documents directly in your browser with high-DPI scaling, smooth continuous scrolling, dark reader mode, and page thumbnails.
          </p>
        </div>

        {/* Upload Dropzone / Sample Loader */}
        {!pdfDocProxy && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-10">
            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-400 rounded-3xl p-8 sm:p-12 text-center transition-colors group">
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => {
                  handleFileChange(e);
                  e.target.value = '';
                }}
              />
              <div className="pointer-events-none flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-105 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Drop your PDF here or click to browse
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Supports multi-page documents, manuals, eBooks, and presentations. 100% private in-browser viewing.
                </p>
                <span className="inline-flex items-center px-6 py-3 rounded-xl bg-primary-600 group-hover:bg-primary-700 text-white font-semibold shadow-md transition-all">
                  Browse Files
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                Don&apos;t have a PDF ready?
              </span>
              <button
                onClick={loadSamplePdf}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 transition-colors border border-gray-200 dark:border-slate-700"
              >
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Load Interactive Sample Document
              </button>
            </div>
          </div>
        )}

        {/* Reader Workspace */}
        {pdfDocProxy && (
          <div
            ref={readerRootRef}
            className={`flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-md overflow-hidden ${
              isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[860px]'
            }`}
          >
            {/* Main Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-gray-100/90 dark:bg-slate-800/90 border-b border-gray-200 dark:border-slate-700 backdrop-blur-sm select-none z-20">
              {/* Left: Document info & Sidebar Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowThumbnails((prev) => !prev)}
                  title={showThumbnails ? 'Hide Thumbnails' : 'Show Thumbnails'}
                  className={`p-2 rounded-lg border transition-colors ${
                    showThumbnails
                      ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400'
                      : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>

                <div className="hidden sm:flex flex-col truncate max-w-[180px] lg:max-w-[240px]">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {file?.name || 'Document'}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {numPages} {numPages === 1 ? 'page' : 'pages'}
                  </span>
                </div>
              </div>

              {/* Center: Navigation & View Mode */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-white dark:bg-slate-700 rounded-lg border border-gray-300 dark:border-slate-600 px-1 py-0.5">
                  <button
                    onClick={() => jumpToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-40"
                    title="Previous Page (Arrow Left)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="px-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {currentPage} / {numPages}
                  </span>
                  <button
                    onClick={() => jumpToPage(currentPage + 1)}
                    disabled={currentPage >= numPages}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-40"
                    title="Next Page (Arrow Right)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* View Mode Toggle: Scroll vs Single */}
                <div className="flex items-center bg-white dark:bg-slate-700 rounded-lg border border-gray-300 dark:border-slate-600 p-0.5 text-xs font-medium">
                  <button
                    onClick={() => setViewMode('scroll')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      viewMode === 'scroll'
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
                    }`}
                    title="Continuous Vertical Scroll"
                  >
                    Scroll
                  </button>
                  <button
                    onClick={() => setViewMode('single')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      viewMode === 'single'
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
                    }`}
                    title="Single Page Presentation"
                  >
                    Single
                  </button>
                </div>
              </div>

              {/* Search Toolbar */}
              <div className="flex items-center space-x-1.5">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch();
                    }}
                    placeholder="Search in PDF..."
                    className="w-32 sm:w-44 pl-7 pr-7 py-1 text-xs rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  />
                  <svg className="w-3.5 h-3.5 absolute left-2 text-gray-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        setCurrentMatchIndex(-1);
                      }}
                      className="absolute right-2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                <button
                  onClick={handleSearch}
                  className="px-2 py-1 text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Find
                </button>

                {searchResults.length > 0 && (
                  <div className="flex items-center space-x-1 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-700 px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-600">
                    <span>
                      {currentMatchIndex + 1}/{searchResults.length}
                    </span>
                    <button onClick={prevSearchResult} className="p-0.5 hover:text-primary-500" title="Previous match">
                      ▲
                    </button>
                    <button onClick={nextSearchResult} className="p-0.5 hover:text-primary-500" title="Next match">
                      ▼
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Zoom, Rotation, Dark Mode, Fullscreen */}
              <div className="flex items-center space-x-1.5">
                {/* Zoom Controls */}
                <div className="flex items-center bg-white dark:bg-slate-700 rounded-lg border border-gray-300 dark:border-slate-600 px-1 py-0.5">
                  <button onClick={zoomOut} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-600" title="Zoom Out (-)">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="px-1.5 text-xs font-bold text-gray-700 dark:text-gray-200">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button onClick={zoomIn} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-600" title="Zoom In (+)">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Fit buttons */}
                <button
                  onClick={fitWidth}
                  className="hidden md:inline-flex px-2 py-1 text-xs rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 font-medium text-gray-700 dark:text-gray-200"
                  title="Fit Page Width"
                >
                  Width
                </button>
                <button
                  onClick={fitPage}
                  className="hidden md:inline-flex px-2 py-1 text-xs rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 font-medium text-gray-700 dark:text-gray-200"
                  title="Fit Full Page Height"
                >
                  Page
                </button>

                {/* Rotate Buttons */}
                <button
                  onClick={rotateClockwise}
                  className="p-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200"
                  title="Rotate 90° Clockwise"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                {/* Dark Reader Invert Mode */}
                <button
                  onClick={() => setIsDarkMode((prev) => !prev)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isDarkMode
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600'
                  }`}
                  title={isDarkMode ? 'Exit Dark Reader Mode (D)' : 'Enable Eye-Comfort Dark Reader Mode (D)'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200"
                  title="Toggle Fullscreen Presentation (F)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isFullscreen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    )}
                  </svg>
                </button>

                {/* Close Document */}
                <button
                  onClick={() => {
                    setPdfDocProxy(null);
                    setFile(null);
                  }}
                  className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-semibold"
                  title="Close and Open Another Document"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Viewer Body: Sidebar + Main Canvas Scroll Area */}
            <div className="flex flex-1 overflow-hidden relative">
              {/* Thumbnail Sidebar */}
              {showThumbnails && (
                <div className="w-48 sm:w-56 bg-gray-100 dark:bg-slate-800/70 border-r border-gray-200 dark:border-slate-700 overflow-y-auto p-3 flex flex-col gap-3 select-none">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
                    Pages ({numPages})
                  </div>
                  {Array.from({ length: numPages }, (_, i) => i + 1).map((pNum) => (
                    <div
                      key={`thumb-${pNum}`}
                      onClick={() => jumpToPage(pNum)}
                      className={`cursor-pointer group flex flex-col items-center p-2 rounded-xl border transition-all ${
                        currentPage === pNum
                          ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-500 ring-2 ring-primary-500/30'
                          : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="w-full aspect-[1/1.3] bg-gray-200 dark:bg-slate-800 rounded flex items-center justify-center overflow-hidden border border-gray-300 dark:border-slate-700">
                        {thumbnails[pNum] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbnails[pNum]}
                            alt={`Thumbnail Page ${pNum}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-slate-400">P. {pNum}</span>
                        )}
                      </div>
                      <span className="mt-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary-600">
                        Page {pNum}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Main Document Canvas Area */}
              <div
                ref={viewerContainerRef}
                onScroll={handleContainerScroll}
                className={`flex-1 overflow-auto p-4 sm:p-8 flex flex-col items-center bg-gray-200/70 dark:bg-slate-950 transition-colors ${
                  isDarkMode ? 'dark-pdf-filter' : ''
                }`}
              >
                <style jsx global>{`
                  .dark-pdf-filter canvas {
                    filter: invert(0.92) hue-rotate(180deg) contrast(1.05) brightness(0.95);
                  }
                `}</style>

                {/* View Mode: Continuous Scroll */}
                {viewMode === 'scroll' && (
                  <div className="flex flex-col items-center gap-6 w-full">
                    {Array.from({ length: numPages }, (_, i) => i + 1).map((pNum) => (
                      <div
                        key={`page-${pNum}`}
                        ref={(el) => {
                          pageRefs.current[pNum] = el;
                        }}
                        className="relative bg-white shadow-xl rounded-sm transition-all"
                      >
                        <PageCanvasItem
                          pageNum={pNum}
                          renderPageCanvas={renderPageCanvas}
                          zoomScale={zoomScale}
                          rotation={rotation}
                        />
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[11px] font-medium text-gray-500 dark:text-gray-400 select-none">
                          Page {pNum}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* View Mode: Single Page Presentation */}
                {viewMode === 'single' && (
                  <div className="flex flex-col items-center justify-center min-h-full py-4">
                    <div className="relative bg-white shadow-2xl rounded-sm">
                      <PageCanvasItem
                        pageNum={currentPage}
                        renderPageCanvas={renderPageCanvas}
                        zoomScale={zoomScale}
                        rotation={rotation}
                      />
                    </div>
                    <div className="mt-4 flex items-center gap-4 select-none">
                      <button
                        onClick={() => jumpToPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 shadow-sm disabled:opacity-40"
                      >
                        ← Previous
                      </button>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {numPages}
                      </span>
                      <button
                        onClick={() => jumpToPage(currentPage + 1)}
                        disabled={currentPage >= numPages}
                        className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 shadow-sm disabled:opacity-40"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ad Slot */}
        <AdSlot format="horizontal" />

        {/* How to Use Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use the ToolsVerse Online PDF Reader
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                1
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Open Your PDF</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop your PDF into the upload area or click &quot;Load Interactive Sample Document&quot; to test the reader immediately.
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                2
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Customize View & Zoom</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Switch between smooth continuous vertical scroll and single-page presentation mode. Use Fit Width or Fit Page, and toggle Dark Mode (press &quot;D&quot;) for night reading.
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                3
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Search & Navigate</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use the search input in the top bar to find keywords across pages instantly. Jump across chapters using the thumbnail preview sidebar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for rendering each canvas cleanly
function PageCanvasItem({
  pageNum,
  renderPageCanvas,
  zoomScale,
  rotation,
}: {
  pageNum: number;
  renderPageCanvas: (num: number, canvas: HTMLCanvasElement) => void;
  zoomScale: number;
  rotation: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderPageCanvas(pageNum, canvasRef.current);
    }
  }, [pageNum, renderPageCanvas, zoomScale, rotation]);

  return <canvas ref={canvasRef} className="block shadow-md max-w-full" />;
}
