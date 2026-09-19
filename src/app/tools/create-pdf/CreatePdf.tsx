'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

type ElementType =
  | 'heading'
  | 'paragraph'
  | 'two-column'
  | 'bullet-list'
  | 'table'
  | 'image'
  | 'divider'
  | 'signature';

interface DocElement {
  id: string;
  type: ElementType;
  headingLevel?: 'h1' | 'h2' | 'h3';
  headingText?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  paragraphText?: string;
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  colLeft?: string;
  colRight?: string;
  bulletItems?: string[];
  tableData?: string[][];
  imageDataUrl?: string;
  imageWidthPercent?: number;
  dividerThickness?: number;
  signerName?: string;
  signerTitle?: string;
  signatureDataUrl?: string;
  dateStr?: string;
}

const TEMPLATES: Record<string, DocElement[]> = {
  blank: [
    {
      id: '1',
      type: 'heading',
      headingLevel: 'h1',
      headingText: 'Document Title',
      align: 'left',
      color: '#1e293b',
    },
    {
      id: '2',
      type: 'divider',
      dividerThickness: 2,
      color: '#6366f1',
    },
    {
      id: '3',
      type: 'paragraph',
      paragraphText: 'Start drafting your professional document here. You can add more paragraphs, tables, images, two-column layouts, and signatures from the toolbar.',
      fontSize: 11,
      align: 'left',
    },
  ],
  invoice: [
    {
      id: 'inv-1',
      type: 'heading',
      headingLevel: 'h1',
      headingText: 'INVOICE',
      align: 'right',
      color: '#4f46e5',
    },
    {
      id: 'inv-2',
      type: 'two-column',
      colLeft: 'Billed To:\nAcme International Corp\n123 Business Boulevard, Suite 400\ncontact@acme-corp.com',
      colRight: 'Invoice Details:\nInvoice #: INV-2026-089\nIssue Date: September 11, 2026\nPayment Due: Net 30 Days',
    },
    {
      id: 'inv-3',
      type: 'divider',
      dividerThickness: 1,
      color: '#cbd5e1',
    },
    {
      id: 'inv-4',
      type: 'table',
      tableData: [
        ['Item Description', 'Qty', 'Unit Rate', 'Amount'],
        ['Enterprise Platform Subscription', '1', '$1,200.00', '$1,200.00'],
        ['Custom Software API Integration', '20 hrs', '$95.00', '$1,900.00'],
        ['Cloud Infrastructure Management', '1 mo', '$450.00', '$450.00'],
        ['Total Balance Due', '', '', '$3,550.00'],
      ],
    },
    {
      id: 'inv-5',
      type: 'paragraph',
      paragraphText: 'Payment Terms: Please wire funds directly to Bank of ToolsVerse, Routing #021000021, Account #8839201928. Thank you for your business!',
      fontSize: 10,
      italic: true,
      align: 'left',
    },
    {
      id: 'inv-6',
      type: 'signature',
      signerName: 'Alex Morgan',
      signerTitle: 'Chief Financial Officer',
      dateStr: 'September 11, 2026',
    },
  ],
  letter: [
    {
      id: 'let-1',
      type: 'heading',
      headingLevel: 'h2',
      headingText: 'ToolsVerse Global Innovations Ltd.',
      align: 'left',
      color: '#0f172a',
    },
    {
      id: 'let-2',
      type: 'paragraph',
      paragraphText: '100 Silicon Way, Tech District • contact@toolsverse.dev • www.toolsverse.dev',
      fontSize: 9,
      color: '#64748b',
    },
    {
      id: 'let-3',
      type: 'divider',
      dividerThickness: 1,
      color: '#e2e8f0',
    },
    {
      id: 'let-4',
      type: 'paragraph',
      paragraphText: 'September 11, 2026\n\nDear Valued Partner,\n\nWe are pleased to present our official service report for the third quarter. Over the past few months, our unified platform has delivered continuous 99.99% uptime and accelerated processing speeds across all distributed pipelines.\n\nShould you require any supplementary audits or custom enterprise configurations, our dedicated solutions team is available around the clock.',
      fontSize: 11,
      align: 'left',
    },
    {
      id: 'let-5',
      type: 'signature',
      signerName: 'Samantha Vance',
      signerTitle: 'Director of Strategic Partnerships',
      dateStr: 'September 11, 2026',
    },
  ],
};

