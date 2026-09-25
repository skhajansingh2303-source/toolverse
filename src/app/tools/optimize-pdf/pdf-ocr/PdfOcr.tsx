'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import AdSlot from '@/components/AdSlot';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface PageOcrResult {
  pageNum: number;
  text: string;
  previewUrl: string;
}

export default function PdfOcr() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [contrastBoost, setContrastBoost] = useState(true);
  const [language, setLanguage] = useState<'eng' | 'spa' | 'fra' | 'deu'>('eng');
  const [ocrResults, setOcrResults] = useState<PageOcrResult[]>([]);
  const [editableText, setEditableText] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'preview'>('text');
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [tesseractLoaded, setTesseractLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).pdfjsLib) setPdfjsLoaded(true);
      if ((window as any).Tesseract) setTesseractLoaded(true);
    }
  }, []);

  const handlePdfjsLoad = () => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfjsLoaded(true);
    }
  };

  const handleTesseractLoad = () => {
    if (typeof window !== 'undefined' && (window as any).Tesseract) {
      setTesseractLoaded(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setOcrResults([]);
      setEditableText('');
      setErrorMsg('');
      setProgressPercent(0);
      setProgressText('');
    }
  };

  // Contrast enhancement & Otsu-style threshold pre-processor
  const enhanceCanvasContrast = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Calculate luminance histogram
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      histogram[gray]++;
    }

    // Otsu method for optimal thresholding
    let total = canvas.width * canvas.height;
    let sum = 0;
    for (let t = 0; t < 256; t++) sum += t * histogram[t];

    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let varMax = 0;
    let threshold = 128;

    for (let t = 0; t < 256; t++) {
      wB += histogram[t];
      if (wB === 0) continue;
      wF = total - wB;
      if (wF === 0) break;

      sumB += t * histogram[t];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;

      const varBetween = wB * wF * (mB - mF) * (mB - mF);
      if (varBetween > varMax) {
        varMax = varBetween;
        threshold = t;
      }
    }

    // Apply high-contrast binarization / sharpening
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      // Boost contrast curve around threshold
      const val = gray < threshold ? Math.max(0, gray * 0.4) : Math.min(255, gray * 1.2 + 30);
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  };

  // Fallback pattern/contour heuristic text analyzer if Tesseract CDN is unreachable
  const analyzeCanvasGlyphsFallback = (canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'Scanned document page processed.';

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const w = canvas.width;
    const h = canvas.height;

    // Scan horizontal lines for text-like row density
    const rowDensity: number[] = new Array(h).fill(0);
    for (let y = 0; y < h; y++) {
      let darkCount = 0;
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        if (brightness < 160) darkCount++;
      }
      rowDensity[y] = darkCount;
    }

    // Find bands of text lines
    const textBands: { start: number; end: number; density: number }[] = [];
    let inBand = false;
    let bandStart = 0;
    let bandSum = 0;

    for (let y = 0; y < h; y++) {
      if (rowDensity[y] > w * 0.02) {
        if (!inBand) {
          inBand = true;
          bandStart = y;
          bandSum = rowDensity[y];
        } else {
          bandSum += rowDensity[y];
        }
      } else {
        if (inBand) {
          inBand = false;
          if (y - bandStart > 6) {
            textBands.push({
              start: bandStart,
              end: y,
              density: bandSum / (y - bandStart),
            });
          }
        }
      }
    }

    if (textBands.length === 0) {
      return '[No clear text contours detected. Ensure page has sufficient resolution and contrast.]';
    }

    return `[Recognized ${textBands.length} line segments across scanned document via contour analysis.]\n` +
      textBands.map((band, i) => `Line ${i + 1}: [Text line at Y:${band.start}-${band.end}px, density: ${Math.round(band.density)}px]`).join('\n');
  };

  const runOcr = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg('');
    setOcrResults([]);
    setEditableText('');
    setProgressPercent(5);
    setProgressText('Preparing document...');

    try {
      const results: PageOcrResult[] = [];
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

      if (isPdf) {
        if (!(window as any).pdfjsLib) {
          throw new Error('PDF processing library is loading. Please wait 2 seconds and try again.');
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;

        for (let i = 1; i <= numPages; i++) {
          setProgressText(`Rendering page ${i} of ${numPages}...`);
          setProgressPercent(Math.round(10 + ((i - 1) / numPages) * 80));

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // High-res for OCR accuracy

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          await page.render({ canvasContext: ctx, viewport }).promise;

          if (contrastBoost) {
            setProgressText(`Enhancing contrast for page ${i}...`);
            enhanceCanvasContrast(canvas);
          }

          const previewUrl = canvas.toDataURL('image/jpeg', 0.85);

          setProgressText(`Recognizing text glyphs on page ${i}...`);
          let recognized = '';

          if ((window as any).Tesseract) {
            try {
              const ocrRes = await (window as any).Tesseract.recognize(canvas, language, {
                logger: (m: any) => {
                  if (m.status === 'recognizing text' && m.progress) {
                    setProgressPercent(Math.round(10 + ((i - 1 + m.progress) / numPages) * 80));
                  }
                },
              });
              recognized = ocrRes.data.text.trim();
            } catch (tessErr) {
              console.warn('Tesseract fallback triggered:', tessErr);
              recognized = analyzeCanvasGlyphsFallback(canvas);
            }
          } else {
            recognized = analyzeCanvasGlyphsFallback(canvas);
          }

          results.push({
            pageNum: i,
            text: recognized || `[No text detected on Page ${i}]`,
            previewUrl,
          });
        }
      } else {
        // Document image (PNG, JPG, WebP)
        setProgressText('Loading document image...');
        setProgressPercent(20);

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image file'));
          img.src = objectUrl;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          if (contrastBoost) {
            setProgressText('Enhancing contrast & contours...');
            enhanceCanvasContrast(canvas);
          }
        }

        const previewUrl = canvas.toDataURL('image/jpeg', 0.85);
        setProgressText('Recognizing characters and words...');
        setProgressPercent(60);

        let recognized = '';
        if ((window as any).Tesseract) {
          try {
            const ocrRes = await (window as any).Tesseract.recognize(canvas, language);
            recognized = ocrRes.data.text.trim();
          } catch (tessErr) {
            console.warn('Tesseract fallback:', tessErr);
            recognized = analyzeCanvasGlyphsFallback(canvas);
          }
        } else {
          recognized = analyzeCanvasGlyphsFallback(canvas);
        }

        results.push({
          pageNum: 1,
          text: recognized || '[No text detected in image]',
          previewUrl,
        });

        URL.revokeObjectURL(objectUrl);
      }

      setOcrResults(results);
      const combinedText = results
        .map((r) => (results.length > 1 ? `--- Page ${r.pageNum} ---\n${r.text}` : r.text))
        .join('\n\n');
      setEditableText(combinedText);
      setProgressPercent(100);
      setProgressText('OCR Recognition complete!');

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `⚡ OCR recognized text across ${results.length} page(s)!` },
        })
      );
    } catch (err: any) {
      console.error('OCR Error:', err);
      setErrorMsg(err.message || 'Failed to complete OCR recognition.');
    } finally {
      setIsProcessing(false);
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

  // Generate Searchable PDF with embedded text layer
  const generateSearchablePdf = async () => {
    if (!file || ocrResults.length === 0) return;
    setIsGeneratingPdf(true);
    setErrorMsg('');

    try {
      let pdfDoc: PDFDocument;
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

      if (isPdf) {
        const arrayBuffer = await file.arrayBuffer();
        pdfDoc = await PDFDocument.load(arrayBuffer);
      } else {
        // Generate new PDF from image
        pdfDoc = await PDFDocument.create();
        const imgBytes = await file.arrayBuffer();
        let embeddedImg;
        if (file.type.includes('png') || file.name.toLowerCase().endsWith('.png')) {
          embeddedImg = await pdfDoc.embedPng(imgBytes);
        } else {
          embeddedImg = await pdfDoc.embedJpg(imgBytes);
        }
        const imgDims = embeddedImg.scale(1);
        const page = pdfDoc.addPage([imgDims.width, imgDims.height]);
        page.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: imgDims.width,
          height: imgDims.height,
        });
      }

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      ocrResults.forEach((res, idx) => {
        if (idx < pages.length) {
          const page = pages[idx];
          const { width, height } = page.getSize();
          const lines = res.text.split('\n').filter((l) => l.trim().length > 0);

          const fontSize = 10;
          const lineHeight = 14;
          let currentY = height - 40;

          // Embed invisible searchable text layer
          lines.forEach((line) => {
            if (currentY > 40) {
              const safeText = line.replace(/[^\x20-\x7E]/g, ' ');
              try {
                page.drawText(safeText, {
                  x: 40,
                  y: currentY,
                  size: fontSize,
                  font,
                  color: rgb(0, 0, 0),
                  opacity: 0.01, // Invisible overlay allows search & selection without obscuring scan
                });
              } catch {
                // Ignore glyph encoding issues on unusual characters
              }
              currentY -= lineHeight;
            }
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace(/\.[^/.]+$/, '')}_searchable.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

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
    }
  };

  const wordCount = editableText
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const charCount = editableText.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={handlePdfjsLoad}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"
        onLoad={handleTesseractLoad}
      />

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
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              PDF OCR - Recognize Text from Scanned PDF
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            Extract and recognize text from scanned PDFs and document images with free browser-based OCR. Generate searchable PDFs with selectable text layers.
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
                Upload Scanned PDF or Document Image
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                Supports Scanned PDF, PNG, JPG, and WebP documents
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
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Document'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setFile(null);
                    setOcrResults([]);
                    setEditableText('');
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 transition-colors"
                >
                  Change File
                </button>
                <button
                  onClick={runOcr}
                  disabled={isProcessing}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-xl px-5 py-2 text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Recognizing...
                    </>
                  ) : (
                    <>⚡ Run OCR Recognition</>
                  )}
                </button>
              </div>
            </div>

            {/* OCR Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 dark:text-slate-300 mb-1.5">
                  Recognition Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="eng">English (Latin Latin-1)</option>
                  <option value="spa">Spanish (Español)</option>
                  <option value="fra">French (Français)</option>
                  <option value="deu">German (Deutsch)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 dark:text-slate-300 mb-1.5">
                  Contrast Preprocessing
                </label>
                <button
                  type="button"
                  onClick={() => setContrastBoost(!contrastBoost)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-colors ${
                    contrastBoost
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300'
                      : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  <span>Auto Contrast & Binarization</span>
                  <span className="text-sm">{contrastBoost ? '✅ Enabled' : '⚪ Off'}</span>
                </button>
              </div>

              <div className="sm:col-span-2 md:col-span-1 flex flex-col justify-end">
                <div className="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-3 border border-gray-200 dark:border-slate-700 text-[11px] text-gray-500 dark:text-slate-400">
                  ⚡ Client-side OCR runs 100% in your browser. No files are uploaded to external servers.
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="mt-6 p-4 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/50">
                <div className="flex justify-between text-xs font-semibold text-cyan-900 dark:text-cyan-200 mb-1.5">
                  <span>{progressText}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-cyan-200 dark:bg-cyan-900/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
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
                        onClick={() => setActiveTab('text')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          activeTab === 'text'
                            ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-900'
                        }`}
                      >
                        Recognized Text ({wordCount} words)
                      </button>
                      <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          activeTab === 'preview'
                            ? 'bg-white dark:bg-slate-700 dark:text-white shadow-xs'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-900'
                        }`}
                      >
                        Scan Previews ({ocrResults.length})
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
                      💾 Download .txt
                    </button>
                    <button
                      onClick={generateSearchablePdf}
                      disabled={isGeneratingPdf}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      {isGeneratingPdf ? (
                        <>Embedding Text Layer...</>
                      ) : (
                        <>✨ Generate Searchable PDF</>
                      )}
                    </button>
                  </div>
                </div>

                {activeTab === 'text' ? (
                  <div>
                    <div className="relative">
                      <textarea
                        value={editableText}
                        onChange={(e) => setEditableText(e.target.value)}
                        rows={16}
                        className="w-full font-mono text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 p-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Recognized OCR text will appear here..."
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500 mt-2">
                      <span>You can edit or correct the recognized text directly above before exporting.</span>
                      <span>{charCount} characters • {wordCount} words</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {ocrResults.map((item) => (
                      <div
                        key={item.pageNum}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-950 p-2"
                      >
                        <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-1 px-1 flex justify-between">
                          <span>Page {item.pageNum}</span>
                          <span>{item.text.split(/\s+/).filter(Boolean).length} words</span>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.previewUrl}
                          alt={`Page ${item.pageNum} scan preview`}
                          className="w-full h-48 object-contain rounded-lg bg-white border border-gray-100 dark:border-slate-800"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* How to Use */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use PDF OCR
          </h2>
          <ol className="list-decimal pl-5 space-y-2.5 text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            <li>
              Upload your scanned PDF document or image file (PNG, JPG, WebP) into the dropzone.
            </li>
            <li>
              Select your document language and keep contrast enhancement enabled for optimal character recognition.
            </li>
            <li>
              Click <strong>&quot;Run OCR Recognition&quot;</strong> to scan all pages client-side using browser OCR.
            </li>
            <li>
              Review the extracted text in the editable editor, copy or download it as <code>.txt</code>, or click <strong>&quot;Generate Searchable PDF&quot;</strong> to embed an invisible text layer back onto your document.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
