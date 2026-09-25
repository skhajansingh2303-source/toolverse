'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import AdSlot from '@/components/AdSlot';

interface ExtractedLine {
  text: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isMono: boolean;
  y: number;
  items: { str: string; x: number; width: number }[];
}

export default function PdfToMarkdown() {
  const [file, setFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [copied, setCopied] = useState<boolean>(false);
  const [viewTab, setViewTab] = useState<'split' | 'raw' | 'preview'>('split');
  const [pdfjsLoaded, setPdfjsLoaded] = useState<boolean>(false);

  // Formatting toggles
  const [detectHeadings, setDetectHeadings] = useState<boolean>(true);
  const [detectTables, setDetectTables] = useState<boolean>(true);
  const [detectLists, setDetectLists] = useState<boolean>(true);
  const [insertPageDividers, setInsertPageDividers] = useState<boolean>(true);
  const [cleanHyphens, setCleanHyphens] = useState<boolean>(true);

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
      setMarkdown('');
      setCopied(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const convertPdfToMarkdown = async () => {
    if (!file || !(window as any).pdfjsLib) return;
    setIsProcessing(true);
    setMarkdown('');
    setCopied(false);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setProgress({ current: 0, total: numPages });

      // First pass: collect all font sizes across all pages to determine baseline/body font size
      const allFontSizes: number[] = [];
      const pageLineCollections: ExtractedLine[][] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });

        // Group text items by Y coordinate with a tolerance of 3.5px
        const rawItems = textContent.items as any[];
        const lineBuckets: { [yKey: number]: any[] } = {};

        rawItems.forEach((item) => {
          if (!item.str || item.str.trim() === '') return;
          const fontHeight = Math.abs(item.transform[0]) || Math.abs(item.transform[3]) || 12;
          allFontSizes.push(fontHeight);

          // Find existing bucket within 3.5px
          const y = item.transform[5];
          let matchedKey: number | null = null;
          for (const k of Object.keys(lineBuckets)) {
            const numK = parseFloat(k);
            if (Math.abs(numK - y) <= 3.5) {
              matchedKey = numK;
              break;
            }
          }

          if (matchedKey !== null) {
            lineBuckets[matchedKey].push(item);
          } else {
            lineBuckets[y] = [item];
          }
        });

        // Sort lines from top of page to bottom (descending Y in PDF coordinates)
        const sortedY = Object.keys(lineBuckets)
          .map((k) => parseFloat(k))
          .sort((a, b) => b - a);

        const pageLines: ExtractedLine[] = [];

        sortedY.forEach((y) => {
          const items = lineBuckets[y];
          // Sort items from left to right
          items.sort((a, b) => a.transform[4] - b.transform[4]);

          let lineText = '';
          let maxFontSize = 0;
          let isBold = false;
          let isItalic = false;
          let isMono = false;

          const itemPositions: { str: string; x: number; width: number }[] = [];

          items.forEach((it, idx) => {
            const fontHeight = Math.abs(it.transform[0]) || Math.abs(it.transform[3]) || 12;
            if (fontHeight > maxFontSize) maxFontSize = fontHeight;

            const fn = (it.fontName || '').toLowerCase();
            if (fn.includes('bold') || fn.includes('black') || fn.includes('heavy') || fn.includes('700')) {
              isBold = true;
            }
            if (fn.includes('italic') || fn.includes('oblique')) {
              isItalic = true;
            }
            if (fn.includes('courier') || fn.includes('mono') || fn.includes('consolas') || fn.includes('code')) {
              isMono = true;
            }

            // Check if there is a gap indicating spaces between items
            if (idx > 0) {
              const prev = items[idx - 1];
              const prevRight = prev.transform[4] + (prev.width || 0);
              const currLeft = it.transform[4];
              if (currLeft - prevRight > 3) {
                lineText += ' ';
              }
            }
            lineText += it.str;
            itemPositions.push({ str: it.str, x: it.transform[4], width: it.width || 0 });
          });

          pageLines.push({
            text: lineText.trim(),
            fontSize: maxFontSize,
            isBold,
            isItalic,
            isMono,
            y,
            items: itemPositions,
          });
        });

        pageLineCollections.push(pageLines);
      }

      // Calculate baseline body font size (median)
      allFontSizes.sort((a, b) => a - b);
      const medianFontSize = allFontSizes.length > 0 ? allFontSizes[Math.floor(allFontSizes.length / 2)] : 12;

      // Second pass: structure parsing to Markdown
      let compiledMarkdown = '';

      for (let pIdx = 0; pIdx < pageLineCollections.length; pIdx++) {
        const pageNum = pIdx + 1;
        const lines = pageLineCollections[pIdx];

        if (insertPageDividers && pIdx > 0) {
          compiledMarkdown += `\n\n---\n\n`;
        }

        let inCodeBlock = false;
        let tableBuffer: ExtractedLine[] = [];

        const flushTableBuffer = () => {
          if (tableBuffer.length < 2) {
            tableBuffer.forEach((l) => {
              compiledMarkdown += l.text + '\n\n';
            });
            tableBuffer = [];
            return;
          }

          // Process table rows: determine columns
          const rowsCols = tableBuffer.map((l) => {
            // Split by 2+ spaces or item gaps
            const parts = l.text.split(/\s{2,}|\t/);
            return parts.filter((p) => p.trim().length > 0);
          });

          const maxCols = Math.max(...rowsCols.map((r) => r.length));
          if (maxCols >= 2) {
            // Valid table
            rowsCols.forEach((row, rIdx) => {
              const padded = [...row];
              while (padded.length < maxCols) padded.push('');
              compiledMarkdown += '| ' + padded.join(' | ') + ' |\n';
              if (rIdx === 0) {
                compiledMarkdown += '| ' + Array(maxCols).fill('---').join(' | ') + ' |\n';
              }
            });
            compiledMarkdown += '\n';
          } else {
            tableBuffer.forEach((l) => {
              compiledMarkdown += l.text + '\n\n';
            });
          }
          tableBuffer = [];
        };

        for (let lIdx = 0; lIdx < lines.length; lIdx++) {
          const line = lines[lIdx];
          const text = line.text;

          if (!text) continue;

          // Check if line looks like part of a table
          const parts = text.split(/\s{2,}|\t/);
          const isPotentialTableRow = detectTables && parts.length >= 2 && text.length > 5;

          if (isPotentialTableRow) {
            tableBuffer.push(line);
            continue;
          } else {
            if (tableBuffer.length > 0) {
              flushTableBuffer();
            }
          }

          // Monospace Code Blocks
          if (line.isMono) {
            if (!inCodeBlock) {
              compiledMarkdown += '```text\n';
              inCodeBlock = true;
            }
            compiledMarkdown += text + '\n';
            continue;
          } else {
            if (inCodeBlock) {
              compiledMarkdown += '```\n\n';
              inCodeBlock = false;
            }
          }

          // Heading Detection based on font size & weights
          if (detectHeadings) {
            if (line.fontSize >= medianFontSize * 1.55) {
              compiledMarkdown += `# ${text}\n\n`;
              continue;
            } else if (line.fontSize >= medianFontSize * 1.28) {
              compiledMarkdown += `## ${text}\n\n`;
              continue;
            } else if (
              (line.fontSize >= medianFontSize * 1.12 || line.isBold) &&
              text.length < 85 &&
              !text.endsWith('.') &&
              !text.startsWith('-')
            ) {
              compiledMarkdown += `### ${text}\n\n`;
              continue;
            }
          }

          // Bullet and Numbered Lists
          if (detectLists) {
            const bulletMatch = text.match(/^([•\*\-–\u2022\u25cf\u25cb\u25a0])\s+(.*)/);
            if (bulletMatch) {
              compiledMarkdown += `- ${bulletMatch[2]}\n`;
              continue;
            }

            const numberedMatch = text.match(/^(\d+[\.\)])\s+(.*)/);
            if (numberedMatch) {
              compiledMarkdown += `${numberedMatch[1]} ${numberedMatch[2]}\n`;
              continue;
            }
          }

          // Blockquote (starts with > or citation)
          if (text.startsWith('>') || text.toLowerCase().startsWith('note:') || text.toLowerCase().startsWith('tip:')) {
            compiledMarkdown += `> ${text.replace(/^>\s*/, '')}\n\n`;
            continue;
          }

          // Regular Paragraph
          let processedText = text;
          if (cleanHyphens && processedText.endsWith('-')) {
            processedText = processedText.slice(0, -1);
          }

          compiledMarkdown += `${processedText}\n\n`;
        }

        if (tableBuffer.length > 0) {
          flushTableBuffer();
        }
        if (inCodeBlock) {
          compiledMarkdown += '```\n\n';
          inCodeBlock = false;
        }

        setProgress({ current: pageNum, total: numPages });
      }

      // Cleanup excess blank lines
      const cleanMd = compiledMarkdown
        .replace(/\n{4,}/g, '\n\n')
        .trim();

      setMarkdown(cleanMd);
      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `Converted ${numPages} PDF pages to Markdown successfully!` },
        })
      );
    } catch (err) {
      console.error('Error during Markdown extraction:', err);
      alert('Could not convert this PDF. Please check if the PDF contains selectable text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    window.dispatchEvent(
      new CustomEvent('toolsverse-toast', {
        detail: { message: 'Markdown copied to clipboard!' },
      })
    );
  };

  const downloadMarkdownFile = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document';
    a.download = `${baseName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const wordCount = markdown ? markdown.trim().split(/\s+/).filter(Boolean).length : 0;
  const lineCount = markdown ? markdown.split('\n').length : 0;
  const charCount = markdown.length;

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
          <span className="text-gray-800 dark:text-gray-200 font-medium">PDF to Markdown</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            PDF to Markdown (.md) Converter
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Extract clean, structured Markdown text from PDF documents. Intelligently reconstructs headers, bullet lists, markdown tables, blockquotes, and code snippets.
          </p>
        </div>

        {/* Dropzone */}
        {!markdown && (
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Upload PDF to Convert to Markdown
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Extracts text, preserves document structure, and generates formatted .md code.
                </p>
                <span className="inline-flex items-center px-6 py-3 rounded-xl bg-primary-600 group-hover:bg-primary-700 text-white font-semibold shadow-md transition-all">
                  Browse Files
                </span>
              </div>
            </div>

            {file && (
              <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white block">{file.name}</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                <button
                  onClick={convertPdfToMarkdown}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Converting Page {progress.current}/{progress.total}...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      Extract to Markdown
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Smart Detection Options */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                Layout Analysis Options
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={detectHeadings}
                    onChange={(e) => setDetectHeadings(e.target.checked)}
                    className="rounded text-primary-600"
                  />
                  <span>Detect Headings (#)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={detectLists}
                    onChange={(e) => setDetectLists(e.target.checked)}
                    className="rounded text-primary-600"
                  />
                  <span>Detect Bullet Lists (-)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={detectTables}
                    onChange={(e) => setDetectTables(e.target.checked)}
                    className="rounded text-primary-600"
                  />
                  <span>Detect Tables (|)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={insertPageDividers}
                    onChange={(e) => setInsertPageDividers(e.target.checked)}
                    className="rounded text-primary-600"
                  />
                  <span>Page Separators (---)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={cleanHyphens}
                    onChange={(e) => setCleanHyphens(e.target.checked)}
                    className="rounded text-primary-600"
                  />
                  <span>Clean Line Breaks</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Markdown Output Workspace */}
        {markdown && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                {/* View switcher tabs */}
                <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-semibold">
                  <button
                    onClick={() => setViewTab('split')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      viewTab === 'split'
                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Split View
                  </button>
                  <button
                    onClick={() => setViewTab('raw')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      viewTab === 'raw'
                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Raw Markdown
                  </button>
                  <button
                    onClick={() => setViewTab('preview')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      viewTab === 'preview'
                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Rendered Preview
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span>{lineCount} lines</span>
                  <span>•</span>
                  <span>{charCount} chars</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {copied ? 'Copied!' : 'Copy Markdown'}
                </button>

                <button
                  onClick={downloadMarkdownFile}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download .md
                </button>

                <button
                  onClick={() => {
                    setMarkdown('');
                    setFile(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors"
                >
                  Convert Another
                </button>
              </div>
            </div>

            {/* Split / Unified View Container */}
            <div
              className={`grid gap-4 ${
                viewTab === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {/* Left Pane: Raw Markdown Editor */}
              {(viewTab === 'split' || viewTab === 'raw') && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-[650px]">
                  <div className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Raw Markdown Code</span>
                    <span className="text-[11px] font-mono text-gray-400 dark:text-slate-400">Editable</span>
                  </div>
                  <textarea
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    className="flex-1 w-full p-4 font-mono text-xs leading-relaxed bg-transparent text-gray-900 dark:text-gray-100 resize-none focus:outline-none"
                    placeholder="Markdown content will appear here..."
                  />
                </div>
              )}

              {/* Right Pane: Rendered Preview */}
              {(viewTab === 'split' || viewTab === 'preview') && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-[650px]">
                  <div className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Rendered Markdown Preview
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-gray-800 dark:text-gray-200">
                    <MarkdownPreviewRenderer content={markdown} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ad Slot */}
        <AdSlot format="horizontal" />

        {/* How to Use Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Convert PDF to Markdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                1
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Select PDF File</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload your document to convert. Adjust structural analysis toggles like headings, tables, and bullet lists as desired.
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                2
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Automatic Layout Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our parser analyzes font sizes, weights, and spatial coordinates to accurately reconstruct headers (#, ##), tables, lists, and code blocks.
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                3
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Copy or Download</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Inspect side-by-side with live formatted rendering. 1-click &quot;Copy Markdown&quot; or download the clean .md file for GitHub, Obsidian, or Notion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Lightweight, pure React Markdown Preview Renderer without external libraries
function MarkdownPreviewRenderer({ content }: { content: string }) {
  if (!content) return <p className="text-gray-400 dark:text-slate-400 italic">No markdown generated yet.</p>;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];
  let tableBuffer: string[] = [];

  const flushTable = (keyIndex: number) => {
    if (tableBuffer.length === 0) return null;
    const headerRow = tableBuffer[0];
    const dataRows = tableBuffer.slice(2); // Skip separator line

    const parseCells = (r: string) =>
      r
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

    const headers = parseCells(headerRow);

    const el = (
      <div key={`table-${keyIndex}`} className="overflow-x-auto my-4">
        <table className="min-w-full text-xs border border-gray-200 dark:border-slate-700 divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-100 dark:bg-slate-800">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-bold text-gray-800 dark:text-gray-200">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {dataRows.map((rowStr, rIdx) => {
              const cells = parseCells(rowStr);
              return (
                <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  {cells.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-1.5 text-gray-700 dark:text-gray-300">
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
    return el;
  };

  lines.forEach((line, idx) => {
    // Code block toggle
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeBuffer = [];
      } else {
        inCode = false;
        elements.push(
          <pre
            key={`code-${idx}`}
            className="p-3 bg-gray-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto my-3"
          >
            {codeBuffer.join('\n')}
          </pre>
        );
        codeBuffer = [];
      }
      return;
    }

    if (inCode) {
      codeBuffer.push(line);
      return;
    }

    // Markdown Table line
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      tableBuffer.push(line.trim());
      return;
    } else if (tableBuffer.length > 0) {
      const tableEl = flushTable(idx);
      if (tableEl) elements.push(tableEl);
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={idx} className="text-2xl font-extrabold text-gray-900 dark:text-white border-b pb-1 mt-4 mb-2">
          {line.replace(/^#\s+/, '')}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={idx} className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b pb-1 mt-3 mb-2">
          {line.replace(/^##\s+/, '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-2 mb-1">
          {line.replace(/^###\s+/, '')}
        </h3>
      );
    } else if (line.startsWith('---')) {
      elements.push(<hr key={idx} className="my-4 border-gray-300 dark:border-slate-700" />);
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={idx}
          className="border-l-4 border-primary-500 pl-4 py-1 italic text-gray-600 dark:text-gray-400 my-2"
        >
          {line.replace(/^>\s+/, '')}
        </blockquote>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={idx} className="ml-5 list-disc text-gray-700 dark:text-gray-300 my-0.5">
          {line.replace(/^[-*]\s+/, '')}
        </li>
      );
    } else if (/^\d+\.\s+/.test(line)) {
      elements.push(
        <li key={idx} className="ml-5 list-decimal text-gray-700 dark:text-gray-300 my-0.5">
          {line.replace(/^\d+\.\s+/, '')}
        </li>
      );
    } else if (line.trim() !== '') {
      elements.push(
        <p key={idx} className="text-gray-700 dark:text-gray-300 my-1.5 leading-relaxed">
          {line}
        </p>
      );
    }
  });

  if (tableBuffer.length > 0) {
    const tableEl = flushTable(lines.length);
    if (tableEl) elements.push(tableEl);
  }

  return <div className="space-y-1">{elements}</div>;
}
