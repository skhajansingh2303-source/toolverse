'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import AdSlot from '@/components/AdSlot';
import ToolResultCard from '@/components/ToolResultCard';
import RelatedTools from '@/components/RelatedTools';
import {
  PDFDocument,
  StandardFonts,
  TextRenderingMode,
  setTextRenderingMode,
  beginText,
  endText,
  showText,
  setFontAndSize,
  setTextMatrix,
  pushGraphicsState,
  popGraphicsState,
  rgb,
} from 'pdf-lib';

interface OcrLineData {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

interface PageOcrResult {
  pageNum: number;
  text: string;
  previewUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  lines: OcrLineData[];
}

interface GeneratedPdfResult {
  blobUrl: string;
  filename: string;
  size: number;
  mode?: 'searchable' | 'readable';
}

const SUPPORTED_LANGUAGES = [
  { code: 'eng', label: 'English (Default)' },
  { code: 'spa', label: 'Spanish (Español)' },
  { code: 'fra', label: 'French (Français)' },
  { code: 'deu', label: 'German (Deutsch)' },
  { code: 'ita', label: 'Italian (Italiano)' },
  { code: 'por', label: 'Portuguese (Português)' },
  { code: 'hin', label: 'Hindi (हिन्दी)' },
];

// Strictly encode characters supported by Helvetica, safely substituting smart quotes & unicode
function safeEncodeForFont(font: any, text: string): string {
  let res = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    try {
      font.encodeText(ch);
      res += ch;
    } catch {
      if (ch === '’' || ch === '‘') res += "'";
      else if (ch === '“' || ch === '”') res += '"';
      else if (ch === '—' || ch === '–') res += '-';
      else if (ch === '…') res += '...';
      else if (ch === '₹') res += 'Rs.';
      else res += ' ';
    }
  }
  return res.replace(/\s+/g, ' ').trim();
}

// Wrap text to fit page width for clean readable PDF generation
function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    if (!word) continue;
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    let width = 0;
    try {
      width = font.widthOfTextAtSize(testLine, fontSize);
    } catch {
      width = testLine.length * fontSize * 0.55;
    }
    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function extractLinesFromOcr(data: any): OcrLineData[] {
  const resultLines: OcrLineData[] = [];

  // Extract from words first (most granular coordinates for instant word search)
  if (Array.isArray(data?.words) && data.words.length > 0) {
    for (const w of data.words) {
      if (w && typeof w.text === 'string' && w.text.trim().length > 0) {
        resultLines.push({
          text: w.text.trim(),
          bbox: {
            x0: w.bbox?.x0 ?? 0,
            y0: w.bbox?.y0 ?? 0,
            x1: w.bbox?.x1 ?? 0,
            y1: w.bbox?.y1 ?? 0,
          },
        });
      }
    }
  }

  // If words array was not populated, fallback to lines
  if (resultLines.length === 0) {
    const rawLines: any[] = [];
    if (Array.isArray(data?.lines) && data.lines.length > 0) {
      rawLines.push(...data.lines);
    } else if (Array.isArray(data?.blocks)) {
      for (const block of data.blocks) {
        if (Array.isArray(block?.paragraphs)) {
          for (const para of block.paragraphs) {
            if (Array.isArray(para?.lines)) {
              for (const line of para.lines) {
                rawLines.push(line);
              }
            }
          }
        }
      }
    }

    for (const l of rawLines) {
      if (l && typeof l.text === 'string' && l.text.trim().length > 0) {
        // Also check if line has words inside it
        if (Array.isArray(l.words) && l.words.length > 0) {
          for (const w of l.words) {
            if (w && typeof w.text === 'string' && w.text.trim().length > 0) {
              resultLines.push({
                text: w.text.trim(),
                bbox: {
                  x0: w.bbox?.x0 ?? l.bbox?.x0 ?? 0,
                  y0: w.bbox?.y0 ?? l.bbox?.y0 ?? 0,
                  x1: w.bbox?.x1 ?? l.bbox?.x1 ?? 0,
                  y1: w.bbox?.y1 ?? l.bbox?.y1 ?? 0,
                },
              });
            }
          }
        } else {
          resultLines.push({
            text: l.text.trim(),
            bbox: {
              x0: l.bbox?.x0 ?? 0,
              y0: l.bbox?.y0 ?? 0,
              x1: l.bbox?.x1 ?? 0,
              y1: l.bbox?.y1 ?? 0,
            },
          });
        }
      }
    }
  }

  return resultLines;
}

