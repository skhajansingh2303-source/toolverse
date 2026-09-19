'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Built-in presets
const PRESETS = {
  technical: `# Project Architecture & Technical Specification

**Version:** 2.4.0  
**Status:** Approved  
**Author:** Engineering Team  
**Date:** March 2025

---

## 1. Executive Overview

ToolsVerse is a high-performance, edge-first utility suite designed for browser-native execution. By utilizing Web Workers and compiled vector rendering, zero confidential data leaves the client sandbox.

> **Architecture Principle:** "All computation belongs to the client. Privacy is guaranteed by cryptographic design, not by privacy policies."

---

## 2. Core Subsystems

The application decomposes into four primary isolated modules:

- **Vector Rendering Engine:** Executes continuous viewport scaling up to 300% DPI.
- **Dynamic Stream Parser:** Decodes byte streams without uncompressed memory leakage.
- **Cryptographic Guard:** Implements standard SHA-256 and client-side password encryption.
- **Format Transpiler:** Real-time bi-directional layout synthesis.

---

## 3. Benchmarks & System Metrics

| Module Name | Execution Target | Memory Overhead | Throughput |
| :--- | :--- | :--- | :--- |
| PDF Reader Core | Web Worker Canvas | < 18 MB | 60 FPS |
| Markdown Transpiler | AST Lexer | < 4 MB | 120k wpm |
| Invoice Validator | EN16931 Schema | < 6 MB | Instant (<10ms) |
| SVG Vector Engine | Operator List | < 12 MB | Zero Loss |

---

## 4. Implementation Example

\`\`\`typescript
interface DocumentConfig {
  readonly title: string;
  readonly pageSize: 'A4' | 'Letter';
  readonly margins: { top: number; bottom: number };
  readonly enablePageNumbers: boolean;
}

export async function compilePdf(spec: DocumentConfig): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  // Compile vector elements...
  return await doc.save();
}
\`\`\`

---

## 5. Security & Verification Checklist

- [x] All processing executes client-side in the browser.
- [x] Content-Security-Policy disallows foreign network telemetry.
- [x] Strict typing verified across all export functions.
`,

  academic: `# Deep Neural Latent Spaces for High-Resolution Document Synthesis

**Authors:** Dr. Alex Vance, Dr. Elena Rostova  
**Affiliation:** Institute for Computational Systems & Vector Intelligence  
**Correspondence:** contact@toolsverse.dev

---

## Abstract

We present a unified computational model for transforming unstructured vectorized documents into structured semantic representations. By applying spatial font-hierarchy clustering and line-bucket heuristics, our method achieves 99.4% accuracy across diverse typographic scales without relying on external cloud APIs.

---

## 1. Introduction

Document conversion has historically been constrained by either lossy rasterization or closed proprietary toolchains. In modern web environments, preserving semantic tokens—such as headings, tabular columns, and code boundaries—is critical for machine consumption and accessibility.

> "A document is not merely ink upon paper; it is a topological graph of hierarchical propositions." — T. E. Lawrence, 1926

---

## 2. Methodology & Geometric Heuristics

Let $P = \\{t_1, t_2, \\dots, t_n\\}$ denote the set of text tokens with baseline height $h_i$ and Cartesian coordinate $(x_i, y_i)$.

1. **Baseline Median Normalization:** We compute the median font dimension $\\tilde{h} = \\text{median}(\\{h_i\\})$.
2. **Heading Classification:** Tokens with $h_i \\ge 1.55 \\tilde{h}$ are mapped to Primary Section Titles.
3. **Tabular Alignment:** Consecutive coordinate spans satisfying $\\Delta x_{j, j-1} > \\tau$ form multi-column matrices.

---

## 3. Comparative Evaluation

| Model Paradigm | Precision | Recall | Latency (ms) |
| :--- | :--- | :--- | :--- |
| Baseline OCR | 88.2% | 84.1% | 1,420 ms |
| Cloud Vision API | 94.5% | 93.0% | 850 ms |
| **ToolsVerse Native AST** | **99.4%** | **98.8%** | **< 15 ms** |

---

## 4. Conclusion

Client-side execution provides strictly superior privacy bounds while diminishing server infrastructure cost to zero.
`,

  meeting: `# Executive Strategy & Product Roadmap

**Meeting Date:** September 11, 2026  
**Attendees:** Product Management, Lead Architecture, Design Ops  
**Agenda:** Q4 Platform Expansion & PDF Engine Release

---

## 1. Action Items & High-Priority Deliverables

- [x] Launch in-browser continuous scroll PDF Reader with dark mode.
- [x] Complete Factur-X / ZUGFeRD electronic invoice compliance builder.
- [x] Deliver lossless vector SVG and PNG multi-resolution exporters.
- [ ] Finalize end-to-end integration automated test suites.

---

## 2. Key Decisions Made

- **Client-First Stance:** All 8 new PDF utilities must run 100% in browser memory.
- **Zero External Telemetry:** User documents will never be uploaded to external servers.
- **Standardized Design:** Indigo-600 accents with dark mode compatibility across all viewports.

---

## 3. Quarterly Milestones

| Quarter | Feature Focus | Target Status |
| :--- | :--- | :--- |
| Q1 2026 | Document Conversion Engine | Complete |
| Q2 2026 | Compression & Optimizer Stream | Complete |
| Q3 2026 | Compliant Factur-X & UBL Invoicing | Shipped |
| Q4 2026 | Multi-Document Batch Workflow | In Progress |

> **Next Standup:** Monday at 09:00 UTC. Please review the updated spec before the call.
`,

  readme: `# ToolsVerse Document Engine

A high-performance, browser-native toolkit for manipulating, rendering, and converting PDF and Markdown documents.

---

## Features

- **Blazing Fast:** Zero network roundtrips. Instant preview and compilation.
- **Completely Private:** Your files never leave your device.
- **Publication Quality:** Clean typography, syntax highlighted code, and responsive tables.

---

## Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/toolsverse/toolsverse.git

# Install dependencies
npm install

# Start local development server
npm run dev
\`\`\`

---

## System Requirements

- Node.js 18.0 or higher
- Modern Chromium, Safari, or Firefox browser with WebAssembly enabled
`,
};

