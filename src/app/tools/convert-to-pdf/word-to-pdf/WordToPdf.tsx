'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import AdSlot from '@/components/AdSlot';
import ToolResultCard from '@/components/ToolResultCard';

interface WordParagraph {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bullet';
  text: string;
  isBold?: boolean;
  isItalic?: boolean;
}

interface WordTable {
  type: 'table';
  rows: string[][];
}

type WordContentBlock = WordParagraph | WordTable;

export default function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parsedBlocks, setParsedBlocks] = useState<WordContentBlock[]>([]);
  const [docTitle, setDocTitle] = useState<string>('Document');
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
  const [marginOption, setMarginOption] = useState<'normal' | 'narrow' | 'wide'>('normal');
  const [fontChoice, setFontChoice] = useState<'helvetica' | 'times' | 'courier'>('helvetica');
  const [baseFontSize, setBaseFontSize] = useState<number>(11);
  const [accentColor, setAccentColor] = useState<'indigo' | 'slate' | 'navy' | 'emerald'>('indigo');
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);
  const [includeHeader, setIncludeHeader] = useState<boolean>(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);
  const [pdfFileSize, setPdfFileSize] = useState<number>(0);

  // Clean up blob url on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocTitle(cleanName || 'Document');
      parseWordDocument(selected);
    }
  };

  const parseWordDocument = async (fileToParse: File) => {
    setIsProcessing(true);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }

    try {
      const buffer = await fileToParse.arrayBuffer();
      const blocks: WordContentBlock[] = [];

      // Attempt to load as DOCX (Zip format)
      try {
        const zip = await JSZip.loadAsync(buffer);
        const documentXmlFile = zip.file('word/document.xml');

        if (documentXmlFile) {
          const xmlText = await documentXmlFile.async('text');
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

          // Check for document body
          const body = xmlDoc.getElementsByTagName('w:body')[0] || xmlDoc.getElementsByTagName('body')[0];
          if (body) {
            const children = Array.from(body.children);

            children.forEach((child) => {
              const nodeName = child.nodeName.toLowerCase();

              // Table parsing
              if (nodeName.includes('tbl') || nodeName.endsWith(':tbl')) {
                const trElements = Array.from(child.getElementsByTagName('w:tr'));
                const rows: string[][] = [];

                trElements.forEach((tr) => {
                  const tcElements = Array.from(tr.getElementsByTagName('w:tc'));
                  const rowCells: string[] = [];

                  tcElements.forEach((tc) => {
                    const textRuns = Array.from(tc.getElementsByTagName('w:t'));
                    const cellText = textRuns.map((t) => t.textContent || '').join('');
                    rowCells.push(cellText.trim());
                  });

                  if (rowCells.some((c) => c.length > 0)) {
                    rows.push(rowCells);
                  }
                });

                if (rows.length > 0) {
                  blocks.push({
                    type: 'table',
                    rows,
                  });
                }
                return;
              }

              // Paragraph parsing
              if (nodeName.includes('p') || nodeName.endsWith(':p')) {
                const pPr = child.getElementsByTagName('w:pPr')[0];
                let styleVal = '';
                let isBullet = false;

                if (pPr) {
                  const pStyle = pPr.getElementsByTagName('w:pStyle')[0];
                  if (pStyle) {
                    styleVal = (pStyle.getAttribute('w:val') || '').toLowerCase();
                  }
                  const numPr = pPr.getElementsByTagName('w:numPr')[0];
                  if (numPr || styleVal.includes('list') || styleVal.includes('bullet')) {
                    isBullet = true;
                  }
                }

                // Extract runs
                const runs = Array.from(child.getElementsByTagName('w:r'));
                let paragraphText = '';
                let hasBold = false;
                let hasItalic = false;

                runs.forEach((run) => {
                  const rPr = run.getElementsByTagName('w:rPr')[0];
                  if (rPr) {
                    if (rPr.getElementsByTagName('w:b').length > 0) hasBold = true;
                    if (rPr.getElementsByTagName('w:i').length > 0) hasItalic = true;
                  }
                  const tElements = Array.from(run.getElementsByTagName('w:t'));
                  tElements.forEach((t) => {
                    paragraphText += t.textContent || '';
                  });
                });

                const cleanText = paragraphText.trim();
                if (!cleanText) return;

                if (styleVal.includes('heading 1') || styleVal === 'heading1' || styleVal === '1') {
                  blocks.push({
                    type: 'heading1',
                    text: cleanText,
                    isBold: true,
                  });
                } else if (styleVal.includes('heading 2') || styleVal === 'heading2' || styleVal === '2') {
                  blocks.push({
                    type: 'heading2',
                    text: cleanText,
                    isBold: true,
                  });
                } else if (styleVal.includes('heading 3') || styleVal === 'heading3' || styleVal === '3') {
                  blocks.push({
                    type: 'heading3',
                    text: cleanText,
                    isBold: true,
                  });
                } else if (isBullet || /^[\u2022\u25E6\u2023\u25AA\-\*]\s+/.test(cleanText)) {
                  blocks.push({
                    type: 'bullet',
                    text: cleanText.replace(/^[\u2022\u25E6\u2023\u25AA\-\*]\s+/, ''),
                    isBold: hasBold,
                  });
                } else {
                  blocks.push({
                    type: 'paragraph',
                    text: cleanText,
                    isBold: hasBold,
                    isItalic: hasItalic,
                  });
                }
              }
            });
          }
        }
      } catch {
        // Fallback for raw .doc binary/plain text
        const textDecoder = new TextDecoder('utf-8', { fatal: false });
        const rawString = textDecoder.decode(buffer);
        const cleanLines = rawString
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 2);

        cleanLines.forEach((line) => {
          if (line.length < 50 && /^[A-Z0-9\s:_-]+$/.test(line)) {
            blocks.push({ type: 'heading2', text: line, isBold: true });
          } else {
            blocks.push({ type: 'paragraph', text: line });
          }
        });
      }

      setParsedBlocks(blocks);

      // Generate initial PDF with defaults
      await generatePdf(blocks);
    } catch (err) {
      console.error('Error reading Word document:', err);
      alert('Could not read Word file. Please verify it is a valid .docx or .doc file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSampleDoc = async () => {
    const sampleBlocks: WordContentBlock[] = [
      {
        type: 'heading1',
        text: 'Executive Business Proposal & Strategy',
        isBold: true,
      },
      {
        type: 'paragraph',
        text: 'This document provides an overview of our operational objectives, quarterly targets, and strategic roadmap for enterprise modernization. All recommendations are prepared with verifiable financial modeling and industry compliance benchmarks.',
      },
      {
        type: 'heading2',
        text: '1. Strategic Pillars for Modern Growth',
        isBold: true,
      },
      {
        type: 'bullet',
        text: 'Automate manual back-office tasks through browser-native client-side tooling.',
      },
      {
        type: 'bullet',
        text: 'Ensure zero-trust data privacy by processing all office documents directly in the user browser without cloud uploads.',
      },
      {
        type: 'bullet',
        text: 'Streamline cross-departmental collaboration with instant PDF conversions and reporting.',
      },
      {
        type: 'heading2',
        text: '2. Quarterly Resource Allocation & Targets',
        isBold: true,
      },
      {
        type: 'table',
        rows: [
          ['Project Phase', 'Target Completion', 'Estimated Budget', 'Risk Rating'],
          ['Discovery & Architecture', 'Q1 2026', '$45,000', 'Low'],
          ['Client-Side Tool Development', 'Q2 2026', '$85,000', 'Low'],
          ['Security Audits & Testing', 'Q3 2026', '$30,000', 'Very Low'],
          ['Enterprise Rollout & Training', 'Q4 2026', '$20,000', 'Minimal'],
        ],
      },
      {
        type: 'heading3',
        text: 'Conclusion & Next Steps',
        isBold: true,
      },
      {
        type: 'paragraph',
        text: 'By adhering to standardized document rendering and robust typography, our teams ensure clarity and institutional readiness across all stakeholder reports.',
      },
    ];

    setDocTitle('Executive Business Proposal');
    setParsedBlocks(sampleBlocks);
    await generatePdf(sampleBlocks);
  };

  const generatePdf = async (blocks = parsedBlocks) => {
    if (blocks.length === 0) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      // Page dimensions
      const pageWidth = pageSize === 'A4' ? 595.28 : 612;
      const pageHeight = pageSize === 'A4' ? 841.89 : 792;

      // Margins
      const margin = marginOption === 'narrow' ? 36 : marginOption === 'wide' ? 72 : 54;
      const contentWidth = pageWidth - margin * 2;

      // Fonts
      let regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      let boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      let italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

      if (fontChoice === 'times') {
        regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
        italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
      } else if (fontChoice === 'courier') {
        regularFont = await pdfDoc.embedFont(StandardFonts.Courier);
        boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
        italicFont = await pdfDoc.embedFont(StandardFonts.CourierOblique);
      }

      // Accent color palette
      let headerColor = rgb(0.31, 0.27, 0.9); // Indigo
      if (accentColor === 'slate') headerColor = rgb(0.12, 0.16, 0.23);
      else if (accentColor === 'navy') headerColor = rgb(0.12, 0.23, 0.54);
      else if (accentColor === 'emerald') headerColor = rgb(0.02, 0.37, 0.27);

      const textColor = rgb(0.15, 0.2, 0.25);
      const mutedColor = rgb(0.45, 0.5, 0.55);
      const borderColor = rgb(0.8, 0.84, 0.88);
      const tableHeaderBg = rgb(0.95, 0.96, 0.98);

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin - (includeHeader ? 28 : 0);

      const addNewPage = () => {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin - (includeHeader ? 28 : 0);
      };

      // Word wrapping helper
      const wrapText = (text: string, maxWidth: number, font: any, size: number): string[] => {
        const words = text.split(/\s+/);
        const lines: string[] = [];
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, size);

          if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          lines.push(currentLine);
        }
        return lines;
      };

      // Draw blocks
      for (const block of blocks) {
        if (block.type === 'heading1') {
          const size = baseFontSize * 1.6;
          const lines = wrapText(block.text, contentWidth, boldFont, size);
          const blockHeight = lines.length * (size * 1.3) + 16;

          if (currentY - blockHeight < margin + 30) {
            addNewPage();
          }

          currentY -= 12;
          for (const line of lines) {
            currentPage.drawText(line, {
              x: margin,
              y: currentY,
              size,
              font: boldFont,
              color: headerColor,
            });
            currentY -= size * 1.3;
          }
          currentY -= 6;
        } else if (block.type === 'heading2') {
          const size = baseFontSize * 1.3;
          const lines = wrapText(block.text, contentWidth, boldFont, size);
          const blockHeight = lines.length * (size * 1.25) + 12;

          if (currentY - blockHeight < margin + 30) {
            addNewPage();
          }

          currentY -= 10;
          for (const line of lines) {
            currentPage.drawText(line, {
              x: margin,
              y: currentY,
              size,
              font: boldFont,
              color: headerColor,
            });
            currentY -= size * 1.25;
          }
          currentY -= 4;
        } else if (block.type === 'heading3') {
          const size = baseFontSize * 1.1;
          const lines = wrapText(block.text, contentWidth, boldFont, size);
          const blockHeight = lines.length * (size * 1.2) + 8;

          if (currentY - blockHeight < margin + 30) {
            addNewPage();
          }

          currentY -= 8;
          for (const line of lines) {
            currentPage.drawText(line, {
              x: margin,
              y: currentY,
              size,
              font: boldFont,
              color: textColor,
            });
            currentY -= size * 1.2;
          }
          currentY -= 2;
        } else if (block.type === 'bullet') {
          const size = baseFontSize;
          const bulletIndent = 16;
          const textWidth = contentWidth - bulletIndent;
          const font = block.isBold ? boldFont : regularFont;
          const lines = wrapText(block.text, textWidth, font, size);
          const blockHeight = lines.length * (size * 1.35) + 4;

          if (currentY - blockHeight < margin + 30) {
            addNewPage();
          }

          // Bullet dot
          currentPage.drawText('•', {
            x: margin + 2,
            y: currentY,
            size: size + 2,
            font: regularFont,
            color: headerColor,
          });

          for (let lIdx = 0; lIdx < lines.length; lIdx++) {
            currentPage.drawText(lines[lIdx], {
              x: margin + bulletIndent,
              y: currentY,
              size,
              font,
              color: textColor,
            });
            currentY -= size * 1.35;
          }
          currentY -= 3;
        } else if (block.type === 'paragraph') {
          const size = baseFontSize;
          const font = block.isBold ? boldFont : block.isItalic ? italicFont : regularFont;
          const lines = wrapText(block.text, contentWidth, font, size);
          const blockHeight = lines.length * (size * 1.4) + 6;

          if (currentY - blockHeight < margin + 30) {
            addNewPage();
          }

          for (const line of lines) {
            currentPage.drawText(line, {
              x: margin,
              y: currentY,
              size,
              font,
              color: textColor,
            });
            currentY -= size * 1.4;
          }
          currentY -= 6;
        } else if (block.type === 'table') {
          const numCols = Math.max(...block.rows.map((r) => r.length), 1);
          const colWidth = contentWidth / numCols;
          const cellFontSize = Math.max(baseFontSize - 1, 9);
          const rowHeight = cellFontSize * 2.2;

          // Check if table fits or requires page split
          currentY -= 6;
          for (let rIdx = 0; rIdx < block.rows.length; rIdx++) {
            if (currentY - rowHeight < margin + 30) {
              addNewPage();
            }

            const isHeaderRow = rIdx === 0;
            const rowData = block.rows[rIdx];

            // Background rectangle
            if (isHeaderRow) {
              currentPage.drawRectangle({
                x: margin,
                y: currentY - rowHeight + 4,
                width: contentWidth,
                height: rowHeight,
                color: tableHeaderBg,
                borderColor,
                borderWidth: 1,
              });
            } else {
              currentPage.drawRectangle({
                x: margin,
                y: currentY - rowHeight + 4,
                width: contentWidth,
                height: rowHeight,
                borderColor,
                borderWidth: 0.5,
              });
            }

            // Cell text
            for (let cIdx = 0; cIdx < numCols; cIdx++) {
              const cellText = rowData[cIdx] || '';
              const font = isHeaderRow ? boldFont : regularFont;
              const cellX = margin + cIdx * colWidth + 6;
              const cellY = currentY - rowHeight + 10;

              // Truncate cell text if exceeding column width
              let truncated = cellText;
              while (font.widthOfTextAtSize(truncated, cellFontSize) > colWidth - 12 && truncated.length > 0) {
                truncated = truncated.slice(0, -1);
              }

              currentPage.drawText(truncated, {
                x: cellX,
                y: cellY,
                size: cellFontSize,
                font,
                color: isHeaderRow ? headerColor : textColor,
              });
            }

            currentY -= rowHeight;
          }
          currentY -= 8;
        }
      }

      // Draw Header & Page Numbers on all pages
      const totalPages = pdfDoc.getPageCount();
      for (let pIndex = 0; pIndex < totalPages; pIndex++) {
        const page = pdfDoc.getPage(pIndex);

        // Header
        if (includeHeader) {
          page.drawText(docTitle, {
            x: margin,
            y: pageHeight - margin + 14,
            size: 9,
            font: regularFont,
            color: mutedColor,
          });
          page.drawLine({
            start: { x: margin, y: pageHeight - margin + 8 },
            end: { x: pageWidth - margin, y: pageHeight - margin + 8 },
            thickness: 0.5,
            color: borderColor,
          });
        }

        // Footer / Page Number
        if (includePageNumbers) {
          const footerText = `Page ${pIndex + 1} of ${totalPages}`;
          const footerWidth = regularFont.widthOfTextAtSize(footerText, 9);
          page.drawText(footerText, {
            x: pageWidth - margin - footerWidth,
            y: margin - 18,
            size: 9,
            font: regularFont,
            color: mutedColor,
          });
          page.drawLine({
            start: { x: margin, y: margin - 6 },
            end: { x: pageWidth - margin, y: margin - 6 },
            thickness: 0.5,
            color: borderColor,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      setPdfUrl(url);
      setPdfPageCount(totalPages);
      setPdfFileSize(blob.size);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('toolsverse-toast', {
            detail: { message: `Generated ${totalPages}-page PDF document!` },
          })
        );
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error rendering PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPdfFile = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${docTitle.trim() || 'converted-document'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="text-sm mb-8 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Word to PDF</span>
        </nav>

        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-xs font-semibold text-primary-700 dark:text-primary-300 mb-3">
            <span>⚡ Professional Vector PDF Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Word to PDF Converter
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Convert Microsoft Word (.docx and .doc) documents into standardized, beautifully
            typeset, paginated PDF files instantly without software installation.
          </p>
        </header>

        {/* Horizontal AdSlot */}
        <AdSlot format="horizontal" />

        {/* Dropzone or Loaded State */}
        {!file && parsedBlocks.length === 0 ? (
          <div>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-3xl p-12 transition-all group bg-white dark:bg-slate-900 shadow-sm mb-6">
              <input
                type="file"
                accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => {
                  handleFile(e);
                  e.target.value = '';
                }}
              />
              <div className="pointer-events-none flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-3xl text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  📝
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Choose Word Document to Convert
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
                  Drag and drop your .docx or .doc file here or click anywhere to browse
                </p>
                <span className="px-6 py-3 bg-primary-600 group-hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all inline-block">
                  Browse Files
                </span>
                <span className="text-[11px] text-gray-400 dark:text-slate-500 mt-4">
                  Runs 100% locally in your browser • Confidential &amp; Safe
                </span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={loadSampleDoc}
                className="inline-flex items-center gap-2 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-xs"
              >
                <span>💡 Don&apos;t have a Word file right now? Load Sample Proposal</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold">
                  PDF
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    {file ? file.name : 'Sample Word Proposal'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {parsedBlocks.length} content blocks parsed • Ready to export
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setFile(null);
                    setParsedBlocks([]);
                    if (pdfUrl) {
                      URL.revokeObjectURL(pdfUrl);
                      setPdfUrl(null);
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Upload Another File
                </button>
                {pdfUrl && (
                  <button
                    onClick={downloadPdfFile}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>📥 Download PDF</span>
                  </button>
                )}
              </div>
            </div>

            {/* Generated PDF Result Card with Preview First & Prominent Download Button */}
            {pdfUrl && file && (
              <ToolResultCard
                title="Word to PDF Converted Successfully!"
                filename={`${file.name.replace(/\.[^/.]+$/, '')}.pdf`}
                downloadUrl={pdfUrl}
                fileSize={pdfFileSize}
                badgeText="PDF Generated"
                previewUrl={pdfUrl}
                previewType="pdf"
                details={[
                  { label: 'Total Pages', value: pdfPageCount },
                  { label: 'File Size', value: `${(pdfFileSize / 1024).toFixed(1)} KB` },
                  { label: 'Font Engine', value: fontChoice.toUpperCase() },
                  { label: 'Page Format', value: pageSize }
                ]}
                onReset={() => {
                  setFile(null);
                  setParsedBlocks([]);
                  if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                  setPdfUrl(null);
                }}
                resetButtonText="Convert Another Word Document"
                nextTool={{
                  name: 'Compress PDF',
                  url: '/tools/optimize-pdf/compress-pdf',
                  description: 'Shrink your newly converted PDF file size while keeping high visual clarity.'
                }}
              />
            )}

            {/* Customization & Layout Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                  Page Size
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(e.target.value as any);
                    setTimeout(() => generatePdf(), 50);
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">US Letter (8.5 × 11 in)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                  Margins
                </label>
                <select
                  value={marginOption}
                  onChange={(e) => {
                    setMarginOption(e.target.value as any);
                    setTimeout(() => generatePdf(), 50);
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="normal">Normal (54 pt / 0.75 in)</option>
                  <option value="narrow">Narrow (36 pt / 0.5 in)</option>
                  <option value="wide">Wide (72 pt / 1.0 in)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                  Font Family
                </label>
                <select
                  value={fontChoice}
                  onChange={(e) => {
                    setFontChoice(e.target.value as any);
                    setTimeout(() => generatePdf(), 50);
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="helvetica">Helvetica (Clean Sans)</option>
                  <option value="times">Times Roman (Serif Classic)</option>
                  <option value="courier">Courier (Monospace)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                  Accent Color Theme
                </label>
                <select
                  value={accentColor}
                  onChange={(e) => {
                    setAccentColor(e.target.value as any);
                    setTimeout(() => generatePdf(), 50);
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="indigo">Primary Indigo</option>
                  <option value="slate">Corporate Slate</option>
                  <option value="navy">Executive Navy</option>
                  <option value="emerald">Emerald Clean</option>
                </select>
              </div>

              <div className="col-span-full flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-6 text-xs text-gray-700 dark:text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeHeader}
                      onChange={(e) => {
                        setIncludeHeader(e.target.checked);
                        setTimeout(() => generatePdf(), 50);
                      }}
                      className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                    />
                    <span>Include Header &amp; Title</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePageNumbers}
                      onChange={(e) => {
                        setIncludePageNumbers(e.target.checked);
                        setTimeout(() => generatePdf(), 50);
                      }}
                      className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                    />
                    <span>Include Page Numbers (Page X of Y)</span>
                  </label>
                </div>

                <button
                  onClick={() => generatePdf()}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {isProcessing ? 'Rendering...' : '↻ Re-render PDF'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How to Use Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Convert Word to PDF (.docx to .pdf)
          </h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-slate-300 space-y-3 text-sm">
            <li>
              <strong>Upload Word Document:</strong> Select your Microsoft Word (.docx or .doc) file by clicking &ldquo;Browse Files&rdquo; or dragging it onto the dropzone.
            </li>
            <li>
              <strong>Document Parsing:</strong> The tool extracts paragraphs, bold/italic text styles, structural headings, bullet lists, and tables directly inside your browser using client-side XML decompression.
            </li>
            <li>
              <strong>Customize PDF Settings:</strong> Tailor your preferred page size (A4 or US Letter), margin widths, typography (Helvetica, Times Roman, Courier), and header/footer page numbering.
            </li>
            <li>
              <strong>Review Live PDF Preview:</strong> Inspect your paginated document directly in the interactive live preview pane.
            </li>
            <li>
              <strong>Download PDF:</strong> Click &ldquo;Download PDF&rdquo; to save a vector-sharp, compact PDF document ready for printing, emailing, or archiving.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
