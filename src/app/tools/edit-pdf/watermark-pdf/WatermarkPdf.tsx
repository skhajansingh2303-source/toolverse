'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import ToolResultCard from '@/components/ToolResultCard';

interface WatermarkResult {
  blobUrl: string;
  filename: string;
  size: number;
}

export default function WatermarkPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(50);
  const [opacity, setOpacity] = useState(0.15);
  const [color, setColor] = useState('#808080'); // hex color
  const [position, setPosition] = useState<'center' | 'diagonal' | 'top' | 'bottom'>('diagonal');
  const [applyTo, setApplyTo] = useState<'all' | 'specific'>('all');
  const [specificPages, setSpecificPages] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [watermarkResult, setWatermarkResult] = useState<WatermarkResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      try {
        const bytes = await selectedFile.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        setTotalPages(pdf.getPageCount());
      } catch (err) {
        setError('Could not read the PDF file. It might be corrupted or password protected.');
        setFile(null);
        setTotalPages(0);
      }
    } else if (selectedFile) {
      setError('Please select a valid PDF file.');
    }
  };

  const parsePageRange = (rangeStr: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = rangeStr.split(',').map(p => p.trim()).filter(Boolean);
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(num => parseInt(num, 10));
        if (isNaN(start) || isNaN(end) || start < 1 || end > maxPages || start > end) {
          throw new Error('Invalid page range: ' + part);
        }
        for (let i = start; i <= end; i++) {
          pages.add(i - 1);
        }
      } else {
        const num = parseInt(part, 10);
        if (isNaN(num) || num < 1 || num > maxPages) {
          throw new Error('Invalid page number: ' + part);
        }
        pages.add(num - 1);
      }
    }
    return Array.from(pages);
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0.5, g: 0.5, b: 0.5 };
  };

  const processWatermark = async () => {
    if (!file) return;
    if (!watermarkText.trim()) {
      setError('Please enter text for the watermark.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      let targetPages: number[] = [];
      if (applyTo === 'all') {
        targetPages = Array.from({ length: totalPages }, (_, i) => i);
      } else {
        if (!specificPages.trim()) {
          throw new Error('Please enter specific pages.');
        }
        targetPages = parsePageRange(specificPages, totalPages);
      }

      const { r, g, b } = hexToRgb(color);

      for (const idx of targetPages) {
        if (idx >= 0 && idx < pages.length) {
          const page = pages[idx];
          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
          const textHeight = font.heightAtSize(fontSize);

          let x = (width - textWidth) / 2;
          let y = (height - textHeight) / 2;
          let rotate = degrees(0);

          if (position === 'diagonal') {
            rotate = degrees(45);
            // Rough calculation for diagonal center
            x = width / 2 - (textWidth * Math.cos(Math.PI / 4)) / 2 + (textHeight * Math.sin(Math.PI / 4)) / 2;
            y = height / 2 - (textWidth * Math.sin(Math.PI / 4)) / 2 - (textHeight * Math.cos(Math.PI / 4)) / 2;
          } else if (position === 'top') {
            y = height - textHeight - 40;
          } else if (position === 'bottom') {
            y = 40;
          }

          page.drawText(watermarkText, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(r, g, b),
            opacity: opacity,
            rotate: rotate,
          });
        }
      }

      const modifiedBytes = await pdfDoc.save();
      const blob = new Blob([modifiedBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const downloadFilename = 'watermarked_' + file.name;

      setWatermarkResult({
        blobUrl: url,
        filename: downloadFilename,
        size: blob.size,
      });

      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {}

      setSuccess('Watermark added successfully! Ready to download.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while adding watermark to the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        <nav className="text-sm mb-8 text-gray-500 dark:text-slate-400" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link>
              <svg className="fill-current w-3 h-3 mx-3 text-gray-400 dark:text-slate-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
            </li>
            <li>
              <span className="text-gray-700 dark:text-slate-300 font-medium" aria-current="page">Add Watermark to PDF</span>
            </li>
          </ol>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Add Watermark to PDF</h1>
          <p className="text-gray-600 dark:text-slate-400">Stamp your PDF document with custom text watermarks for security or branding.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sm:p-8 mb-8">
          {!file ? (
            <div
              className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 rounded-2xl p-10 text-center transition-colors group bg-white/50 dark:bg-slate-900/50"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  handleFileSelect(e);
                  e.target.value = '';
                }}
                accept=".pdf,application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title=""
              />
              <div className="pointer-events-none flex flex-col items-center">
                <div className="mx-auto w-12 h-12 text-primary-500 mb-3">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Click or drag a PDF file here</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Add watermark text to your PDF</p>
                <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                  Browse Files
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-200 dark:border-slate-700 mb-6">
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path></svg>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{totalPages} pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setTotalPages(0); }} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium">
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Watermark Text</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Position</label>
                  <select value={position} onChange={(e) => setPosition(e.target.value as any)} className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 outline-none">
                    <option value="diagonal">Diagonal (45°)</option>
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Opacity: {Math.round(opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.01"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-20 cursor-pointer border-0 rounded"
                    />
                    <span className="text-sm text-gray-500 dark:text-slate-400 uppercase">{color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Apply to Pages</label>
                  <div className="flex space-x-4 mb-2">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" checked={applyTo === 'all'} onChange={() => setApplyTo('all')} className="text-primary-600 focus:ring-primary-500 w-4 h-4 mr-2" />
                      <span className="text-gray-700 dark:text-slate-300 text-sm">All</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" checked={applyTo === 'specific'} onChange={() => setApplyTo('specific')} className="text-primary-600 focus:ring-primary-500 w-4 h-4 mr-2" />
                      <span className="text-gray-700 dark:text-slate-300 text-sm">Specific</span>
                    </label>
                  </div>
                  {applyTo === 'specific' && (
                    <input
                      type="text"
                      value={specificPages}
                      onChange={(e) => setSpecificPages(e.target.value)}
                      placeholder="e.g. 1-3, 5"
                      className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-2 text-sm outline-none"
                    />
                  )}
                </div>
              </div>

              {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50">{error}</div>}
              {success && <div className="mb-6 p-4 bg-green-50 dark:bg-emerald-950/40 text-green-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-900/50">{success}</div>}

              <button
                onClick={processWatermark}
                disabled={isProcessing}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-xl px-6 py-3 font-semibold transition-colors flex justify-center items-center"
              >
                {isProcessing ? 'Processing...' : 'Add Watermark'}
              </button>
            </div>
          )}
        </div>

        {/* Result Card with Persistent Download Button */}
        {watermarkResult && (
          <ToolResultCard
            title="Watermark Applied Successfully!"
            filename={watermarkResult.filename}
            downloadUrl={watermarkResult.blobUrl}
            fileSize={watermarkResult.size}
            badgeText="Stamped & Secured"
            details={[
              { label: 'Watermark Text', value: watermarkText },
              { label: 'Applied To', value: applyTo === 'all' ? `All ${totalPages} pages` : 'Selected pages' },
            ]}
            previewUrl={watermarkResult.blobUrl}
            onReset={() => {
              setWatermarkResult(null);
              setFile(null);
              setSuccess('');
            }}
            resetButtonText="Watermark Another PDF"
            nextTool={{
              name: 'Protect with Password',
              url: '/tools/pdf-security/protect-pdf/',
            }}
          />
        )}

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal pl-5 space-y-3 text-gray-600 dark:text-slate-400">
            <li>Select the PDF file you want to watermark.</li>
            <li>Enter your desired watermark text (e.g., &quot;CONFIDENTIAL&quot;, &quot;DRAFT&quot;).</li>
            <li>Customize the position, font size, opacity, and color to suit your needs.</li>
            <li>Choose whether to apply the watermark to all pages or specific pages.</li>
            <li>Click &quot;Add Watermark&quot; to generate and download your updated PDF.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