export default function PdfOcr() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfGeneratingType, setPdfGeneratingType] = useState<'searchable' | 'readable' | null>(null);
  const [progressStatus, setProgressStatus] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [contrastBoost, setContrastBoost] = useState(true);
  const [language, setLanguage] = useState<string>('eng');
  const [ocrResults, setOcrResults] = useState<PageOcrResult[]>([]);
  const [editableText, setEditableText] = useState('');
  const [activeTab, setActiveTab] = useState<'interactive' | 'text'>('interactive');
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchablePdfResult, setSearchablePdfResult] = useState<GeneratedPdfResult | null>(null);
  const [searchVerifyQuery, setSearchVerifyQuery] = useState('');
  const [pageCount, setPageCount] = useState<number>(0);
  const [maxPagesLimit, setMaxPagesLimit] = useState<number>(0); // 0 means all

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setOcrResults([]);
      setEditableText('');
      setErrorMsg('');
      setProgressPercent(0);
      setProgressStatus('');
      setSearchablePdfResult(null);
      setSearchVerifyQuery('');
      setMaxPagesLimit(0);

      if (selected.type === 'application/pdf' || selected.name.toLowerCase().endsWith('.pdf')) {
        try {
          const arrayBuffer = await selected.arrayBuffer();
          const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          setPageCount(doc.getPageCount());
        } catch {
          setPageCount(1);
        }
      } else {
        setPageCount(1);
      }
    }
  };

  // Google Drive Style: Auto-jump to matching page when searching
  useEffect(() => {
    if (!searchVerifyQuery || !searchVerifyQuery.trim() || ocrResults.length === 0) return;
    const q = searchVerifyQuery.toLowerCase().trim();
    const foundIdx = ocrResults.findIndex(
      (page) =>
        page.text.toLowerCase().includes(q) ||
        page.lines.some((l) => l.text.toLowerCase().includes(q))
    );
    if (foundIdx !== -1 && foundIdx !== selectedPageIndex) {
      setSelectedPageIndex(foundIdx);
    }
  }, [searchVerifyQuery, ocrResults, selectedPageIndex]);

  // Safe contrast & luminance normalization (non-destructive grayscale curve)
  const normalizeCanvasContrast = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let minLum = 255;
    let maxLum = 0;

    // First pass: find luminance range
    for (let i = 0; i < data.length; i += 16) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;
    }

    if (maxLum - minLum < 30) return canvas;

    const range = maxLum - minLum;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const normalized = Math.min(255, Math.max(0, ((gray - minLum) / range) * 255));
      data[i] = normalized;
      data[i + 1] = normalized;
      data[i + 2] = normalized;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  };

  const cancelOcr = () => {
    isCancelledRef.current = true;
    setIsProcessing(false);
    setProgressStatus('OCR stopped by user.');
  };

  const runOcr = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg('');
    setOcrResults([]);
    setEditableText('');
    setProgressPercent(3);
    setProgressStatus('Connecting to fast in-browser OCR engine...');
    setSearchablePdfResult(null);
    isCancelledRef.current = false;

    let worker: any = null;

    try {
      const { createWorker } = await import('tesseract.js');

      // Use same-origin assets (/tesseract/*) so Brave Shields & adblockers NEVER block it
      worker = await createWorker(language, 1, {
        workerPath: '/tesseract/worker.min.js',
        corePath: '/tesseract/tesseract-core-simd-lstm.wasm.js',
        langPath: '/tesseract',
        workerBlobURL: false,
        logger: (m) => {
          if (m.status === 'loading language traineddata') {
            const p = Math.round((m.progress || 0) * 100);
            setProgressStatus(`Loading ${language.toUpperCase()} OCR dictionary (${p}%)...`);
            setProgressPercent(3 + Math.round((m.progress || 0) * 7));
          } else if (m.status === 'initializing tesseract' || m.status === 'initializing api') {
            setProgressStatus('Preparing OCR recognition engine...');
            setProgressPercent(10);
          }
        },
      });

      if (isCancelledRef.current) {
        await worker.terminate();
        return;
      }

      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const accumulatedResults: PageOcrResult[] = [];

      if (isPdf) {
        setProgressStatus('Reading PDF pages in browser memory...');
        setProgressPercent(12);

        let pdfjsLib: any = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.4.168'}/pdf.worker.min.mjs`;
        } else {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalDocPages = pdf.numPages;
        const targetPages = maxPagesLimit > 0 ? Math.min(maxPagesLimit, totalDocPages) : totalDocPages;

        const renderScale = 1.75;

        for (let i = 1; i <= targetPages; i++) {
          if (isCancelledRef.current) break;

          const basePercent = 12 + Math.round(((i - 1) / targetPages) * 85);
          setProgressPercent(basePercent);
          setProgressStatus(`Page ${i} of ${targetPages}: Analyzing text layers & layout...`);

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: renderScale });

          // Google Drive Strategy: Check if page already contains native digital text
          const textContent = await page.getTextContent();
          const nativeLines: OcrLineData[] = [];

          if (textContent && Array.isArray(textContent.items) && textContent.items.length > 0) {
            for (const item of textContent.items as any[]) {
              const fullStr = (item.str || '').trim();
              if (!fullStr) continue;
              const [vx, vy] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
              const fontHeight = Math.abs(item.transform[0] || item.transform[3] || 12);
              const height = Math.max(12, (item.height || fontHeight) * renderScale);
              const totalWidth = Math.max(12, (item.width || 0) * renderScale);

              // Break item into individual words for precise word-level search matching
              const words = fullStr.split(/\s+/).filter(Boolean);
              if (words.length > 1) {
                let currentWordX = vx;
                const charWidth = totalWidth / Math.max(1, fullStr.length);
                for (const w of words) {
                  const wWidth = Math.max(8, w.length * charWidth);
                  nativeLines.push({
                    text: w,
                    bbox: {
                      x0: Math.max(0, currentWordX),
                      y0: Math.max(0, vy - height),
                      x1: Math.min(viewport.width, currentWordX + wWidth),
                      y1: Math.min(viewport.height, vy),
                    },
                  });
                  currentWordX += (w.length + 1) * charWidth;
                }
              } else {
                nativeLines.push({
                  text: fullStr,
                  bbox: {
                    x0: Math.max(0, vx),
                    y0: Math.max(0, vy - height),
                    x1: Math.min(viewport.width, vx + totalWidth),
                    y1: Math.min(viewport.height, vy),
                  },
                });
              }
            }
          }

          const nativeWordCount = nativeLines.reduce(
            (acc, l) => acc + l.text.split(/\s+/).filter(Boolean).length,
            0
          );

          // Render canvas for visual preview and OCR fallback
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          await page.render({ canvasContext: ctx!, viewport }).promise;

          let finalLines: OcrLineData[] = [];
          let finalText = '';

          if (nativeWordCount >= 10) {
            // High-fidelity native digital text present (100% accuracy, zero OCR typos)
            finalLines = nativeLines;
            finalText = nativeLines.map((l) => l.text).join('\n');
            setProgressStatus(`Page ${i} of ${targetPages}: Extracted ${nativeWordCount} native words.`);
          } else {
            // Scanned image or low-text PDF — run high-resolution Tesseract OCR
            if (contrastBoost) {
              normalizeCanvasContrast(canvas);
            }

            setProgressStatus(`Page ${i} of ${targetPages}: Scanning text glyphs with OCR engine...`);
            const ocrRes = await worker.recognize(canvas);
            const ocrLines = extractLinesFromOcr(ocrRes.data);
            const ocrText = ocrRes.data.text.trim();

            if (nativeLines.length > 0) {
              finalLines = [...nativeLines, ...ocrLines];
              finalText = `${nativeLines.map((l) => l.text).join('\n')}\n${ocrText}`.trim();
            } else {
              finalLines = ocrLines;
              finalText = ocrText;
            }
          }

          const previewUrl = canvas.toDataURL('image/jpeg', 0.85);

          const pageResult: PageOcrResult = {
            pageNum: i,
            text: finalText || `[No readable text detected on Page ${i}]`,
            previewUrl,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            lines: finalLines,
          };

          accumulatedResults.push(pageResult);

          // Stream live progress and live text so the user sees results immediately
          setOcrResults([...accumulatedResults]);
          const currentCombined = accumulatedResults
            .map((r) => (targetPages > 1 ? `--- Page ${r.pageNum} ---\n${r.text}` : r.text))
            .join('\n\n');
          setEditableText(currentCombined);

          const stepDonePercent = 12 + Math.round((i / targetPages) * 85);
          setProgressPercent(stepDonePercent);
        }
      } else {
        // Document image (PNG, JPG, WebP)
        setProgressStatus('Loading document image...');
        setProgressPercent(15);

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image file. Please check the image format.'));
          img.src = objectUrl;
        });

        let targetWidth = img.naturalWidth || img.width;
        let targetHeight = img.naturalHeight || img.height;
        const maxDim = 2400;
        if (targetWidth > maxDim || targetHeight > maxDim) {
          if (targetWidth > targetHeight) {
            targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
            targetWidth = maxDim;
          } else {
            targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
            targetHeight = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          if (contrastBoost) {
            setProgressStatus('Enhancing contrast & sharpness...');
            normalizeCanvasContrast(canvas);
          }
        }

        const previewUrl = canvas.toDataURL('image/jpeg', 0.85);
        setProgressStatus('Recognizing text glyphs with Tesseract...');
        setProgressPercent(50);

        const ocrRes = await worker.recognize(canvas);
        const rawText = ocrRes.data.text.trim();
        const linesData: OcrLineData[] = extractLinesFromOcr(ocrRes.data);

        const pageResult: PageOcrResult = {
          pageNum: 1,
          text: rawText || '[No readable text detected in document image]',
          previewUrl,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          lines: linesData,
        };

        accumulatedResults.push(pageResult);
        setOcrResults([...accumulatedResults]);
        setEditableText(rawText);
        URL.revokeObjectURL(objectUrl);
      }

      await worker.terminate();
      worker = null;

      if (accumulatedResults.length === 0) {
        throw new Error('No pages could be recognized.');
      }

      setProgressPercent(100);
      setProgressStatus(`OCR complete! Recognized text across ${accumulatedResults.length} page(s).`);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `⚡ OCR recognized text across ${accumulatedResults.length} page(s)!` },
        })
      );
    } catch (err: any) {
      console.error('OCR Error:', err);
      if (worker) {
        try { await worker.terminate(); } catch {}
      }
      setErrorMsg(err.message || 'Failed to complete OCR recognition. Please check your internet connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate real Searchable PDF using official PDF ISO 32000-1 TextRenderingMode 3 (Invisible)
  // This produces invisible, fully selectable & Ctrl+F searchable text in Chrome, Acrobat, Edge, Firefox & Preview
  const generateSearchablePdf = async () => {
    if (!file || ocrResults.length === 0) return;
    setIsGeneratingPdf(true);
    setPdfGeneratingType('searchable');
    setErrorMsg('');

    try {
      let pdfDoc: PDFDocument;
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

      if (isPdf) {
        const arrayBuffer = await file.arrayBuffer();
        pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      } else {
        pdfDoc = await PDFDocument.create();
        // Convert any photo/image (JPEG, PNG, WebP, AVIF) to clean standard JPEG
        const img = new Image();
        const objUrl = URL.createObjectURL(file);
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image format'));
          img.src = objUrl;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        URL.revokeObjectURL(objUrl);

        const binStr = atob(dataUrl.split(',')[1]);
        const imgBytes = new Uint8Array(binStr.length);
        for (let k = 0; k < binStr.length; k++) {
          imgBytes[k] = binStr.charCodeAt(k);
        }

        const embeddedImg = await pdfDoc.embedJpg(imgBytes);
        const page = pdfDoc.addPage([canvas.width, canvas.height]);
        page.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: canvas.width,
          height: canvas.height,
        });
      }

      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      ocrResults.forEach((res, pageIdx) => {
        if (pageIdx >= pages.length) return;
        const page = pages[pageIdx];
        const { width: pdfWidth, height: pdfHeight } = page.getSize();

        const scaleX = pdfWidth / res.canvasWidth;
        const scaleY = pdfHeight / res.canvasHeight;

        // Register font dictionary in page resources
        const fontKey = page.node.newFontDictionary(helveticaFont.name, helveticaFont.ref);
        const rawFontKey = fontKey.asString().replace(/^\//, '');

        const textOps: any[] = [
          beginText(),
          setTextRenderingMode(TextRenderingMode.Invisible),
        ];

        if (res.lines && res.lines.length > 0) {
          for (const line of res.lines) {
            const cleanText = safeEncodeForFont(helveticaFont, line.text);
            if (!cleanText) continue;

            const boxHeight = (line.bbox.y1 - line.bbox.y0) * scaleY;
            const fontSize = Math.max(6, Math.min(48, boxHeight * 0.75));
            const x = Math.max(0, line.bbox.x0 * scaleX);
            const y = Math.max(0, pdfHeight - (line.bbox.y1 * scaleY) + (boxHeight * 0.18));

            try {
              textOps.push(
                setFontAndSize(rawFontKey, fontSize),
                setTextMatrix(1, 0, 0, 1, x, y),
                showText(helveticaFont.encodeText(cleanText))
              );
            } catch {
              // Ignore single glyph edge cases
            }
          }
        } else {
          const lines = res.text.split('\n').filter((l) => l.trim().length > 0);
          let currentY = pdfHeight - 35;
          for (const line of lines) {
            if (currentY < 35) break;
            const cleanText = safeEncodeForFont(helveticaFont, line);
            if (cleanText) {
              try {
                textOps.push(
                  setFontAndSize(rawFontKey, 10),
                  setTextMatrix(1, 0, 0, 1, 35, currentY),
                  showText(helveticaFont.encodeText(cleanText))
                );
              } catch {}
            }
            currentY -= 14;
          }
        }

        textOps.push(endText());
        page.pushOperators(...textOps);
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const filename = `${file.name.replace(/\.[^/.]+$/, '')}_searchable.pdf`;

      setSearchablePdfResult({
        blobUrl: url,
        filename,
        size: blob.size,
        mode: 'searchable',
      });

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: '📄 Searchable PDF generated & downloaded!' },
        })
      );
    } catch (err: any) {
      console.error('Searchable PDF error:', err);
      setErrorMsg(err.message || 'Could not generate searchable PDF.');
    } finally {
      setIsGeneratingPdf(false);
      setPdfGeneratingType(null);
    }
  };

  // Generate a crystal-clear, readable PDF document with formatted extracted text
  const generateReadableTextPdf = async () => {
    if (!editableText || ocrResults.length === 0) return;
    setIsGeneratingPdf(true);
    setPdfGeneratingType('readable');
    setErrorMsg('');

    try {
      const pdfDoc = await PDFDocument.create();
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 595.28; // Standard A4 width
      const pageHeight = 841.89; // Standard A4 height
      const margin = 50;
      const contentWidth = pageWidth - margin * 2;
      const footerY = 32;

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;
      let pageNum = 1;

      const drawHeaderFooter = (page: any, pNum: number) => {
        page.drawText('OCR Extracted Document — Toolsverse', {
          x: margin,
          y: pageHeight - 32,
          size: 8,
          font: helvetica,
          color: rgb(0.5, 0.5, 0.5),
        });
        page.drawLine({
          start: { x: margin, y: pageHeight - 38 },
          end: { x: pageWidth - margin, y: pageHeight - 38 },
          thickness: 0.5,
          color: rgb(0.85, 0.85, 0.85),
        });

        const pText = `Page ${pNum}`;
        const pWidth = helvetica.widthOfTextAtSize(pText, 9);
        page.drawText(pText, {
          x: pageWidth - margin - pWidth,
          y: footerY,
          size: 9,
          font: helvetica,
          color: rgb(0.5, 0.5, 0.5),
        });
      };

      drawHeaderFooter(currentPage, pageNum);
      currentY = pageHeight - 65;

      const title = file ? `OCR Transcribed: ${file.name.replace(/\.[^/.]+$/, '')}` : 'OCR Transcribed Document';
      const safeTitle = safeEncodeForFont(helveticaBold, title);
      currentPage.drawText(safeTitle, {
        x: margin,
        y: currentY,
        size: 13,
        font: helveticaBold,
        color: rgb(0.12, 0.16, 0.22),
      });
      currentY -= 24;

      for (let rIdx = 0; rIdx < ocrResults.length; rIdx++) {
        const pRes = ocrResults[rIdx];

        if (ocrResults.length > 1) {
          if (currentY < margin + 60) {
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            pageNum++;
            drawHeaderFooter(currentPage, pageNum);
            currentY = pageHeight - 65;
          }

          currentPage.drawRectangle({
            x: margin,
            y: currentY - 18,
            width: contentWidth,
            height: 22,
            color: rgb(0.93, 0.95, 0.98),
          });

          const sectionTitle = `Original Scan Page ${pRes.pageNum}`;
          currentPage.drawText(safeEncodeForFont(helveticaBold, sectionTitle), {
            x: margin + 8,
            y: currentY - 12,
            size: 9.5,
            font: helveticaBold,
            color: rgb(0.15, 0.35, 0.65),
          });
          currentY -= 30;
        }

        const paragraphs = pRes.text.split('\n');
        for (const para of paragraphs) {
          const trimmed = para.trim();
          if (!trimmed) {
            currentY -= 8;
            continue;
          }

          const safePara = safeEncodeForFont(helvetica, trimmed);
          const wrapped = wrapText(safePara, helvetica, 10, contentWidth);

          for (const line of wrapped) {
            if (currentY < margin + 35) {
              currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
              pageNum++;
              drawHeaderFooter(currentPage, pageNum);
              currentY = pageHeight - 65;
            }

            currentPage.drawText(line, {
              x: margin,
              y: currentY,
              size: 10,
              font: helvetica,
              color: rgb(0.15, 0.15, 0.15),
            });
            currentY -= 14;
          }
          currentY -= 5;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const filename = `${file?.name.replace(/\.[^/.]+$/, '') || 'document'}_readable.pdf`;

      setSearchablePdfResult({
        blobUrl: url,
        filename,
        size: blob.size,
        mode: 'readable',
      });

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: '📖 Clean Readable PDF generated & downloaded!' },
        })
      );
    } catch (err: any) {
      console.error('Readable PDF Error:', err);
      setErrorMsg(err.message || 'Could not generate readable PDF.');
    } finally {
      setIsGeneratingPdf(false);
      setPdfGeneratingType(null);
    }
  };

  const copyToClipboard = () => {
    if (!editableText) return;
    navigator.clipboard.writeText(editableText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: '📋 Recognized text copied to clipboard!' },
        })
      );
    });
  };

  const downloadTxt = () => {
    if (!editableText) return;
    const blob = new Blob([editableText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace(/\.[^/.]+$/, '') || 'document'}_ocr.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadDoc = () => {
    if (!editableText) return;
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>OCR Document</title><style>body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; }</style></head>
      <body>${editableText.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')}</body></html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace(/\.[^/.]+$/, '') || 'document'}_ocr.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const wordCount = editableText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = editableText.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors">
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" strategy="afterInteractive" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="text-sm mb-6 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-semibold">PDF OCR</span>
        </nav>

        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-700 flex items-center justify-center text-white text-xl shadow-sm">
              👁️
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                PDF OCR — Optical Character Recognition
              </h1>
              <p className="text-xs text-primary-600 dark:text-primary-400 font-bold mt-0.5">
                Make Scanned PDFs Readable, Selectable &amp; Searchable
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            Extract high-precision text from scanned PDF contracts, receipts, book pages, and images. Generates 100% searchable PDFs with matching interactive text layers.
          </p>
        </header>

        <AdSlot format="horizontal" />

        {/* Upload Zone */}
        {!file ? (
          <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-3xl p-10 text-center transition-colors group bg-white dark:bg-slate-900 shadow-sm mb-8 mt-6">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => {
                handleFileUpload(e);
                e.target.value = '';
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title=""
            />
            <div className="pointer-events-none flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center text-3xl text-cyan-600 dark:text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
                📄
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
                Choose Scanned PDF or Document Image
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                Drag and drop your document here (PDF, PNG, JPG, or WebP)
              </p>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm mb-8 mt-6">
            {/* File info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xl font-bold">
                  {file.name.endsWith('.pdf') ? 'PDF' : 'IMG'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {pageCount > 0 ? `${pageCount} page(s)` : file.type || 'Document'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isProcessing ? (
                  <button
                    onClick={cancelOcr}
                    className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    ⏹ Stop OCR
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setFile(null);
                        setOcrResults([]);
                        setEditableText('');
                        setSearchablePdfResult(null);
                      }}
                      className="text-xs font-semibold text-gray-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 transition-colors"
                    >
                      Change File
                    </button>
                    <button
                      onClick={runOcr}
                      className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-5 py-2.5 text-xs font-bold transition-all active:scale-95 flex items-center gap-2 shadow-md"
                    >
                      ⚡ Start OCR Recognition
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* OCR Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 dark:text-slate-300 mb-1.5">
                  Document Language
                </label>
                <select
                  value={language}
                  disabled={isProcessing}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 dark:text-slate-300 mb-1.5">
                  Page Processing Range
                </label>
                <select
                  value={maxPagesLimit}
                  disabled={isProcessing || pageCount <= 1}
                  onChange={(e) => setMaxPagesLimit(Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <option value={0}>All Pages ({pageCount > 0 ? `${pageCount} pages` : 'Entire Document'})</option>
                  {pageCount > 1 && <option value={1}>First Page Only (Fast preview)</option>}
                  {pageCount > 3 && <option value={3}>First 3 Pages</option>}
                  {pageCount > 5 && <option value={5}>First 5 Pages</option>}
                  {pageCount > 10 && <option value={10}>First 10 Pages</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 dark:text-slate-300 mb-1.5">
                  Contrast Preprocessing
                </label>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setContrastBoost(!contrastBoost)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-colors disabled:opacity-50 ${
                    contrastBoost
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300'
                      : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  <span>Auto Luminance Stretch</span>
                  <span className="text-sm">{contrastBoost ? '✅ Enabled' : '⚪ Off'}</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="mt-6 p-4 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/50 animate-pulse">
                <div className="flex justify-between text-xs font-semibold text-cyan-900 dark:text-cyan-200 mb-1.5">
                  <span className="truncate pr-2">{progressStatus}</span>
                  <span className="shrink-0">{progressPercent}%</span>
                </div>
                <div className="w-full bg-cyan-200 dark:bg-cyan-900/60 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-cyan-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Results Section */}
            {ocrResults.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
                {/* Result header / Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-xl bg-gray-100 dark:bg-slate-800 p-1 text-xs">
                      <button
                        onClick={() => setActiveTab('interactive')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                          activeTab === 'interactive'
                            ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-900'
                        }`}
                      >
                        <span>🔍 Interactive View (Google Drive Style)</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('text')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                          activeTab === 'text'
                            ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-900'
                        }`}
                      >
                        <span>📝 Text Editor ({wordCount} words)</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      {copied ? '✅ Copied' : '📋 Copy Text'}
                    </button>
                    <button
                      onClick={downloadTxt}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      💾 Text (.txt)
                    </button>
                    <button
                      onClick={downloadDoc}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      📄 Word (.doc)
                    </button>
                    <button
                      onClick={generateReadableTextPdf}
                      disabled={isGeneratingPdf}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      title="Download a crisp, typed PDF document with standard margins and headers"
                    >
                      {isGeneratingPdf && pdfGeneratingType === 'readable' ? (
                        <>Formatting PDF...</>
                      ) : (
                        <>📖 Clean Readable PDF</>
                      )}
                    </button>
                    <button
                      onClick={generateSearchablePdf}
                      disabled={isGeneratingPdf}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      title="Download original scan with standard invisible OCR text layer (Ctrl+F searchable)"
                    >
                      {isGeneratingPdf && pdfGeneratingType === 'searchable' ? (
                        <>Embedding Layer...</>
                      ) : (
                        <>✨ Searchable PDF (Scan+OCR)</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Instant Search in Recognized Text with Visual Match Counter */}
                <div className="mb-4 flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-xs shadow-xs">
                  <span className="text-gray-500 font-bold shrink-0">🔍 Search Document:</span>
                  <input
                    type="text"
                    value={searchVerifyQuery}
                    onChange={(e) => setSearchVerifyQuery(e.target.value)}
                    placeholder="Type any word to find and highlight live on the document..."
                    className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {searchVerifyQuery && (
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-800 text-[11px]">
                        {
                          (editableText.toLowerCase().match(new RegExp(searchVerifyQuery.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
                        }{' '}
                        match(es)
                      </span>
                      <button
                        onClick={() => setSearchVerifyQuery('')}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {activeTab === 'interactive' ? (
                  <div>
                    {/* Interactive Viewer Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-slate-300">
                          Page {selectedPageIndex + 1} of {ocrResults.length}
                        </span>
                        {ocrResults.length > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              disabled={selectedPageIndex === 0}
                              onClick={() => setSelectedPageIndex((p) => Math.max(0, p - 1))}
                              className="px-2 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 rounded disabled:opacity-40"
                            >
                              ◀ Prev
                            </button>
                            <button
                              disabled={selectedPageIndex === ocrResults.length - 1}
                              onClick={() => setSelectedPageIndex((p) => Math.min(ocrResults.length - 1, p + 1))}
                              className="px-2 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 rounded disabled:opacity-40"
                            >
                              Next ▶
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-gray-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                        <span>💡 Drag cursor over text on the page to select &amp; copy • Words highlight live</span>
                      </div>
                    </div>

                    {/* Page Document with HTML5 Text Selection Overlay (Google Drive architecture) */}
                    {ocrResults[selectedPageIndex] && (
                      <div className="relative mx-auto max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-800 overflow-hidden select-text">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ocrResults[selectedPageIndex].previewUrl}
                          alt={`Page ${ocrResults[selectedPageIndex].pageNum} scan`}
                          className="w-full h-auto block select-none pointer-events-none"
                          draggable={false}
                        />

                        {/* Real HTML5 Text Layer */}
                        <div
                          className="absolute inset-0 select-text cursor-text overflow-hidden"
                          style={{
                            userSelect: 'text',
                            WebkitUserSelect: 'text',
                          }}
                        >
                          {ocrResults[selectedPageIndex].lines && ocrResults[selectedPageIndex].lines.length > 0 ? (
                            ocrResults[selectedPageIndex].lines.map((line, lIdx) => {
                              const left = (line.bbox.x0 / ocrResults[selectedPageIndex].canvasWidth) * 100;
                              const top = (line.bbox.y0 / ocrResults[selectedPageIndex].canvasHeight) * 100;
                              const width = ((line.bbox.x1 - line.bbox.x0) / ocrResults[selectedPageIndex].canvasWidth) * 100;
                              const height = ((line.bbox.y1 - line.bbox.y0) / ocrResults[selectedPageIndex].canvasHeight) * 100;

                              const isMatch = Boolean(
                                searchVerifyQuery &&
                                searchVerifyQuery.trim().length > 0 &&
                                line.text.toLowerCase().includes(searchVerifyQuery.toLowerCase().trim())
                              );

                              return (
                                <span
                                  key={lIdx}
                                  className={`absolute transition-all select-text ${
                                    isMatch
                                      ? 'bg-amber-300 dark:bg-amber-400 ring-2 ring-amber-600 rounded-xs shadow-sm z-10'
                                      : 'hover:bg-blue-400/20'
                                  }`}
                                  style={{
                                    left: `${left}%`,
                                    top: `${top}%`,
                                    width: `${Math.max(1.2, width)}%`,
                                    height: `${Math.max(1.4, height)}%`,
                                    color: isMatch ? '#78350f' : 'transparent',
                                    fontWeight: isMatch ? 'bold' : 'normal',
                                    fontSize: 'clamp(9px, 1.2vw, 16px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    whiteSpace: 'nowrap',
                                    lineHeight: '1',
                                    pointerEvents: 'auto',
                                  }}
                                  title={line.text}
                                >
                                  {line.text}
                                </span>
                              );
                            })
                          ) : (
                            <div className="absolute inset-x-0 bottom-4 p-3 bg-black/60 text-white text-xs text-center">
                              Text recognized ({ocrResults[selectedPageIndex].text.split(/\s+/).filter(Boolean).length} words). Switch to Text Editor tab to view and copy.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Page Thumbnail Selector for multi-page documents */}
                    {ocrResults.length > 1 && (
                      <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2">
                        {ocrResults.map((item, idx) => (
                          <button
                            key={item.pageNum}
                            onClick={() => setSelectedPageIndex(idx)}
                            className={`shrink-0 rounded-xl p-1 border transition-all text-center ${
                              selectedPageIndex === idx
                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 ring-2 ring-primary-500'
                                : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-70 hover:opacity-100'
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.previewUrl}
                              alt={`Thumbnail page ${item.pageNum}`}
                              className="w-16 h-20 object-contain rounded-lg bg-gray-50"
                            />
                            <span className="block text-[10px] font-bold text-gray-700 dark:text-slate-300 mt-1">
                              Page {item.pageNum}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <textarea
                        value={editableText}
                        onChange={(e) => setEditableText(e.target.value)}
                        rows={16}
                        className="w-full font-mono text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 p-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 leading-relaxed"
                        placeholder="Recognized OCR text will appear here..."
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400 dark:text-slate-500 mt-2">
                      <span>You can edit or correct the recognized text directly above before exporting.</span>
                      <span>{charCount} characters • {wordCount} words</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Result Card if Searchable or Readable PDF was generated */}
        {searchablePdfResult && (
          <div className="mb-8">
            <ToolResultCard
              title={
                searchablePdfResult.mode === 'readable'
                  ? 'Clean Readable PDF Created Successfully!'
                  : 'Searchable PDF Created Successfully!'
              }
              filename={searchablePdfResult.filename}
              downloadUrl={searchablePdfResult.blobUrl}
              fileSize={searchablePdfResult.size}
              originalSize={file?.size}
              badgeText={
                searchablePdfResult.mode === 'readable'
                  ? 'Clean Typed PDF Document'
                  : 'Searchable & Selectable Text (ISO Mode 3)'
              }
              details={[
                { label: 'Pages Recognized', value: `${ocrResults.length} page(s)` },
                { label: 'Words Extracted', value: `${wordCount} words` },
                {
                  label: 'Document Type',
                  value:
                    searchablePdfResult.mode === 'readable'
                      ? 'Clean Typed Typography Document (A4)'
                      : 'Standard Invisible OCR Layer (ISO 32000-1)',
                },
                { label: 'Compatibility', value: 'Adobe Acrobat, Chrome, Preview & Edge' },
              ]}
              previewUrl={searchablePdfResult.blobUrl}
              previewType="pdf"
              onReset={() => {
                setSearchablePdfResult(null);
              }}
              resetButtonText="Back to OCR Editor"
              nextTool={{
                name: 'Compress PDF',
                url: '/tools/optimize-pdf/compress-pdf/',
                description: 'Compress and shrink your newly created searchable PDF.',
              }}
              suggestedTools={[
                { name: 'Compress PDF', url: '/tools/optimize-pdf/compress-pdf/', icon: '🗜️', badge: 'Optimize' },
                { name: 'Sign PDF', url: '/tools/pdf-security/sign-pdf/', icon: '✍️', badge: 'E-Sign' },
                { name: 'Protect PDF', url: '/tools/pdf-security/protect-pdf/', icon: '🔒', badge: 'Security' },
                { name: 'Merge PDF', url: '/tools/organize-pdf/merge-pdf/', icon: '📎', badge: 'Combine' },
              ]}
            />
          </div>
        )}

        {/* How to Use */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sm:p-8 mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Make Scanned PDFs Readable &amp; Searchable
          </h2>
          <ol className="list-decimal pl-5 space-y-2.5 text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            <li>
              <strong>Upload Your Scanned Document:</strong> Choose any non-searchable PDF, scan, or photo (PNG, JPG, WebP).
            </li>
            <li>
              <strong>Choose Recognition Language &amp; Range:</strong> Select your language and optionally choose to process all pages or preview the first few pages.
            </li>
            <li>
              <strong>Click &quot;Start OCR Recognition&quot;:</strong> Fast in-browser Tesseract WebAssembly engine processes each page and streams recognized text live to your screen.
            </li>
            <li>
              <strong>Search, Copy or Edit:</strong> Review extracted text, search words live, or make quick edits directly in the text editor.
            </li>
            <li>
              <strong>Generate Searchable PDF:</strong> Download your original document with an embedded, invisible text layer so you can select and search text with <code>Ctrl+F</code> / <code>Cmd+F</code> in any PDF reader.
            </li>
          </ol>
        </section>

        <RelatedTools currentSlug="pdf-ocr" />
      </div>
    </div>
  );
}
