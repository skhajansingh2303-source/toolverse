'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import AdSlot from '@/components/AdSlot';

interface DiffLine {
  type: 'added' | 'removed' | 'equal';
  text: string;
  lineNumA?: number;
  lineNumB?: number;
}

interface DiffStats {
  added: number;
  deleted: number;
  unchanged: number;
  similarity: number;
}

export default function ComparePdf() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [pageCountA, setPageCountA] = useState(0);
  const [pageCountB, setPageCountB] = useState(0);

  const [compareMode, setCompareMode] = useState<'visual' | 'text'>('visual');
  const [currentPage, setCurrentPage] = useState(1);
  const [visualViewType, setVisualViewType] = useState<'side-by-side' | 'pixel-diff'>('side-by-side');

  const [isComparing, setIsComparing] = useState(false);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const [diffStats, setDiffStats] = useState<DiffStats | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Canvases refs
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);
  const canvasDiffRef = useRef<HTMLCanvasElement>(null);

  // Cached PDF documents
  const pdfDocARef = useRef<any>(null);
  const pdfDocBRef = useRef<any>(null);

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

  const handleFileASelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileA(f);
      setErrorMsg('');
      setDiffStats(null);
      setDiffLines([]);
      try {
        if ((window as any).pdfjsLib) {
          const buf = await f.arrayBuffer();
          const doc = await (window as any).pdfjsLib.getDocument({ data: buf }).promise;
          pdfDocARef.current = doc;
          setPageCountA(doc.numPages);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFileBSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileB(f);
      setErrorMsg('');
      setDiffStats(null);
      setDiffLines([]);
      try {
        if ((window as any).pdfjsLib) {
          const buf = await f.arrayBuffer();
          const doc = await (window as any).pdfjsLib.getDocument({ data: buf }).promise;
          pdfDocBRef.current = doc;
          setPageCountB(doc.numPages);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Re-render visual pages when current page changes
  useEffect(() => {
    if (fileA && fileB && pdfjsLoaded) {
      renderVisualPages(currentPage);
    }
  }, [currentPage, fileA, fileB, pdfjsLoaded, visualViewType]);

  const renderVisualPages = async (pageIdx: number) => {
    if (!fileA || !fileB || !(window as any).pdfjsLib) return;

    try {
      if (!pdfDocARef.current) {
        const bufA = await fileA.arrayBuffer();
        pdfDocARef.current = await (window as any).pdfjsLib.getDocument({ data: bufA }).promise;
        setPageCountA(pdfDocARef.current.numPages);
      }
      if (!pdfDocBRef.current) {
        const bufB = await fileB.arrayBuffer();
        pdfDocBRef.current = await (window as any).pdfjsLib.getDocument({ data: bufB }).promise;
        setPageCountB(pdfDocBRef.current.numPages);
      }

      const docA = pdfDocARef.current;
      const docB = pdfDocBRef.current;

      const scale = 1.3;

      // Render Page A
      let canvasA = canvasARef.current;
      if (pageIdx <= docA.numPages && canvasA) {
        const pageA = await docA.getPage(pageIdx);
        const viewportA = pageA.getViewport({ scale });
        canvasA.width = viewportA.width;
        canvasA.height = viewportA.height;
        const ctxA = canvasA.getContext('2d');
        if (ctxA) {
          ctxA.fillStyle = '#ffffff';
          ctxA.fillRect(0, 0, canvasA.width, canvasA.height);
          await pageA.render({ canvasContext: ctxA, viewport: viewportA }).promise;
        }
      }

      // Render Page B
      let canvasB = canvasBRef.current;
      if (pageIdx <= docB.numPages && canvasB) {
        const pageB = await docB.getPage(pageIdx);
        const viewportB = pageB.getViewport({ scale });
        canvasB.width = viewportB.width;
        canvasB.height = viewportB.height;
        const ctxB = canvasB.getContext('2d');
        if (ctxB) {
          ctxB.fillStyle = '#ffffff';
          ctxB.fillRect(0, 0, canvasB.width, canvasB.height);
          await pageB.render({ canvasContext: ctxB, viewport: viewportB }).promise;
        }
      }

      // Render Pixel Diff
      if (visualViewType === 'pixel-diff' && canvasA && canvasB && canvasDiffRef.current) {
        const diffCanvas = canvasDiffRef.current;
        const width = Math.max(canvasA.width, canvasB.width);
        const height = Math.max(canvasA.height, canvasB.height);
        diffCanvas.width = width;
        diffCanvas.height = height;

        const diffCtx = diffCanvas.getContext('2d');
        const ctxA = canvasA.getContext('2d');
        const ctxB = canvasB.getContext('2d');

        if (diffCtx && ctxA && ctxB) {
          const imgA = ctxA.getImageData(0, 0, canvasA.width, canvasA.height);
          const imgB = ctxB.getImageData(0, 0, canvasB.width, canvasB.height);
          const diffImg = diffCtx.createImageData(width, height);

          const dataA = imgA.data;
          const dataB = imgB.data;
          const diffData = diffImg.data;

          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const diffIdx = (y * width + x) * 4;

              if (x < canvasA.width && y < canvasA.height && x < canvasB.width && y < canvasB.height) {
                const idxA = (y * canvasA.width + x) * 4;
                const idxB = (y * canvasB.width + x) * 4;

                const dr = Math.abs(dataA[idxA] - dataB[idxB]);
                const dg = Math.abs(dataA[idxA + 1] - dataB[idxB + 1]);
                const db = Math.abs(dataA[idxA + 2] - dataB[idxB + 2]);
                const delta = (dr + dg + db) / 3;

                if (delta > 20) {
                  // Changed pixel: highlight in vivid bright magenta / red
                  diffData[diffIdx] = 239; // R
                  diffData[diffIdx + 1] = 68; // G
                  diffData[diffIdx + 2] = 68; // B
                  diffData[diffIdx + 3] = 255;
                } else {
                  // Unchanged pixel: faint grayscale
                  const gray = (dataA[idxA] + dataA[idxA + 1] + dataA[idxA + 2]) / 3;
                  diffData[diffIdx] = Math.min(240, gray + 20);
                  diffData[diffIdx + 1] = Math.min(240, gray + 20);
                  diffData[diffIdx + 2] = Math.min(240, gray + 20);
                  diffData[diffIdx + 3] = 255;
                }
              } else {
                // Out of bounds in one document
                diffData[diffIdx] = 234;
                diffData[diffIdx + 1] = 88;
                diffData[diffIdx + 2] = 12;
                diffData[diffIdx + 3] = 255;
              }
            }
          }

          diffCtx.putImageData(diffImg, 0, 0);
        }
      }
    } catch (err: any) {
      console.error('Visual render error:', err);
    }
  };

  // Extract all text from a loaded PDF.js document
  const extractPdfText = async (doc: any): Promise<string[]> => {
    const lines: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      const splitLines = pageText.split('\n').map((l: string) => l.trim()).filter(Boolean);
      if (splitLines.length > 0) {
        lines.push(...splitLines);
      } else if (pageText.trim().length > 0) {
        lines.push(pageText.trim());
      }
    }
    return lines;
  };

  // Standard Myers/LCS text difference generator
  const computeDiff = (linesA: string[], linesB: string[]): { diffs: DiffLine[]; stats: DiffStats } => {
    const n = linesA.length;
    const m = linesB.length;

    // LCS Matrix
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (linesA[i] === linesB[j]) {
          dp[i + 1][j + 1] = dp[i][j] + 1;
        } else {
          dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
    }

    // Backtrack to find diff
    const diffs: DiffLine[] = [];
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
        diffs.unshift({ type: 'equal', text: linesA[i - 1], lineNumA: i, lineNumB: j });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        diffs.unshift({ type: 'added', text: linesB[j - 1], lineNumB: j });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        diffs.unshift({ type: 'removed', text: linesA[i - 1], lineNumA: i });
        i--;
      }
    }

    let added = 0;
    let deleted = 0;
    let unchanged = 0;

    diffs.forEach((d) => {
      if (d.type === 'added') added++;
      else if (d.type === 'removed') deleted++;
      else unchanged++;
    });

    const totalLines = added + deleted + unchanged;
    const similarity = totalLines > 0 ? Math.round((unchanged / (unchanged + Math.max(added, deleted))) * 1000) / 10 : 100;

    return {
      diffs,
      stats: { added, deleted, unchanged, similarity },
    };
  };

  const startComparison = async () => {
    if (!fileA || !fileB) {
      setErrorMsg('Please select both Original Document A and Modified Document B.');
      return;
    }

    setIsComparing(true);
    setErrorMsg('');

    try {
      if (!pdfDocARef.current) {
        const bufA = await fileA.arrayBuffer();
        pdfDocARef.current = await (window as any).pdfjsLib.getDocument({ data: bufA }).promise;
        setPageCountA(pdfDocARef.current.numPages);
      }
      if (!pdfDocBRef.current) {
        const bufB = await fileB.arrayBuffer();
        pdfDocBRef.current = await (window as any).pdfjsLib.getDocument({ data: bufB }).promise;
        setPageCountB(pdfDocBRef.current.numPages);
      }

      // Compute text differences
      const [linesA, linesB] = await Promise.all([
        extractPdfText(pdfDocARef.current),
        extractPdfText(pdfDocBRef.current),
      ]);

      const { diffs, stats } = computeDiff(linesA, linesB);
      setDiffLines(diffs);
      setDiffStats(stats);

      // Render visual preview
      await renderVisualPages(currentPage);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `⚖️ Comparison complete! Similarity: ${stats.similarity}%` },
        })
      );
    } catch (err: any) {
      console.error('Diff error:', err);
      setErrorMsg(err.message || 'Failed to compare the two PDF files.');
    } finally {
      setIsComparing(false);
    }
  };

  const maxPages = Math.max(pageCountA, pageCountB, 1);

  const copyDiffSummary = () => {
    if (!diffStats) return;
    const text = [
      `PDF COMPARISON REPORT`,
      `Original: ${fileA?.name}`,
      `Modified: ${fileB?.name}`,
      `Match Similarity: ${diffStats.similarity}%`,
      `Added Lines: ${diffStats.added}`,
      `Deleted Lines: ${diffStats.deleted}`,
      `Unchanged Lines: ${diffStats.unchanged}`,
      `\n--- DIFFERENCE LOG ---`,
      ...diffLines.map((d) => `${d.type === 'added' ? '+ ' : d.type === 'removed' ? '- ' : '  '}${d.text}`),
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: '📋 Diff report copied to clipboard!' },
        })
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={handleScriptLoad}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-semibold">Compare PDF</span>
        </nav>

        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white text-xl shadow-sm">
              ⚖️
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Compare PDF - Visual & Text Diff Tool
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            Compare two PDF revisions side-by-side. Highlight added, deleted, and modified text streams, or inspect visual differences with the pixel diff highlighter.
          </p>
        </header>

        <AdSlot format="horizontal" />

        {/* Dual Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-6">
          {/* File A: Original */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Document A (Original Version)
              </span>
              <span className="text-[11px] text-gray-400">Reference draft</span>
            </div>

            {!fileA ? (
              <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-rose-400 rounded-2xl p-8 text-center transition-colors group bg-gray-50/50 dark:bg-slate-950">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    handleFileASelect(e);
                    e.target.value = '';
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="pointer-events-none flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                    📄
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                    Upload Original PDF
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mb-3">
                    Older revision or master file
                  </p>
                  <span className="px-4 py-1.5 bg-rose-600 group-hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs inline-block">
                    Browse Files
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-rose-50/60 dark:bg-rose-950/30 rounded-xl p-4 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📕</span>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-xs text-gray-900 dark:text-white truncate max-w-[200px]">
                      {fileA.name}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">
                      {pageCountA} pages • {(fileA.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFileA(null);
                    pdfDocARef.current = null;
                    setPageCountA(0);
                    setDiffStats(null);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* File B: Modified */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Document B (Modified Version)
              </span>
              <span className="text-[11px] text-gray-400">New revision</span>
            </div>

            {!fileB ? (
              <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-emerald-400 rounded-2xl p-8 text-center transition-colors group bg-gray-50/50 dark:bg-slate-950">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    handleFileBSelect(e);
                    e.target.value = '';
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="pointer-events-none flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                    📝
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                    Upload Modified PDF
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mb-3">
                    Newer revision or edited file
                  </p>
                  <span className="px-4 py-1.5 bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs inline-block">
                    Browse Files
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📗</span>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-xs text-gray-900 dark:text-white truncate max-w-[200px]">
                      {fileB.name}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">
                      {pageCountB} pages • {(fileB.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFileB(null);
                    pdfDocBRef.current = null;
                    setPageCountB(0);
                    setDiffStats(null);
                  }}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Start Comparison Button Bar */}
        {fileA && fileB && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm mb-8">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-gray-500 dark:text-slate-400">
                Mode:
              </span>
              <div className="inline-flex rounded-xl bg-gray-100 dark:bg-slate-800 p-1 text-xs">
                <button
                  onClick={() => setCompareMode('visual')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    compareMode === 'visual'
                      ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-900'
                  }`}
                >
                  Visual Side-by-Side
                </button>
                <button
                  onClick={() => setCompareMode('text')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    compareMode === 'text'
                      ? 'bg-white dark:bg-slate-700 dark:text-white shadow-xs'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-900'
                  }`}
                >
                  Text Difference Mode
                </button>
              </div>
            </div>

            <button
              onClick={startComparison}
              disabled={isComparing}
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-xl px-6 py-2.5 text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {isComparing ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Comparing PDFs...
                </>
              ) : (
                <>⚡ Compare Documents</>
              )}
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Diff Statistics Banner */}
        {diffStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm text-center">
              <p className="text-2xl font-black text-primary-600 dark:text-primary-400">
                {diffStats.similarity}%
              </p>
              <p className="text-[11px] font-bold uppercase text-gray-500 dark:text-slate-400 mt-0.5">
                Match Percentage
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm text-center">
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                +{diffStats.added}
              </p>
              <p className="text-[11px] font-bold uppercase text-gray-500 dark:text-slate-400 mt-0.5">
                Added Lines
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm text-center">
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                -{diffStats.deleted}
              </p>
              <p className="text-[11px] font-bold uppercase text-gray-500 dark:text-slate-400 mt-0.5">
                Deleted Lines
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm text-center">
              <p className="text-2xl font-black text-gray-700 dark:text-slate-300">
                {diffStats.unchanged}
              </p>
              <p className="text-[11px] font-bold uppercase text-gray-500 dark:text-slate-400 mt-0.5">
                Identical Lines
              </p>
            </div>
          </div>
        )}

        {/* COMPARISON DISPLAY VIEW */}
        {fileA && fileB && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 mb-8">
            {compareMode === 'visual' ? (
              <div>
                {/* Visual sub-navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-slate-800 mb-6">
                  {/* Page Navigation */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      ← Previous Page
                    </button>
                    <span className="text-xs font-bold text-gray-800 dark:text-white">
                      Page {currentPage} of {maxPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(maxPages, p + 1))}
                      disabled={currentPage >= maxPages}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      Next Page →
                    </button>
                  </div>

                  {/* View sub-type switcher */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-slate-400">View:</span>
                    <button
                      onClick={() => setVisualViewType('side-by-side')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                        visualViewType === 'side-by-side'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                      }`}
                    >
                      Side by Side
                    </button>
                    <button
                      onClick={() => setVisualViewType('pixel-diff')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                        visualViewType === 'pixel-diff'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                          : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                      }`}
                    >
                      🔍 Pixel Difference Overlay
                    </button>
                  </div>
                </div>

                {/* Side-by-Side Canvases */}
                <div className={`grid ${visualViewType === 'side-by-side' ? 'grid-cols-1 md:grid-cols-2' : 'hidden'} gap-6`}>
                  <div>
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-2">
                      Original: {fileA.name} (Page {currentPage})
                    </p>
                    <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-2 bg-gray-50 dark:bg-slate-950 flex justify-center overflow-auto max-h-[650px]">
                      <canvas ref={canvasARef} className="max-w-full shadow-xs bg-white rounded" />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                      Modified: {fileB.name} (Page {currentPage})
                    </p>
                    <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-2 bg-gray-50 dark:bg-slate-950 flex justify-center overflow-auto max-h-[650px]">
                      <canvas ref={canvasBRef} className="max-w-full shadow-xs bg-white rounded" />
                    </div>
                  </div>
                </div>

                {/* Pixel Diff Overlay */}
                <div className={`${visualViewType === 'pixel-diff' ? 'block' : 'hidden'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      Pixel-by-Pixel Visual Heatmap (Page {currentPage})
                    </p>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                        Differences Highlighted
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />
                        Identical Content
                      </span>
                    </div>
                  </div>
                  <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-4 bg-gray-900 flex justify-center overflow-auto max-h-[700px]">
                    <canvas ref={canvasDiffRef} className="max-w-full shadow-md rounded" />
                  </div>
                </div>
              </div>
            ) : (
              /* Text Difference Mode */
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                      Added in B
                    </span>
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                      <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                      Removed from A
                    </span>
                    <span className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                      <span className="w-2.5 h-2.5 rounded bg-gray-200 dark:bg-slate-700" />
                      Unchanged
                    </span>
                  </div>

                  <button
                    onClick={copyDiffSummary}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {copied ? '✅ Copied' : '📋 Copy Diff Log'}
                  </button>
                </div>

                {diffLines.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 dark:text-slate-500 text-xs">
                    Click &quot;Compare Documents&quot; above to extract text and analyze line differences.
                  </div>
                ) : (
                  <div className="font-mono text-xs max-h-[600px] overflow-y-auto border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 divide-y divide-gray-100 dark:divide-slate-900">
                    {diffLines.map((line, idx) => {
                      if (line.type === 'added') {
                        return (
                          <div
                            key={idx}
                            className="flex items-start bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 px-4 py-1.5 font-medium"
                          >
                            <span className="w-8 select-none text-emerald-500 text-right pr-3 font-bold">+</span>
                            <span className="w-12 select-none text-emerald-400 text-right pr-4 text-[10px] opacity-70">
                              {line.lineNumB ? `L${line.lineNumB}` : ''}
                            </span>
                            <span className="flex-1 break-words">{line.text}</span>
                          </div>
                        );
                      } else if (line.type === 'removed') {
                        return (
                          <div
                            key={idx}
                            className="flex items-start bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 px-4 py-1.5 line-through opacity-80"
                          >
                            <span className="w-8 select-none text-rose-500 text-right pr-3 font-bold">-</span>
                            <span className="w-12 select-none text-rose-400 text-right pr-4 text-[10px] opacity-70">
                              {line.lineNumA ? `L${line.lineNumA}` : ''}
                            </span>
                            <span className="flex-1 break-words">{line.text}</span>
                          </div>
                        );
                      } else {
                        return (
                          <div
                            key={idx}
                            className="flex items-start text-gray-600 dark:text-slate-400 px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-900/50"
                          >
                            <span className="w-8 select-none text-gray-300 dark:text-slate-700 text-right pr-3">·</span>
                            <span className="w-12 select-none text-gray-400 dark:text-slate-600 text-right pr-4 text-[10px]">
                              {line.lineNumA ? `L${line.lineNumA}` : ''}
                            </span>
                            <span className="flex-1 break-words">{line.text}</span>
                          </div>
                        );
                      }
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* How to Use Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use Compare PDF
          </h2>
          <ol className="list-decimal pl-5 space-y-2.5 text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            <li>
              Upload your <strong>Original PDF (Document A)</strong> on the left, and your <strong>Modified PDF (Document B)</strong> on the right.
            </li>
            <li>
              Click <strong>&quot;Compare Documents&quot;</strong> to parse text structures and render visual page layouts client-side.
            </li>
            <li>
              Switch between <strong>&quot;Visual Side-by-Side&quot;</strong> (with synchronous page navigation and a pixel-difference heatmap overlay) and <strong>&quot;Text Difference Mode&quot;</strong>.
            </li>
            <li>
              Inspect the highlighted modifications: added lines appear in green, while deleted lines appear in red with strikethrough.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