export default function CreatePdf() {
  const [elements, setElements] = useState<DocElement[]>(TEMPLATES.blank);
  const [paperSize, setPaperSize] = useState<'A4' | 'Letter' | 'Legal'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margins, setMargins] = useState<'compact' | 'normal' | 'wide'>('normal');
  const [docTitle, setDocTitle] = useState('My New Document');

  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [pendingImageElemId, setPendingImageElemId] = useState<string | null>(null);

  // Helper to add a new element
  const addElement = (type: ElementType) => {
    const newId = Date.now().toString();
    let newElem: DocElement = { id: newId, type };

    switch (type) {
      case 'heading':
        newElem = { ...newElem, headingLevel: 'h2', headingText: 'New Section Heading', align: 'left', color: '#1e293b' };
        break;
      case 'paragraph':
        newElem = { ...newElem, paragraphText: 'Enter your text content here. You can customize font size, alignment, and emphasis.', fontSize: 11, align: 'left' };
        break;
      case 'two-column':
        newElem = { ...newElem, colLeft: 'Left column content...', colRight: 'Right column content...' };
        break;
      case 'bullet-list':
        newElem = { ...newElem, bulletItems: ['First key point or takeaway', 'Second important milestone', 'Third deliverable or action item'] };
        break;
      case 'table':
        newElem = {
          ...newElem,
          tableData: [
            ['Header 1', 'Header 2', 'Header 3'],
            ['Row 1, Cell 1', 'Row 1, Cell 2', 'Row 1, Cell 3'],
            ['Row 2, Cell 1', 'Row 2, Cell 2', 'Row 2, Cell 3'],
          ],
        };
        break;
      case 'image':
        newElem = { ...newElem, imageWidthPercent: 60 };
        break;
      case 'divider':
        newElem = { ...newElem, dividerThickness: 1, color: '#cbd5e1' };
        break;
      case 'signature':
        newElem = { ...newElem, signerName: 'John Doe', signerTitle: 'Authorized Representative', dateStr: 'September 11, 2026' };
        break;
    }

    setElements((prev) => [...prev, newElem]);
    setActiveElementId(newId);
  };

  const updateElement = (id: string, updates: Partial<DocElement>) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const removeElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (activeElementId === id) setActiveElementId(null);
  };

  const moveElement = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= elements.length) return;
    const nextList = [...elements];
    const item = nextList.splice(index, 1)[0];
    nextList.splice(targetIdx, 0, item);
    setElements(nextList);
  };

  const loadTemplate = (name: string) => {
    if (TEMPLATES[name]) {
      setElements(JSON.parse(JSON.stringify(TEMPLATES[name])));
      setActiveElementId(null);
      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `Loaded ${name.toUpperCase()} starter template!` },
        })
      );
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pendingImageElemId) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        updateElement(pendingImageElemId, { imageDataUrl: dataUrl });
      };
      reader.readAsDataURL(file);
    }
    setPendingImageElemId(null);
    e.target.value = '';
  };

  // Helper to split text into lines fitting in maxWidth
  const wrapText = (text: string, font: any, fontSize: number, maxWidth: number): string[] => {
    const lines: string[] = [];
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        lines.push('');
        continue;
      }
      const words = paragraph.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
    }

    return lines;
  };

  // Export to PDF using pdf-lib
  const exportToPdf = async () => {
    setIsExporting(true);
    setErrorMsg('');

    try {
      const pdfDoc = await PDFDocument.create();

      // Determine dimensions
      let baseW = 595.28; // A4
      let baseH = 841.89;
      if (paperSize === 'Letter') {
        baseW = 612;
        baseH = 792;
      } else if (paperSize === 'Legal') {
        baseW = 612;
        baseH = 1008;
      }

      const pageWidth = orientation === 'portrait' ? baseW : baseH;
      const pageHeight = orientation === 'portrait' ? baseH : baseW;

      let margin = 40;
      if (margins === 'compact') margin = 24;
      if (margins === 'wide') margin = 60;

      const contentWidth = pageWidth - margin * 2;

      // Embed fonts
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      const checkPageBreak = (neededHeight: number) => {
        if (currentY - neededHeight < margin) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }
      };

      const hexToRgbPdf = (hex?: string) => {
        if (!hex || !hex.startsWith('#') || hex.length < 7) return rgb(0.12, 0.16, 0.23);
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return rgb(r, g, b);
      };

      for (const el of elements) {
        if (el.type === 'heading') {
          const text = el.headingText || 'Heading';
          const size = el.headingLevel === 'h1' ? 22 : el.headingLevel === 'h2' ? 16 : 13;
          const color = hexToRgbPdf(el.color);

          checkPageBreak(size + 16);
          currentY -= 8;

          let xPos = margin;
          const textWidth = fontBold.widthOfTextAtSize(text, size);
          if (el.align === 'center') xPos = margin + (contentWidth - textWidth) / 2;
          if (el.align === 'right') xPos = margin + contentWidth - textWidth;

          currentPage.drawText(text, {
            x: Math.max(margin, xPos),
            y: currentY - size,
            size,
            font: fontBold,
            color,
          });
          currentY -= size + 10;
        } else if (el.type === 'divider') {
          const thick = el.dividerThickness || 1;
          checkPageBreak(thick + 14);
          currentY -= 6;
          currentPage.drawLine({
            start: { x: margin, y: currentY },
            end: { x: margin + contentWidth, y: currentY },
            thickness: thick,
            color: hexToRgbPdf(el.color || '#cbd5e1'),
          });
          currentY -= thick + 10;
        } else if (el.type === 'paragraph') {
          const text = el.paragraphText || '';
          const size = el.fontSize || 11;
          const font = el.bold ? fontBold : el.italic ? fontItalic : fontRegular;
          const lineHeight = size * 1.35;

          const lines = wrapText(text, font, size, contentWidth);
          for (const line of lines) {
            checkPageBreak(lineHeight);
            let xPos = margin;
            if (line.trim().length > 0) {
              const lineWidth = font.widthOfTextAtSize(line, size);
              if (el.align === 'center') xPos = margin + (contentWidth - lineWidth) / 2;
              if (el.align === 'right') xPos = margin + contentWidth - lineWidth;

              currentPage.drawText(line, {
                x: Math.max(margin, xPos),
                y: currentY - size,
                size,
                font,
                color: hexToRgbPdf(el.color || '#334155'),
              });
            }
            currentY -= lineHeight;
          }
          currentY -= 6;
        } else if (el.type === 'two-column') {
          const colWidth = (contentWidth - 24) / 2;
          const leftLines = wrapText(el.colLeft || '', fontRegular, 10, colWidth);
          const rightLines = wrapText(el.colRight || '', fontRegular, 10, colWidth);
          const maxLines = Math.max(leftLines.length, rightLines.length, 1);
          const lineHeight = 14;

          checkPageBreak(maxLines * lineHeight + 12);
          const startY = currentY;

          leftLines.forEach((l, i) => {
            if (l.trim()) {
              currentPage.drawText(l, {
                x: margin,
                y: startY - i * lineHeight - 10,
                size: 10,
                font: fontRegular,
                color: rgb(0.2, 0.25, 0.3),
              });
            }
          });

          rightLines.forEach((r, i) => {
            if (r.trim()) {
              currentPage.drawText(r, {
                x: margin + colWidth + 24,
                y: startY - i * lineHeight - 10,
                size: 10,
                font: fontRegular,
                color: rgb(0.2, 0.25, 0.3),
              });
            }
          });

          currentY = startY - maxLines * lineHeight - 12;
        } else if (el.type === 'bullet-list') {
          const items = el.bulletItems || [];
          for (const it of items) {
            const wrapped = wrapText(it, fontRegular, 10.5, contentWidth - 20);
            for (let i = 0; i < wrapped.length; i++) {
              checkPageBreak(15);
              if (i === 0) {
                currentPage.drawText('•', {
                  x: margin + 4,
                  y: currentY - 10.5,
                  size: 12,
                  font: fontBold,
                  color: rgb(0.3, 0.4, 0.9),
                });
              }
              currentPage.drawText(wrapped[i], {
                x: margin + 18,
                y: currentY - 10.5,
                size: 10.5,
                font: fontRegular,
                color: rgb(0.2, 0.25, 0.3),
              });
              currentY -= 15;
            }
          }
          currentY -= 6;
        } else if (el.type === 'table') {
          const rows = el.tableData || [];
          if (rows.length > 0) {
            const colCount = rows[0].length || 1;
            const colWidth = contentWidth / colCount;
            const rowHeight = 22;

            for (let rIdx = 0; rIdx < rows.length; rIdx++) {
              checkPageBreak(rowHeight + 4);
              const isHeader = rIdx === 0;

              // Row background
              if (isHeader) {
                currentPage.drawRectangle({
                  x: margin,
                  y: currentY - rowHeight,
                  width: contentWidth,
                  height: rowHeight,
                  color: rgb(0.95, 0.96, 0.98),
                  borderColor: rgb(0.8, 0.84, 0.88),
                  borderWidth: 0.5,
                });
              } else {
                currentPage.drawRectangle({
                  x: margin,
                  y: currentY - rowHeight,
                  width: contentWidth,
                  height: rowHeight,
                  color: rIdx % 2 === 1 ? rgb(1, 1, 1) : rgb(0.98, 0.99, 1),
                  borderColor: rgb(0.88, 0.9, 0.93),
                  borderWidth: 0.5,
                });
              }

              // Row cells
              for (let cIdx = 0; cIdx < colCount; cIdx++) {
                const cellText = rows[rIdx][cIdx] || '';
                const font = isHeader ? fontBold : fontRegular;
                const textColor = isHeader ? rgb(0.1, 0.15, 0.25) : rgb(0.2, 0.25, 0.35);

                currentPage.drawText(cellText, {
                  x: margin + cIdx * colWidth + 6,
                  y: currentY - 15,
                  size: isHeader ? 9.5 : 9,
                  font,
                  color: textColor,
                });
              }

              currentY -= rowHeight;
            }
            currentY -= 8;
          }
        } else if (el.type === 'image' && el.imageDataUrl) {
          try {
            const percent = (el.imageWidthPercent || 60) / 100;
            const imgW = contentWidth * percent;
            let img;
            if (el.imageDataUrl.includes('png')) {
              img = await pdfDoc.embedPng(el.imageDataUrl);
            } else {
              img = await pdfDoc.embedJpg(el.imageDataUrl);
            }
            const aspect = img.height / img.width;
            const imgH = imgW * aspect;

            checkPageBreak(imgH + 16);
            currentPage.drawImage(img, {
              x: margin + (contentWidth - imgW) / 2,
              y: currentY - imgH,
              width: imgW,
              height: imgH,
            });
            currentY -= imgH + 14;
          } catch (imgErr) {
            console.warn('Could not embed image:', imgErr);
          }
        } else if (el.type === 'signature') {
          checkPageBreak(65);
          currentY -= 15;
          const sigWidth = 180;
          const sigX = margin + contentWidth - sigWidth;

          // Signature Line
          currentPage.drawLine({
            start: { x: sigX, y: currentY },
            end: { x: sigX + sigWidth, y: currentY },
            thickness: 1,
            color: rgb(0.3, 0.35, 0.4),
          });

          currentPage.drawText(el.signerName || 'Authorized Signer', {
            x: sigX,
            y: currentY - 14,
            size: 10,
            font: fontBold,
            color: rgb(0.1, 0.15, 0.2),
          });

          if (el.signerTitle) {
            currentPage.drawText(el.signerTitle, {
              x: sigX,
              y: currentY - 26,
              size: 8.5,
              font: fontRegular,
              color: rgb(0.4, 0.45, 0.5),
            });
          }

          if (el.dateStr) {
            currentPage.drawText(`Date: ${el.dateStr}`, {
              x: sigX,
              y: currentY - 38,
              size: 8,
              font: fontItalic,
              color: rgb(0.5, 0.55, 0.6),
            });
          }

          currentY -= 50;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docTitle.trim().toLowerCase().replace(/\s+/g, '_') || 'document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: '✨ PDF document generated and downloaded!' },
        })
      );
    } catch (err: any) {
      console.error('Export PDF error:', err);
      setErrorMsg(err.message || 'Failed to export document to PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors">
      {/* Hidden image file input */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/png,image/jpeg,image/webp"
        onChange={handleImageFile}
        className="hidden"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-semibold">Create PDF</span>
        </nav>

        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-600 flex items-center justify-center text-white text-xl shadow-sm">
              🪄
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Create PDF - Online Document Maker & Builder
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            Build and design custom PDF documents from scratch with headings, multi-column sections, bullet lists, tables, logos, and signatures.
          </p>
        </header>

        <AdSlot format="horizontal" />

        {/* Top Control Toolbar & Templates */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-slate-800 shadow-sm mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Title & Document settings */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Document Title"
                className="text-sm font-bold rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 w-48 sm:w-60 focus:ring-2 focus:ring-primary-500"
              />

              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as any)}
                className="text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-2.5"
              >
                <option value="A4">A4 Paper</option>
                <option value="Letter">US Letter</option>
                <option value="Legal">Legal</option>
              </select>

              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                className="text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-2.5"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>

              <select
                value={margins}
                onChange={(e) => setMargins(e.target.value as any)}
                className="text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-2.5"
              >
                <option value="compact">Compact Margins</option>
                <option value="normal">Normal Margins</option>
                <option value="wide">Wide Margins</option>
              </select>
            </div>

            {/* Template Selector & Export Button */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-xs">
                <span className="text-gray-400">Template:</span>
                <button
                  onClick={() => loadTemplate('blank')}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-gray-700 dark:text-slate-200 font-medium"
                >
                  Blank
                </button>
                <button
                  onClick={() => loadTemplate('invoice')}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-gray-700 dark:text-slate-200 font-medium"
                >
                  Invoice
                </button>
                <button
                  onClick={() => loadTemplate('letter')}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-gray-700 dark:text-slate-200 font-medium"
                >
                  Letter
                </button>
              </div>

              <button
                onClick={exportToPdf}
                disabled={isExporting || elements.length === 0}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                {isExporting ? (
                  <>Generating...</>
                ) : (
                  <>📥 Export to PDF</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Add Elements Palette */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 shadow-sm mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase text-gray-400 dark:text-slate-500 mr-2">
            + Add Element:
          </span>
          <button
            onClick={() => addElement('heading')}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
          >
            H Heading
          </button>
          <button
            onClick={() => addElement('paragraph')}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
          >
            ¶ Paragraph
          </button>
          <button
            onClick={() => addElement('two-column')}
            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
          >
            ⚏ 2-Columns
          </button>
          <button
            onClick={() => addElement('bullet-list')}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
          >
            • Bullets
          </button>
          <button
            onClick={() => addElement('table')}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
          >
            ▦ Table
          </button>
          <button
            onClick={() => addElement('image')}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
          >
            🖼️ Image
          </button>
          <button
            onClick={() => addElement('divider')}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
          >
            ― Divider
          </button>
          <button
            onClick={() => addElement('signature')}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
          >
            ✍️ Signature
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Main Work Area: Elements Editor (Left) & Real-Time Sheet Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Elements Editor List (5 columns) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-600 dark:text-slate-400 mb-1">
              <span>Document Elements ({elements.length})</span>
              <span className="text-[11px] font-normal text-gray-400">Click an item to configure</span>
            </div>

            {elements.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 text-center text-xs text-gray-400">
                No elements added yet. Click buttons in the toolbar above to start!
              </div>
            ) : (
              elements.map((el, idx) => {
                const isActive = activeElementId === el.id;

                return (
                  <div
                    key={el.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all shadow-xs ${
                      isActive
                        ? 'border-primary-500 ring-2 ring-primary-500/20 p-4'
                        : 'border-gray-200 dark:border-slate-800 p-3 hover:border-gray-300'
                    }`}
                  >
                    {/* Header bar of element */}
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setActiveElementId(isActive ? null : el.id)}
                        className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white"
                      >
                        <span className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="capitalize">{el.type}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveElement(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-20 text-xs"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveElement(idx, 'down')}
                          disabled={idx === elements.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-20 text-xs"
                          title="Move down"
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => removeElement(el.id)}
                          className="p-1 text-gray-400 hover:text-red-500 text-xs"
                          title="Delete element"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Compact preview or Expanded editor */}
                    {isActive ? (
                      <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-slate-800 text-xs">
                        {/* Heading editor */}
                        {el.type === 'heading' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={el.headingText || ''}
                              onChange={(e) => updateElement(el.id, { headingText: e.target.value })}
                              placeholder="Heading text"
                              className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
                            />
                            <div className="flex items-center gap-2">
                              <select
                                value={el.headingLevel || 'h2'}
                                onChange={(e) => updateElement(el.id, { headingLevel: e.target.value as any })}
                                className="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-xs"
                              >
                                <option value="h1">H1 (Title)</option>
                                <option value="h2">H2 (Section)</option>
                                <option value="h3">H3 (Sub-section)</option>
                              </select>
                              <select
                                value={el.align || 'left'}
                                onChange={(e) => updateElement(el.id, { align: e.target.value as any })}
                                className="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-xs"
                              >
                                <option value="left">Left Align</option>
                                <option value="center">Center Align</option>
                                <option value="right">Right Align</option>
                              </select>
                              <input
                                type="color"
                                value={el.color || '#1e293b'}
                                onChange={(e) => updateElement(el.id, { color: e.target.value })}
                                className="w-8 h-8 rounded border-0 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}

                        {/* Paragraph editor */}
                        {el.type === 'paragraph' && (
                          <div className="space-y-2">
                            <textarea
                              value={el.paragraphText || ''}
                              onChange={(e) => updateElement(el.id, { paragraphText: e.target.value })}
                              rows={4}
                              placeholder="Write your paragraph..."
                              className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                            />
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={el.bold || false}
                                  onChange={(e) => updateElement(el.id, { bold: e.target.checked })}
                                  className="rounded text-primary-600"
                                />
                                <span>Bold</span>
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={el.italic || false}
                                  onChange={(e) => updateElement(el.id, { italic: e.target.checked })}
                                  className="rounded text-primary-600"
                                />
                                <span>Italic</span>
                              </label>
                              <select
                                value={el.fontSize || 11}
                                onChange={(e) => updateElement(el.id, { fontSize: parseInt(e.target.value, 10) })}
                                className="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 text-xs"
                              >
                                <option value="9">9 pt</option>
                                <option value="10">10 pt</option>
                                <option value="11">11 pt</option>
                                <option value="12">12 pt</option>
                                <option value="14">14 pt</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Two Column editor */}
                        {el.type === 'two-column' && (
                          <div className="grid grid-cols-2 gap-2">
                            <textarea
                              value={el.colLeft || ''}
                              onChange={(e) => updateElement(el.id, { colLeft: e.target.value })}
                              rows={3}
                              placeholder="Left Column"
                              className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
                            />
                            <textarea
                              value={el.colRight || ''}
                              onChange={(e) => updateElement(el.id, { colRight: e.target.value })}
                              rows={3}
                              placeholder="Right Column"
                              className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
                            />
                          </div>
                        )}

                        {/* Bullet List editor */}
                        {el.type === 'bullet-list' && (
                          <div className="space-y-2">
                            {(el.bulletItems || []).map((item, bIdx) => (
                              <div key={bIdx} className="flex items-center gap-1.5">
                                <span className="text-gray-400">•</span>
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const next = [...(el.bulletItems || [])];
                                    next[bIdx] = e.target.value;
                                    updateElement(el.id, { bulletItems: next });
                                  }}
                                  className="flex-1 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-xs"
                                />
                                <button
                                  onClick={() => {
                                    const next = (el.bulletItems || []).filter((_, i) => i !== bIdx);
                                    updateElement(el.id, { bulletItems: next });
                                  }}
                                  className="text-gray-400 hover:text-red-500 text-xs px-1"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                updateElement(el.id, {
                                  bulletItems: [...(el.bulletItems || []), 'New bullet item'],
                                });
                              }}
                              className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              + Add Bullet Item
                            </button>
                          </div>
                        )}

                        {/* Table editor */}
                        {el.type === 'table' && (
                          <div className="space-y-2 overflow-x-auto">
                            <div className="space-y-1 min-w-[320px]">
                              {(el.tableData || []).map((row, rIdx) => (
                                <div key={rIdx} className="flex items-center gap-1">
                                  {row.map((cell, cIdx) => (
                                    <input
                                      key={cIdx}
                                      type="text"
                                      value={cell}
                                      onChange={(e) => {
                                        const next = JSON.parse(JSON.stringify(el.tableData || []));
                                        next[rIdx][cIdx] = e.target.value;
                                        updateElement(el.id, { tableData: next });
                                      }}
                                      className={`w-1/3 rounded border p-1 text-[11px] ${
                                        rIdx === 0
                                          ? 'font-bold bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-slate-700'
                                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                                      }`}
                                    />
                                  ))}
                                  {rIdx > 0 && (
                                    <button
                                      onClick={() => {
                                        const next = (el.tableData || []).filter((_, i) => i !== rIdx);
                                        updateElement(el.id, { tableData: next });
                                      }}
                                      className="text-gray-400 hover:text-red-500 text-xs px-1"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => {
                                const current = el.tableData || [];
                                const colCount = current[0]?.length || 3;
                                const newRow = new Array(colCount).fill('Cell data');
                                updateElement(el.id, { tableData: [...current, newRow] });
                              }}
                              className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              + Add Row
                            </button>
                          </div>
                        )}

                        {/* Image element */}
                        {el.type === 'image' && (
                          <div className="space-y-2">
                            {el.imageDataUrl ? (
                              <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={el.imageDataUrl}
                                  alt="Uploaded graphic"
                                  className="h-16 w-24 object-contain rounded border border-gray-200 bg-gray-50"
                                />
                                <button
                                  onClick={() => {
                                    setPendingImageElemId(el.id);
                                    imageInputRef.current?.click();
                                  }}
                                  className="text-xs text-primary-600 hover:underline"
                                >
                                  Replace Image
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setPendingImageElemId(el.id);
                                  imageInputRef.current?.click();
                                }}
                                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-500 hover:border-primary-500"
                              >
                                Upload Logo or Photo
                              </button>
                            )}
                            <div>
                              <label className="text-[11px] text-gray-500 block mb-1">
                                Image Width: {el.imageWidthPercent || 60}%
                              </label>
                              <input
                                type="range"
                                min="20"
                                max="100"
                                value={el.imageWidthPercent || 60}
                                onChange={(e) => updateElement(el.id, { imageWidthPercent: parseInt(e.target.value, 10) })}
                                className="w-full accent-primary-600"
                              />
                            </div>
                          </div>
                        )}

                        {/* Divider element */}
                        {el.type === 'divider' && (
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={el.color || '#cbd5e1'}
                              onChange={(e) => updateElement(el.id, { color: e.target.value })}
                              className="w-8 h-8 rounded border-0 cursor-pointer"
                            />
                            <select
                              value={el.dividerThickness || 1}
                              onChange={(e) => updateElement(el.id, { dividerThickness: parseInt(e.target.value, 10) })}
                              className="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 text-xs"
                            >
                              <option value="1">1 px Thin</option>
                              <option value="2">2 px Medium</option>
                              <option value="3">3 px Thick</option>
                            </select>
                          </div>
                        )}

                        {/* Signature element */}
                        {el.type === 'signature' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={el.signerName || ''}
                              onChange={(e) => updateElement(el.id, { signerName: e.target.value })}
                              placeholder="Signer Full Name"
                              className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
                            />
                            <input
                              type="text"
                              value={el.signerTitle || ''}
                              onChange={(e) => updateElement(el.id, { signerTitle: e.target.value })}
                              placeholder="Designation / Title (e.g. Chief Executive)"
                              className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
                            />
                            <input
                              type="text"
                              value={el.dateStr || ''}
                              onChange={(e) => updateElement(el.id, { dateStr: e.target.value })}
                              placeholder="Date String"
                              className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">
                        {el.type === 'heading' && el.headingText}
                        {el.type === 'paragraph' && el.paragraphText}
                        {el.type === 'two-column' && 'Left & Right column text'}
                        {el.type === 'bullet-list' && `${el.bulletItems?.length || 0} bullet items`}
                        {el.type === 'table' && `${el.tableData?.length || 0} table rows`}
                        {el.type === 'image' && (el.imageDataUrl ? 'Image loaded' : 'Empty image placeholder')}
                        {el.type === 'divider' && 'Horizontal dividing line'}
                        {el.type === 'signature' && `Signed by: ${el.signerName || 'Name'}`}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Live Document Sheet Preview (7 columns) */}
          <div className="lg:col-span-7">
            <div className="sticky top-6">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-600 dark:text-slate-400 mb-2">
                <span>Live Document Sheet Preview</span>
                <span className="text-[11px] font-normal text-gray-400">
                  {paperSize} • {orientation}
                </span>
              </div>

              {/* White Simulated Sheet */}
              <div className="bg-gray-200 dark:bg-slate-900/80 p-4 sm:p-6 rounded-2xl border border-gray-300 dark:border-slate-800 flex justify-center overflow-x-auto">
                <div
                  className={`bg-white text-slate-900 shadow-xl transition-all rounded-sm flex flex-col justify-between ${
                    orientation === 'portrait'
                      ? 'w-full max-w-[540px] min-h-[700px]'
                      : 'w-full max-w-[700px] min-h-[500px]'
                  }`}
                  style={{
                    padding: margins === 'compact' ? '24px' : margins === 'wide' ? '48px' : '36px',
                  }}
                >
                  <div className="space-y-4">
                    {elements.map((el) => {
                      if (el.type === 'heading') {
                        const Tag = el.headingLevel || 'h2';
                        return (
                          <Tag
                            key={el.id}
                            className={`font-bold transition-all ${
                              el.headingLevel === 'h1'
                                ? 'text-2xl font-black'
                                : el.headingLevel === 'h2'
                                ? 'text-lg'
                                : 'text-base font-semibold'
                            } text-${el.align || 'left'}`}
                            style={{ color: el.color || '#1e293b' }}
                          >
                            {el.headingText || 'Heading'}
                          </Tag>
                        );
                      } else if (el.type === 'divider') {
                        return (
                          <hr
                            key={el.id}
                            style={{
                              borderTopWidth: `${el.dividerThickness || 1}px`,
                              borderColor: el.color || '#cbd5e1',
                            }}
                          />
                        );
                      } else if (el.type === 'paragraph') {
                        return (
                          <p
                            key={el.id}
                            className={`leading-relaxed ${el.bold ? 'font-bold' : ''} ${
                              el.italic ? 'italic' : ''
                            } text-${el.align || 'left'}`}
                            style={{
                              fontSize: `${el.fontSize || 11}pt`,
                              color: el.color || '#334155',
                              whiteSpace: 'pre-line',
                            }}
                          >
                            {el.paragraphText}
                          </p>
                        );
                      } else if (el.type === 'two-column') {
                        return (
                          <div key={el.id} className="grid grid-cols-2 gap-6 text-xs text-slate-700">
                            <div className="whitespace-pre-line">{el.colLeft}</div>
                            <div className="whitespace-pre-line">{el.colRight}</div>
                          </div>
                        );
                      } else if (el.type === 'bullet-list') {
                        return (
                          <ul key={el.id} className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                            {(el.bulletItems || []).map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        );
                      } else if (el.type === 'table') {
                        return (
                          <div key={el.id} className="overflow-x-auto my-2">
                            <table className="w-full text-left text-xs border border-slate-200">
                              <tbody>
                                {(el.tableData || []).map((row, rIdx) => (
                                  <tr
                                    key={rIdx}
                                    className={
                                      rIdx === 0
                                        ? 'bg-slate-100 font-bold text-slate-800'
                                        : rIdx % 2 === 1
                                        ? 'bg-white'
                                        : 'bg-slate-50'
                                    }
                                  >
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="p-2 border border-slate-200">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      } else if (el.type === 'image' && el.imageDataUrl) {
                        return (
                          <div key={el.id} className="flex justify-center my-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={el.imageDataUrl}
                              alt="Inserted visual"
                              style={{ width: `${el.imageWidthPercent || 60}%` }}
                              className="rounded object-contain max-h-56"
                            />
                          </div>
                        );
                      } else if (el.type === 'signature') {
                        return (
                          <div key={el.id} className="flex justify-end pt-6">
                            <div className="w-48 text-right border-t border-slate-400 pt-2 text-xs">
                              <p className="font-bold text-slate-900">{el.signerName}</p>
                              {el.signerTitle && <p className="text-slate-500 text-[11px]">{el.signerTitle}</p>}
                              {el.dateStr && <p className="text-slate-400 text-[10px] mt-0.5">Date: {el.dateStr}</p>}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use Create PDF
          </h2>
          <ol className="list-decimal pl-5 space-y-2.5 text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            <li>
              Choose a starting layout by selecting either <strong>Blank</strong> or one of our pre-built templates (<strong>Invoice</strong>, <strong>Business Letter</strong>).
            </li>
            <li>
              Configure paper options like dimensions (<strong>A4, Letter, Legal</strong>), orientation (<strong>Portrait, Landscape</strong>), and margins.
            </li>
            <li>
              Add elements such as headings, rich text paragraphs, multi-column blocks, data tables, images, and signature blocks from the toolbar.
            </li>
            <li>
              Review the live responsive sheet preview and click <strong>&quot;Export to PDF&quot;</strong> to generate and download your crisp, paginated document.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
