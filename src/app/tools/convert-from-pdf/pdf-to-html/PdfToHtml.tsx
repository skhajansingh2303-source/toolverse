'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

interface ConvertedPage {
  pageNumber: number;
  htmlContent: string;
  width: number;
  height: number;
}

export default function PdfToHtml() {
  const [file, setFile] = useState<File | null>(null);
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'split'>('split');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [outputMode, setOutputMode] = useState<'semantic' | 'exact'>('semantic');
  const [pdfjsLoaded, setPdfjsLoaded] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

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
      setHtmlCode('');
      setCopied(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const convertPdfToHtml = async () => {
    if (!file || !(window as any).pdfjsLib) return;
    setIsProcessing(true);
    setHtmlCode('');
    setCopied(false);

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await (window as any).pdfjsLib.getDocument({ data: buffer }).promise;
      const numPages = pdf.numPages;
      setProgress({ current: 0, total: numPages });

      const pagesData: ConvertedPage[] = [];
      const docTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      // Collect font sizes across document to determine baseline
      const fontSizes: number[] = [];
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        textContent.items.forEach((it: any) => {
          if (it.str && it.str.trim()) {
            const size = Math.abs(it.transform[0]) || Math.abs(it.transform[3]) || 12;
            fontSizes.push(size);
          }
        });
      }
      fontSizes.sort((a, b) => a - b);
      const medianFontSize = fontSizes.length > 0 ? fontSizes[Math.floor(fontSizes.length / 2)] : 12;

      for (let pNum = 1; pNum <= numPages; pNum++) {
        const page = await pdf.getPage(pNum);
        const viewport = page.getViewport({ scale: 1.0 });
        const textContent = await page.getTextContent();

        // Group items into lines
        const lineBuckets: { [yKey: number]: any[] } = {};
        const rawItems = textContent.items as any[];

        rawItems.forEach((item) => {
          if (!item.str || !item.str.trim()) return;
          const y = item.transform[5];
          let matchedKey: number | null = null;
          for (const k of Object.keys(lineBuckets)) {
            const numK = parseFloat(k);
            if (Math.abs(numK - y) <= 4.0) {
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

        const sortedY = Object.keys(lineBuckets)
          .map((k) => parseFloat(k))
          .sort((a, b) => b - a);

        let pageHtml = `<section class="pdf-page" id="page-${pNum}" data-page="${pNum}">\n`;
        pageHtml += `  <div class="page-badge">Page ${pNum}</div>\n`;

        sortedY.forEach((y) => {
          const items = lineBuckets[y];
          items.sort((a, b) => a.transform[4] - b.transform[4]);

          let lineText = '';
          let maxFontSize = 0;
          let isBold = false;
          let isMono = false;

          items.forEach((it, idx) => {
            const fontHeight = Math.abs(it.transform[0]) || Math.abs(it.transform[3]) || 12;
            if (fontHeight > maxFontSize) maxFontSize = fontHeight;

            const fn = (it.fontName || '').toLowerCase();
            if (fn.includes('bold') || fn.includes('black') || fn.includes('heavy') || fn.includes('700')) {
              isBold = true;
            }
            if (fn.includes('mono') || fn.includes('courier') || fn.includes('code') || fn.includes('consolas')) {
              isMono = true;
            }

            if (idx > 0) {
              const prev = items[idx - 1];
              const prevRight = prev.transform[4] + (prev.width || 0);
              if (it.transform[4] - prevRight > 3) {
                lineText += ' ';
              }
            }
            lineText += it.str;
          });

          const cleanText = lineText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

          if (!cleanText.trim()) return;

          // Check for Table formatting (2+ columns)
          const cols = cleanText.split(/\s{2,}|\t/);
          if (cols.length >= 2 && cleanText.length > 10) {
            pageHtml += `  <div class="table-row">\n`;
            cols.forEach((col) => {
              pageHtml += `    <span class="table-cell">${col.trim()}</span>\n`;
            });
            pageHtml += `  </div>\n`;
            return;
          }

          // Monospace code
          if (isMono) {
            pageHtml += `  <pre class="code-block"><code>${cleanText}</code></pre>\n`;
            return;
          }

          // Headings
          if (maxFontSize >= medianFontSize * 1.55) {
            pageHtml += `  <h1 class="pdf-h1">${cleanText}</h1>\n`;
          } else if (maxFontSize >= medianFontSize * 1.28) {
            pageHtml += `  <h2 class="pdf-h2">${cleanText}</h2>\n`;
          } else if ((maxFontSize >= medianFontSize * 1.12 || isBold) && cleanText.length < 80) {
            pageHtml += `  <h3 class="pdf-h3">${cleanText}</h3>\n`;
          } else if (cleanText.startsWith('•') || cleanText.startsWith('-') || cleanText.startsWith('*')) {
            pageHtml += `  <ul class="pdf-list"><li>${cleanText.replace(/^[-•*]\s*/, '')}</li></ul>\n`;
          } else {
            pageHtml += `  <p class="pdf-p">${cleanText}</p>\n`;
          }
        });

        pageHtml += `</section>\n`;
        pagesData.push({
          pageNumber: pNum,
          htmlContent: pageHtml,
          width: viewport.width,
          height: viewport.height,
        });

        setProgress({ current: pNum, total: numPages });
      }

      // Assemble complete, responsive HTML5 document with styled typography & CSS
      const fullDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docTitle}</title>
  <style>
    :root {
      --primary: #4f46e5;
      --primary-light: #eef2ff;
      --bg-page: #f8fafc;
      --bg-card: #ffffff;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --border-color: #e2e8f0;
      --radius: 12px;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg-page: #0f172a;
        --bg-card: #1e293b;
        --text-main: #f1f5f9;
        --text-muted: #94a3b8;
        --border-color: #334155;
      }
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-page);
      color: var(--text-main);
      line-height: 1.65;
      padding: 32px 16px;
    }
    .document-container {
      max-width: 820px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    .pdf-page {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 40px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      position: relative;
    }
    .page-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--primary);
      background: var(--primary-light);
      padding: 3px 10px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .pdf-h1 {
      font-size: 26px;
      font-weight: 800;
      color: var(--primary);
      margin-top: 16px;
      margin-bottom: 12px;
      line-height: 1.25;
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 8px;
    }
    .pdf-h2 {
      font-size: 20px;
      font-weight: 700;
      margin-top: 20px;
      margin-bottom: 10px;
      line-height: 1.3;
    }
    .pdf-h3 {
      font-size: 16px;
      font-weight: 600;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    .pdf-p {
      font-size: 15px;
      margin-bottom: 12px;
      color: var(--text-main);
    }
    .pdf-list {
      margin-left: 24px;
      margin-bottom: 12px;
      font-size: 15px;
    }
    .pdf-list li {
      margin-bottom: 4px;
    }
    .code-block {
      background: #0f172a;
      color: #38bdf8;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      padding: 14px 18px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 14px 0;
    }
    .table-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding: 8px 12px;
      background: var(--bg-page);
      border-radius: 6px;
      margin-bottom: 6px;
      font-size: 14px;
      border: 1px solid var(--border-color);
    }
    .table-cell {
      flex: 1;
      min-width: 120px;
    }
    footer.doc-footer {
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <main class="document-container">
${pagesData.map((p) => p.htmlContent).join('\n')}
    <footer class="doc-footer">
      Generated with ToolsVerse PDF to HTML5 Transpiler
    </footer>
  </main>
</body>
</html>`;

      setHtmlCode(fullDocument);
      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `Converted ${numPages} PDF pages into responsive HTML5!` },
        })
      );
    } catch (err) {
      console.error('Error converting PDF to HTML:', err);
      alert('Could not convert PDF to HTML. Please ensure the document contains readable text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyHtml = () => {
    if (!htmlCode) return;
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    window.dispatchEvent(
      new CustomEvent('toolsverse-toast', {
        detail: { message: 'HTML source code copied to clipboard!' },
      })
    );
  };

  const downloadHtmlFile = () => {
    if (!htmlCode) return;
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document';
    a.download = `${baseName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadZipPackage = async () => {
    if (!htmlCode) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document_webpage';
      const folder = zip.folder(baseName) || zip;

      folder.file('index.html', htmlCode);
      folder.file(
        'README.md',
        `# ${baseName}\n\nConverted from PDF using ToolsVerse PDF to HTML5.\nOpen \`index.html\` in any web browser or deploy directly to Netlify, Vercel, or GitHub Pages.`
      );

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_html_bundle.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: 'HTML ZIP package downloaded successfully!' },
        })
      );
    } catch (e) {
      console.error('Error creating ZIP:', e);
    } finally {
      setIsZipping(false);
    }
  };

  const viewportWidthClass = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  }[previewViewport];

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
          <span className="text-gray-800 dark:text-gray-200 font-medium">PDF to HTML</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            PDF to HTML Responsive Webpage Converter
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Convert multi-page PDF documents into modern, responsive HTML5 pages with clean typography, styled headers, and dark-mode ready CSS.
          </p>
        </div>

        {/* Dropzone */}
        {!htmlCode && (
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Upload PDF to Convert to HTML5
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Generates clean standalone HTML files ready to publish or embed into websites.
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
                    <span className="text-xs text-gray-500 dark:text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={convertPdfToHtml}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Convert to HTML5
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Conversion Workspace */}
        {htmlCode && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
              {/* Tab Switcher & Viewport Switcher */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('split')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === 'split'
                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Split View
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === 'preview'
                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Live Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === 'code'
                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    HTML Source
                  </button>
                </div>

                {/* Viewport Width Emulation */}
                {(activeTab === 'preview' || activeTab === 'split') && (
                  <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
                    <button
                      onClick={() => setPreviewViewport('desktop')}
                      className={`p-1.5 rounded-lg ${
                        previewViewport === 'desktop'
                          ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-xs'
                          : 'text-gray-500'
                      }`}
                      title="Desktop Viewport"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setPreviewViewport('tablet')}
                      className={`p-1.5 rounded-lg ${
                        previewViewport === 'tablet'
                          ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-xs'
                          : 'text-gray-500'
                      }`}
                      title="Tablet Viewport (768px)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setPreviewViewport('mobile')}
                      className={`p-1.5 rounded-lg ${
                        previewViewport === 'mobile'
                          ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-xs'
                          : 'text-gray-500'
                      }`}
                      title="Mobile Viewport (375px)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={copyHtml}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {copied ? 'Copied!' : 'Copy HTML'}
                </button>

                <button
                  onClick={downloadHtmlFile}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download .html
                </button>

                <button
                  onClick={downloadZipPackage}
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
                      Download ZIP Package
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setHtmlCode('');
                    setFile(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors"
                >
                  New Conversion
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div
              className={`grid gap-4 ${
                activeTab === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {/* Preview Frame */}
              {(activeTab === 'split' || activeTab === 'preview') && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-[700px]">
                  <div className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span>Rendered Webpage Container</span>
                    <span className="text-[11px] text-gray-400 dark:text-slate-400">Viewport: {previewViewport}</span>
                  </div>

                  <div className="flex-1 bg-gray-200/60 dark:bg-slate-950 p-4 overflow-auto flex justify-center items-start">
                    <iframe
                      ref={iframeRef}
                      srcDoc={htmlCode}
                      title="Converted HTML Webpage Preview"
                      sandbox="allow-same-origin"
                      className={`bg-white rounded-xl shadow-md h-full transition-all border border-gray-300 dark:border-slate-800 ${viewportWidthClass}`}
                    />
                  </div>
                </div>
              )}

              {/* HTML Code Editor */}
              {(activeTab === 'split' || activeTab === 'code') && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-[700px]">
                  <div className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span>HTML5 Source Code</span>
                    <span className="font-mono text-[11px] text-gray-400 dark:text-slate-400">
                      {(htmlCode.length / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <textarea
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    className="flex-1 w-full p-4 font-mono text-xs leading-relaxed bg-transparent text-gray-900 dark:text-gray-100 resize-none focus:outline-none"
                    spellCheck={false}
                  />
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
            How to Convert PDF to HTML5
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                1
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Upload PDF</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select your document. All font metrics and text elements are extracted client-side with complete privacy.
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                2
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Preview & Test Viewports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Inspect your generated webpage with live Desktop, Tablet, and Mobile device frames. Adjust code directly in the integrated HTML editor.
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                3
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Export or Download ZIP</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                1-click &quot;Copy HTML&quot;, download the single .html file, or download the full ZIP bundle containing your website package.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
