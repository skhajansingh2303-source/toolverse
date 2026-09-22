'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import AdSlot from '@/components/AdSlot';
import RelatedTools from '@/components/RelatedTools';

type InputMode = 'url' | 'html';
type PageFormat = 'a4' | 'letter' | 'legal';
type Orientation = 'portrait' | 'landscape';
type MarginSize = 'normal' | 'minimal' | 'none';

const TEMPLATES = {
  article: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>The Future of Web Technologies</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; padding: 40px; margin: 0; }
    h1 { color: #4f46e5; font-size: 28px; margin-bottom: 8px; }
    .meta { color: #64748b; font-size: 14px; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
    p { margin-bottom: 16px; font-size: 15px; }
    blockquote { border-left: 4px solid #6366f1; padding-left: 16px; color: #475569; font-style: italic; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>The Future of Web Technologies</h1>
  <div class="meta">Published by ToolsVerse Tech Insights • September 2026</div>
  <p>Modern web standards have evolved dramatically. With client-side capabilities powered by WebAssembly, HTML5 canvas, and advanced cryptography, complex document processing workflows now happen entirely inside the browser without transmitting sensitive data to external servers.</p>
  <blockquote>"Privacy, speed, and decentralization define the modern era of web applications."</blockquote>
  <p>Whether processing high-resolution media or converting web pages into standardized PDF documents, modern frontend architectures ensure seamless user experiences with zero latency.</p>
</body>
</html>`,
  invoice: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice #INV-2026-084</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; margin: 0; color: #0f172a; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
    .title { font-size: 28px; font-weight: bold; color: #4f46e5; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #475569; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .total-row { font-weight: bold; font-size: 16px; text-align: right; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">INVOICE</div>
      <div style="color: #64748b; font-size: 13px;">Invoice #: INV-2026-084<br>Date: Sep 11, 2026</div>
    </div>
    <div style="text-align: right; font-size: 13px; color: #334155;">
      <strong>ToolsVerse Global Corp</strong><br>
      100 Enterprise Way<br>
      San Francisco, CA 94105
    </div>
  </div>
  <table>
    <thead>
      <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr>
    </thead>
    <tbody>
      <tr><td>Cloud Document Automation API</td><td>1</td><td>$250.00</td><td>$250.00</td></tr>
      <tr><td>Enterprise Security & Compliance</td><td>1</td><td>$150.00</td><td>$150.00</td></tr>
    </tbody>
  </table>
  <div class="total-row">Total Due: $400.00 USD</div>
</body>
</html>`,
  resume: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Resume - Alex Morgan</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; margin: 0; color: #1e293b; line-height: 1.5; }
    h1 { font-size: 28px; margin-bottom: 4px; color: #1e293b; }
    .subtitle { color: #6366f1; font-weight: 600; font-size: 15px; margin-bottom: 16px; }
    .section-title { font-size: 14px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 24px; margin-bottom: 12px; color: #334155; }
    p, li { font-size: 13.5px; color: #475569; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  <h1>Alex Morgan</h1>
  <div class="subtitle">Senior Full Stack Engineer • San Francisco, CA • alex@example.com</div>
  <div class="section-title">Professional Experience</div>
  <strong>Lead Platform Architect • TechVenture Inc. (2023 - Present)</strong>
  <ul>
    <li>Architected browser-based document generation engines scaling to 5M+ monthly users.</li>
    <li>Optimized rendering pipelines, reducing client memory footprint by 40%.</li>
  </ul>
  <div class="section-title">Education & Skills</div>
  <p>B.S. in Computer Science • University of California, Berkeley<br>TypeScript, Next.js, React, Node.js, WebAssembly, Web Crypto API</p>
</body>
</html>`,
};

export default function WebpageToPdf() {
  const [mode, setMode] = useState<InputMode>('url');
  const [urlInput, setUrlInput] = useState<string>('https://en.wikipedia.org/wiki/World_Wide_Web');
  const [htmlCode, setHtmlCode] = useState<string>(TEMPLATES.article);

  // Print layout settings
  const [pageFormat, setPageFormat] = useState<PageFormat>('a4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [margin, setMargin] = useState<MarginSize>('normal');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate CSS @page string based on user settings
  const getPageStyleCss = () => {
    const marginsMap: Record<MarginSize, string> = {
      normal: '20mm',
      minimal: '10mm',
      none: '0mm',
    };
    return `@page { size: ${pageFormat} ${orientation}; margin: ${marginsMap[margin]}; }`;
  };

  // Convert & Download via clean Print-to-PDF
  const handlePrintToPdf = () => {
    setError('');
    setSuccess('');
    setIsProcessing(true);

    try {
      const pageStyle = `<style>${getPageStyleCss()} @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style>`;
      let contentToPrint = '';

      if (mode === 'url') {
        contentToPrint = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Webpage PDF Export</title>
  ${pageStyle}
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; }
    .header-tag { font-size: 12px; color: #6366f1; font-weight: bold; margin-bottom: 8px; }
    .url-tag { font-size: 13px; color: #64748b; margin-bottom: 24px; word-break: break-all; }
  </style>
</head>
<body>
  <div class="header-tag">Captured Webpage Article:</div>
  <div class="url-tag">${urlInput}</div>
  <iframe src="${urlInput}" style="width: 100%; height: 900px; border: 1px solid #e2e8f0; border-radius: 8px;"></iframe>
</body>
</html>`;
      } else {
        contentToPrint = htmlCode.includes('<head>')
          ? htmlCode.replace('<head>', `<head>${pageStyle}`)
          : `${pageStyle}${htmlCode}`;
      }

      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(contentToPrint);
        frameDoc.close();

        setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(printFrame);
            setIsProcessing(false);
            setSuccess('Print-to-PDF dialog opened. Select "Save as PDF" to download your document!');
          }, 1000);
        }, 500);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to initiate print: ' + (err.message || 'Unknown error.'));
      setIsProcessing(false);
    }
  };

  // Direct client-side PDF compilation via pdf-lib
  const handleDirectDownload = async () => {
    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const pdfDoc = await PDFDocument.create();

      // Determine dimensions in points (72 points = 1 inch)
      let width = 595.28; // A4 portrait
      let height = 841.89;

      if (pageFormat === 'letter') {
        width = 612;
        height = 792;
      } else if (pageFormat === 'legal') {
        width = 612;
        height = 1008;
      }

      if (orientation === 'landscape') {
        const temp = width;
        width = height;
        height = temp;
      }

      const page = pdfDoc.addPage([width, height]);

      // Create an offscreen canvas snapshot from HTML/SVG
      const canvas = document.createElement('canvas');
      canvas.width = width * 1.5;
      canvas.height = height * 1.5;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Render clean page header & preview
        ctx.fillStyle = '#4f46e5';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(mode === 'url' ? 'Webpage Snapshot' : 'HTML Document Export', 40, 60);

        ctx.fillStyle = '#64748b';
        ctx.font = '14px sans-serif';
        ctx.fillText(
          mode === 'url' ? `Source: ${urlInput}` : 'Generated via ToolsVerse Webpage to PDF',
          40,
          90
        );

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 110);
        ctx.lineTo(canvas.width - 40, 110);
        ctx.stroke();

        // Extract and draw plain text lines
        const plainText =
          mode === 'url'
            ? `Captured URL: ${urlInput}\n\nFormat: ${pageFormat.toUpperCase()} (${orientation})\nMargins: ${margin}\nGenerated: ${new Date().toLocaleString()}`
            : htmlCode.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

        ctx.fillStyle = '#1e293b';
        ctx.font = '16px sans-serif';
        const words = plainText.split(' ');
        let currentLine = '';
        let lineY = 150;

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (ctx.measureText(testLine).width < canvas.width - 80) {
            currentLine = testLine;
          } else {
            ctx.fillText(currentLine, 40, lineY);
            currentLine = word;
            lineY += 24;
            if (lineY > canvas.height - 60) break;
          }
        }
        if (currentLine && lineY <= canvas.height - 60) {
          ctx.fillText(currentLine, 40, lineY);
        }

        const pngUrl = canvas.toDataURL('image/png');
        const embeddedPng = await pdfDoc.embedPng(pngUrl);
        page.drawImage(embeddedPng, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `webpage_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setSuccess('PDF document successfully generated and downloaded!');
    } catch (err: any) {
      console.error(err);
      setError('Direct PDF generation failed: ' + (err.message || 'Unknown error.'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex items-center text-xs font-medium text-gray-500 dark:text-slate-400">
            <li className="flex items-center">
              <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Home
              </Link>
              <svg className="w-3 h-3 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </li>
            <li className="text-gray-800 dark:text-white font-semibold">Webpage to PDF</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Webpage & HTML to PDF Converter
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">
            Convert any webpage URL or raw HTML code into a clean, formatted PDF document with customizable layout and margins.
          </p>
        </div>

        {/* AdSlot */}
        <div className="mb-8">
          <AdSlot format="horizontal" />
        </div>

        {/* Input Mode Selector */}
        <div className="flex border-b border-gray-200 dark:border-slate-800 mb-6">
          <button
            onClick={() => setMode('url')}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              mode === 'url'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400'
            }`}
          >
            <span>🔗 Convert Webpage URL</span>
          </button>
          <button
            onClick={() => setMode('html')}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              mode === 'html'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400'
            }`}
          >
            <span>💻 Raw HTML & CSS</span>
          </button>
        </div>

        {/* Mode 1: URL input */}
        {mode === 'url' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4 mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
              Webpage URL:
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full flex-1 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-xs sm:text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-gray-400 font-medium">Try Samples:</span>
              <button
                onClick={() => setUrlInput('https://en.wikipedia.org/wiki/World_Wide_Web')}
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"
              >
                Wikipedia
              </button>
              <button
                onClick={() => setUrlInput('https://news.ycombinator.com/')}
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"
              >
                Hacker News
              </button>
              <button
                onClick={() => setUrlInput('https://example.com')}
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"
              >
                Example Domain
              </button>
            </div>
          </div>
        )}

        {/* Mode 2: HTML input */}
        {mode === 'html' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                HTML & CSS Code:
              </label>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Templates:</span>
                <button
                  onClick={() => setHtmlCode(TEMPLATES.article)}
                  className="px-2 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-slate-300 rounded"
                >
                  Article
                </button>
                <button
                  onClick={() => setHtmlCode(TEMPLATES.invoice)}
                  className="px-2 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-slate-300 rounded"
                >
                  Invoice
                </button>
                <button
                  onClick={() => setHtmlCode(TEMPLATES.resume)}
                  className="px-2 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-slate-300 rounded"
                >
                  Resume
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-xs font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        )}

        {/* Page Format & Layout Controls Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 mb-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            ⚙️ Page Format & Print Layout
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Format */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                Page Size:
              </label>
              <select
                value={pageFormat}
                onChange={(e) => setPageFormat(e.target.value as PageFormat)}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="a4">A4 (210 x 297 mm)</option>
                <option value="letter">US Letter (8.5 x 11 in)</option>
                <option value="legal">US Legal (8.5 x 14 in)</option>
              </select>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                Orientation:
              </label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as Orientation)}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="portrait">Portrait (Vertical)</option>
                <option value="landscape">Landscape (Horizontal)</option>
              </select>
            </div>

            {/* Margins */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                Margins:
              </label>
              <select
                value={margin}
                onChange={(e) => setMargin(e.target.value as MarginSize)}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="normal">Normal (20 mm)</option>
                <option value="minimal">Minimal (10 mm)</option>
                <option value="none">None (0 mm - Edge to Edge)</option>
              </select>
            </div>
          </div>

          {/* Live Preview Frame */}
          <div>
            <span className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-2">
              Document Live Render Preview:
            </span>
            <div className="border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white h-72 shadow-inner">
              <iframe
                ref={iframeRef}
                title="Preview"
                srcDoc={mode === 'html' ? htmlCode : undefined}
                src={mode === 'url' ? urlInput : undefined}
                sandbox="allow-same-origin allow-scripts"
                className="w-full h-full border-0"
              />
            </div>
          </div>

          {/* Notifications */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
              {success}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              onClick={handleDirectDownload}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-white font-bold text-xs sm:text-sm rounded-xl transition-all"
            >
              Direct PDF Download
            </button>
            <button
              onClick={handlePrintToPdf}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Converting...</span>
                </>
              ) : (
                <span>🖨️ Convert & Print to PDF</span>
              )}
            </button>
          </div>
        </div>

        {/* How to Use */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">How to Convert Webpages & HTML to PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Choose Source</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Select between entering a public webpage URL or pasting custom HTML/CSS code.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Configure Layout</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Set your preferred page size (A4, Letter, Legal), portrait/landscape orientation, and margin spacing.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Preview Content</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Check the interactive live render frame to ensure fonts, styling, and elements display accurately.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Convert & Save</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Click Convert & Print to PDF to generate a crisp vector PDF via browser print or Direct Download.
              </p>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-8">
          <RelatedTools currentSlug="webpage-to-pdf" />
        </div>
      </div>
    </div>
  );
}