export default function MarkdownToPdf() {
  const [markdown, setMarkdown] = useState<string>(PRESETS.technical);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Styling & Options
  const [themeFont, setThemeFont] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
  const [marginSize, setMarginSize] = useState<'compact' | 'standard' | 'generous'>('standard');
  const [accentColor, setAccentColor] = useState<string>('indigo');
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);
  const [documentTitle, setDocumentTitle] = useState<string>('ToolsVerse Document');

  const previewPrintRef = useRef<HTMLDivElement>(null);

  // Preset switch
  const loadPreset = (key: keyof typeof PRESETS) => {
    setMarkdown(PRESETS[key]);
  };

  // Accent color hex map
  const colorMap: { [key: string]: { hex: string; rgb: [number, number, number] } } = {
    indigo: { hex: '#4f46e5', rgb: [0.31, 0.27, 0.9] },
    emerald: { hex: '#059669', rgb: [0.02, 0.59, 0.41] },
    crimson: { hex: '#dc2626', rgb: [0.86, 0.15, 0.15] },
    slate: { hex: '#334155', rgb: [0.2, 0.25, 0.33] },
  };

  // Direct client-side PDF compilation via pdf-lib
  const generateDirectPdf = async () => {
    setIsGenerating(true);
    setDownloadUrl(null);

    try {
      const pdfDoc = await PDFDocument.create();

      // Page dimensions in points (72 points = 1 inch)
      const pageDims = pageSize === 'A4' ? [595.28, 841.89] : [612.0, 792.0]; // A4 vs US Letter
      const pageWidth = pageDims[0];
      const pageHeight = pageDims[1];

      // Margins
      const marginMap = {
        compact: 36,
        standard: 54,
        generous: 72,
      };
      const margin = marginMap[marginSize];
      const contentWidth = pageWidth - margin * 2;

      // Select standard fonts
      let regularFont, boldFont, italicFont, monoFont;
      if (themeFont === 'serif') {
        regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
        italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
      } else if (themeFont === 'mono') {
        regularFont = await pdfDoc.embedFont(StandardFonts.Courier);
        boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
        italicFont = await pdfDoc.embedFont(StandardFonts.CourierOblique);
      } else {
        regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      }
      monoFont = await pdfDoc.embedFont(StandardFonts.Courier);

      const selColor = colorMap[accentColor] || colorMap.indigo;
      const themeRgb = rgb(selColor.rgb[0], selColor.rgb[1], selColor.rgb[2]);

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      const checkNewPage = (neededHeight: number) => {
        if (currentY - neededHeight < margin + (includePageNumbers ? 30 : 10)) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
          return true;
        }
        return false;
      };

      const rawLines = markdown.split('\n');
      let inCodeBlock = false;
      let codeLines: string[] = [];

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];

        // Code block toggle
        if (line.trim().startsWith('```')) {
          if (!inCodeBlock) {
            inCodeBlock = true;
            codeLines = [];
          } else {
            inCodeBlock = false;
            // Draw code block box
            const boxHeight = codeLines.length * 15 + 16;
            checkNewPage(boxHeight);

            currentPage.drawRectangle({
              x: margin,
              y: currentY - boxHeight + 10,
              width: contentWidth,
              height: boxHeight,
              color: rgb(0.95, 0.96, 0.98),
              borderColor: rgb(0.85, 0.88, 0.92),
              borderWidth: 1,
            });

            let codeY = currentY - 14;
            codeLines.forEach((cLine) => {
              currentPage.drawText(cLine.slice(0, 85), {
                x: margin + 12,
                y: codeY,
                size: 9,
                font: monoFont,
                color: rgb(0.2, 0.25, 0.3),
              });
              codeY -= 15;
            });

            currentY -= boxHeight + 10;
            codeLines = [];
          }
          continue;
        }

        if (inCodeBlock) {
          codeLines.push(line);
          continue;
        }

        // Horizontal Rule
        if (line.trim().startsWith('---')) {
          checkNewPage(20);
          currentPage.drawLine({
            start: { x: margin, y: currentY - 5 },
            end: { x: pageWidth - margin, y: currentY - 5 },
            thickness: 1,
            color: rgb(0.85, 0.88, 0.92),
          });
          currentY -= 22;
          continue;
        }

        // Headings
        if (line.startsWith('# ')) {
          const text = line.replace(/^#\s+/, '').trim();
          checkNewPage(45);
          currentPage.drawText(text, {
            x: margin,
            y: currentY - 24,
            size: 22,
            font: boldFont,
            color: themeRgb,
          });
          currentY -= 36;
          continue;
        }

        if (line.startsWith('## ')) {
          const text = line.replace(/^##\s+/, '').trim();
          checkNewPage(35);
          currentPage.drawText(text, {
            x: margin,
            y: currentY - 18,
            size: 16,
            font: boldFont,
            color: rgb(0.12, 0.16, 0.22),
          });
          // subtle accent line
          currentPage.drawLine({
            start: { x: margin, y: currentY - 22 },
            end: { x: margin + 60, y: currentY - 22 },
            thickness: 2,
            color: themeRgb,
          });
          currentY -= 32;
          continue;
        }

        if (line.startsWith('### ')) {
          const text = line.replace(/^###\s+/, '').trim();
          checkNewPage(28);
          currentPage.drawText(text, {
            x: margin,
            y: currentY - 14,
            size: 13,
            font: boldFont,
            color: rgb(0.2, 0.25, 0.35),
          });
          currentY -= 26;
          continue;
        }

        // Blockquotes
        if (line.startsWith('>')) {
          const text = line.replace(/^>\s*/, '').trim();
          checkNewPage(30);
          currentPage.drawLine({
            start: { x: margin, y: currentY },
            end: { x: margin, y: currentY - 20 },
            thickness: 3,
            color: themeRgb,
          });
          currentPage.drawText(text.slice(0, 90), {
            x: margin + 12,
            y: currentY - 14,
            size: 10,
            font: italicFont,
            color: rgb(0.35, 0.4, 0.45),
          });
          currentY -= 28;
          continue;
        }

        // Bullet lists
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          const text = line.trim().replace(/^[-*]\s+/, '');
          checkNewPage(18);
          currentPage.drawCircle({
            x: margin + 6,
            y: currentY - 7,
            size: 2.5,
            color: themeRgb,
          });
          currentPage.drawText(text.slice(0, 95), {
            x: margin + 18,
            y: currentY - 10,
            size: 10.5,
            font: regularFont,
            color: rgb(0.2, 0.25, 0.3),
          });
          currentY -= 18;
          continue;
        }

        // Simple Markdown Table row detection
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
          const cells = line
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());
          if (cells.some((c) => c.includes('---'))) {
            continue; // Divider row
          }
          checkNewPage(22);
          const colWidth = contentWidth / Math.max(1, cells.length);
          cells.forEach((cell, cIdx) => {
            currentPage.drawText(cell.slice(0, 26), {
              x: margin + cIdx * colWidth + 4,
              y: currentY - 10,
              size: 9.5,
              font: regularFont,
              color: rgb(0.2, 0.25, 0.3),
            });
          });
          currentPage.drawLine({
            start: { x: margin, y: currentY - 14 },
            end: { x: pageWidth - margin, y: currentY - 14 },
            thickness: 0.5,
            color: rgb(0.85, 0.88, 0.92),
          });
          currentY -= 22;
          continue;
        }

        // Regular paragraph / blank line
        if (line.trim() === '') {
          currentY -= 10;
          continue;
        }

        // Text paragraph with line wrapping approximation
        checkNewPage(18);
        currentPage.drawText(line.slice(0, 105), {
          x: margin,
          y: currentY - 10,
          size: 10.5,
          font: regularFont,
          color: rgb(0.2, 0.25, 0.3),
        });
        currentY -= 18;
      }

      // Add Page Numbers & Footer if enabled
      if (includePageNumbers) {
        const total = pdfDoc.getPageCount();
        pdfDoc.getPages().forEach((p, idx) => {
          const numText = `Page ${idx + 1} of ${total}`;
          p.drawText(numText, {
            x: pageWidth / 2 - 25,
            y: margin / 2,
            size: 8.5,
            font: regularFont,
            color: rgb(0.5, 0.55, 0.6),
          });
          p.drawText(documentTitle, {
            x: margin,
            y: margin / 2,
            size: 8.5,
            font: regularFont,
            color: rgb(0.6, 0.65, 0.7),
          });
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: 'PDF generated successfully!' },
        })
      );
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('An error occurred during PDF generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  // High-fidelity Print to PDF
  const handlePrintToPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Print-specific stylesheet injected */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-document-root,
          #print-document-root * {
            visibility: visible;
          }
          #print-document-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20mm !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">Markdown to PDF</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Markdown to PDF Document Generator
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Write or paste Markdown to generate publication-grade, beautifully formatted PDF documents with live preview, custom typography, accents, and headers.
          </p>
        </div>

        {/* Toolbar & Configuration Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mr-1">
                Presets:
              </span>
              <button
                type="button"
                onClick={() => loadPreset('technical')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Technical Spec
              </button>
              <button
                type="button"
                onClick={() => loadPreset('academic')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Academic Paper
              </button>
              <button
                type="button"
                onClick={() => loadPreset('meeting')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Meeting Notes
              </button>
              <button
                type="button"
                onClick={() => loadPreset('readme')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Project Readme
              </button>
            </div>

            {/* Export Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrintToPdf}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors flex items-center gap-1.5"
                title="Open browser print dialog for pixel-perfect PDF export"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print / Save as PDF
              </button>

              <button
                type="button"
                onClick={generateDirectPdf}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Direct PDF Download
                  </>
                )}
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download="toolsverse-document.pdf"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  Download .pdf
                </a>
              )}
            </div>
          </div>

          {/* Typography & Format Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-gray-200 dark:border-slate-800 text-xs">
            <div>
              <label className="block font-bold text-gray-600 dark:text-gray-400 mb-1">Typography</label>
              <select
                value={themeFont}
                onChange={(e) => setThemeFont(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
              >
                <option value="sans">Modern Sans (Inter/Helvetica)</option>
                <option value="serif">Elegant Serif (Times/Georgia)</option>
                <option value="mono">Clean Monospace (Courier/Code)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-600 dark:text-gray-400 mb-1">Page Size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="Letter">US Letter (8.5 × 11 in)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-600 dark:text-gray-400 mb-1">Margins</label>
              <select
                value={marginSize}
                onChange={(e) => setMarginSize(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
              >
                <option value="compact">Compact (0.5 in)</option>
                <option value="standard">Standard (0.75 in)</option>
                <option value="generous">Generous (1.0 in)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-600 dark:text-gray-400 mb-1">Accent Color</label>
              <select
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
              >
                <option value="indigo">Indigo Accent</option>
                <option value="emerald">Emerald Green</option>
                <option value="crimson">Crimson Red</option>
                <option value="slate">Charcoal Slate</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-600 dark:text-gray-400 mb-1">Page Numbers</label>
              <div className="flex items-center h-[34px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePageNumbers}
                    onChange={(e) => setIncludePageNumbers(e.target.checked)}
                    className="rounded text-primary-600"
                  />
                  <span>Show &quot;Page X of Y&quot;</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Live Workspace: Editor (Left) & Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Markdown Editor */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-[750px]">
            <div className="px-4 py-3 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Markdown Source Editor
              </span>
              <span className="text-xs text-gray-500 font-mono">
                {markdown.length} chars • {markdown.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 w-full p-4 font-mono text-xs leading-relaxed bg-transparent text-gray-900 dark:text-gray-100 resize-none focus:outline-none"
              placeholder="Type your markdown here..."
            />
          </div>

          {/* Right: Live Formatted Paginated Document Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-[750px]">
            <div className="px-4 py-3 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Printable PDF Preview
              </span>
              <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                Live Rendering
              </span>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-200/60 dark:bg-slate-950 p-4 sm:p-6 flex flex-col items-center">
              {/* Paper Sheet Preview */}
              <div
                id="print-document-root"
                ref={previewPrintRef}
                className={`bg-white text-gray-900 shadow-xl rounded-sm w-full max-w-[595px] min-h-[842px] p-8 sm:p-12 transition-all ${
                  themeFont === 'serif'
                    ? 'font-serif'
                    : themeFont === 'mono'
                    ? 'font-mono'
                    : 'font-sans'
                }`}
              >
                <RenderLiveMarkdown content={markdown} accentHex={colorMap[accentColor]?.hex || '#4f46e5'} />
                {includePageNumbers && (
                  <div className="mt-12 pt-4 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-400">
                    <span>{documentTitle}</span>
                    <span>Page 1 of 1</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ad Slot */}
        <AdSlot format="horizontal" />

        {/* How to Use Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use Markdown to PDF Converter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                1
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Write or Paste Markdown</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Paste any standard Markdown text or click one of the quick presets (Technical Spec, Academic Paper, Meeting Notes).
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                2
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Customize Layout & Styling</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose typography (Modern Sans, Elegant Serif, Monospace), paper size (A4, Letter), margins, accent colors, and page numbering.
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                3
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Instant PDF Export</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click &quot;Direct PDF Download&quot; for immediate compilation or &quot;Print / Save as PDF&quot; for browser print formatting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Live Markdown Preview Component for styling
function RenderLiveMarkdown({ content, accentHex }: { content: string; accentHex: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];
  let tableBuffer: string[] = [];

  const flushTable = (k: number) => {
    if (tableBuffer.length === 0) return null;
    const headerRow = tableBuffer[0];
    const dataRows = tableBuffer.slice(2);
    const parseCells = (r: string) =>
      r
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

    const headers = parseCells(headerRow);

    const el = (
      <div key={`table-${k}`} className="overflow-x-auto my-4">
        <table className="min-w-full text-xs border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-bold text-gray-800">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {dataRows.map((rStr, rIdx) => {
              const cells = parseCells(rStr);
              return (
                <tr key={rIdx}>
                  {cells.map((c, cIdx) => (
                    <td key={cIdx} className="px-3 py-1.5 text-gray-700">
                      {c}
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
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeBuffer = [];
      } else {
        inCode = false;
        elements.push(
          <pre key={`code-${idx}`} className="p-3 bg-gray-900 text-emerald-400 rounded-lg font-mono text-xs my-3 overflow-x-auto">
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

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      tableBuffer.push(line.trim());
      return;
    } else if (tableBuffer.length > 0) {
      const tEl = flushTable(idx);
      if (tEl) elements.push(tEl);
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={idx} className="text-2xl font-black mt-4 mb-2 pb-1 border-b" style={{ color: accentHex }}>
          {line.replace(/^#\s+/, '')}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={idx} className="text-lg font-bold text-gray-900 mt-4 mb-1">
          {line.replace(/^##\s+/, '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="text-sm font-bold text-gray-800 mt-3 mb-1">
          {line.replace(/^###\s+/, '')}
        </h3>
      );
    } else if (line.startsWith('---')) {
      elements.push(<hr key={idx} className="my-3 border-gray-200" />);
    } else if (line.startsWith('>')) {
      elements.push(
        <blockquote
          key={idx}
          className="border-l-4 pl-3 py-1 italic text-gray-600 my-2 text-xs"
          style={{ borderColor: accentHex }}
        >
          {line.replace(/^>\s*/, '')}
        </blockquote>
      );
    } else if (line.trim().startsWith('- [x]')) {
      elements.push(
        <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 my-1 ml-2">
          <span className="text-emerald-600 font-bold">☑</span>
          <span>{line.replace(/^-\s*\[x\]\s*/, '')}</span>
        </div>
      );
    } else if (line.trim().startsWith('- [ ]')) {
      elements.push(
        <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 my-1 ml-2">
          <span className="text-gray-400">☐</span>
          <span>{line.replace(/^-\s*\[\s*\]\s*/, '')}</span>
        </div>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={idx} className="ml-5 list-disc text-xs text-gray-700 my-1">
          {line.replace(/^[-*]\s+/, '')}
        </li>
      );
    } else if (line.trim() !== '') {
      elements.push(
        <p key={idx} className="text-xs text-gray-700 my-1.5 leading-relaxed">
          {line}
        </p>
      );
    }
  });

  if (tableBuffer.length > 0) {
    const tEl = flushTable(lines.length);
    if (tEl) elements.push(tEl);
  }

  return <div className="space-y-1">{elements}</div>;
}
