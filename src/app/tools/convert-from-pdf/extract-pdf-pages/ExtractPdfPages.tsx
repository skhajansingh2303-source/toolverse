'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';
import RelatedTools from '@/components/RelatedTools';
import ToolResultCard from '@/components/ToolResultCard';

type ExtractMode = 'single-pdf' | 'zip-archive';

export default function ExtractPdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState<string>('');
  const [extractMode, setExtractMode] = useState<ExtractMode>('single-pdf');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [resultFilename, setResultFilename] = useState<string>('');
  const [isZipResult, setIsZipResult] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }

    setError('');
    setSuccess('');
    setFile(uploadedFile);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setTotalPages(count);
      // Select first page by default
      setSelectedPages([1]);
      setRangeInput('1');
    } catch (err: any) {
      setError('Error reading PDF: ' + (err.message || 'File may be corrupted.'));
    }
  };

  // Toggle single page
  const togglePageSelection = (pageNum: number) => {
    let updated: number[];
    if (selectedPages.includes(pageNum)) {
      updated = selectedPages.filter((p) => p !== pageNum);
    } else {
      updated = [...selectedPages, pageNum].sort((a, b) => a - b);
    }
    setSelectedPages(updated);
    setRangeInput(formatPageRanges(updated));
  };

  // Convert array of page numbers to range string (e.g. [1,2,3,5] -> "1-3, 5")
  const formatPageRanges = (pages: number[]): string => {
    if (pages.length === 0) return '';
    const sorted = [...pages].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === prev + 1) {
        prev = sorted[i];
      } else {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
        start = sorted[i];
        prev = sorted[i];
      }
    }
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    return ranges.join(', ');
  };

  // Parse range input from user
  const handleRangeInputChange = (text: string) => {
    setRangeInput(text);
    const parsed = new Set<number>();
    const parts = text.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start > 0 && end <= totalPages && start <= end) {
          for (let i = start; i <= end; i++) {
            parsed.add(i);
          }
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num > 0 && num <= totalPages) {
          parsed.add(num);
        }
      }
    }
    setSelectedPages(Array.from(parsed).sort((a, b) => a - b));
  };

  // Quick Selection Helpers
  const selectAll = () => {
    const all = Array.from({ length: totalPages }, (_, i) => i + 1);
    setSelectedPages(all);
    setRangeInput(`1-${totalPages}`);
  };

  const clearAll = () => {
    setSelectedPages([]);
    setRangeInput('');
  };

  const invertSelection = () => {
    const inverted = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (p) => !selectedPages.includes(p)
    );
    setSelectedPages(inverted);
    setRangeInput(formatPageRanges(inverted));
  };

  const selectOddPages = () => {
    const odd = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p % 2 !== 0);
    setSelectedPages(odd);
    setRangeInput(formatPageRanges(odd));
  };

  const selectEvenPages = () => {
    const even = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p % 2 === 0);
    setSelectedPages(even);
    setRangeInput(formatPageRanges(even));
  };

  // Process Extraction
  const handleExtractPages = async () => {
    if (!file) return;

    if (selectedPages.length === 0) {
      setError('Please select at least one page to extract.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    const baseName = file.name.replace(/\.[^/.]+$/, '');

    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      // OPTION 1: Combine into 1 single PDF
      if (extractMode === 'single-pdf') {
        const newDoc = await PDFDocument.create();
        const pageIndices = selectedPages.map((p) => p - 1);
        const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
        copiedPages.forEach((page) => newDoc.addPage(page));

        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
        const downloadUrl = URL.createObjectURL(blob);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl(downloadUrl);
        setResultSize(blob.size);
        const fname = `${baseName}_extracted_${selectedPages.length}_pages.pdf`;
        setResultFilename(fname);
        setIsZipResult(false);

        setSuccess(`Successfully extracted ${selectedPages.length} pages into a new PDF! Preview ready below.`);
        window.dispatchEvent(
          new CustomEvent('toolsverse-toast', {
            detail: { message: `📄 Extracted ${selectedPages.length} pages! Preview ready below.` },
          })
        );
      }

      // OPTION 2: Separate files in a ZIP archive
      else {
        const zip = new JSZip();
        const folder = zip.folder(`${baseName}_extracted_pages`) || zip;
        const pad = totalPages >= 100 ? 3 : 2;

        for (const pageNum of selectedPages) {
          const singleDoc = await PDFDocument.create();
          const [copiedPage] = await singleDoc.copyPages(srcDoc, [pageNum - 1]);
          singleDoc.addPage(copiedPage);

          const pageBytes = await singleDoc.save();
          const pageStr = String(pageNum).padStart(pad, '0');
          folder.file(`${baseName}_page_${pageStr}.pdf`, pageBytes);
        }

        const zipBlob = await zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        });

        const downloadUrl = URL.createObjectURL(zipBlob);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl(downloadUrl);
        setResultSize(zipBlob.size);
        const fname = `${baseName}_extracted_pages.zip`;
        setResultFilename(fname);
        setIsZipResult(true);

        setSuccess(
          `Successfully saved ${selectedPages.length} individual page files into ZIP archive!`
        );
        window.dispatchEvent(
          new CustomEvent('toolsverse-toast', {
            detail: { message: `📦 Created ZIP archive with ${selectedPages.length} PDF pages!` },
          })
        );
      }
    } catch (err: any) {
      console.error(err);
      setError('Error extracting pages: ' + (err.message || 'Unknown failure.'));
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
            <li className="text-gray-800 dark:text-white font-semibold">Extract PDF Pages</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Extract PDF Pages
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">
            Visually select specific pages or enter page ranges to extract into a new unified PDF or a ZIP package of individual files.
          </p>
        </div>

        {/* AdSlot */}
        <div className="mb-8">
          <AdSlot format="horizontal" />
        </div>

        {/* Workspace */}
        {!file ? (
          /* Upload Dropzone */
          <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-purple-500 bg-white dark:bg-slate-900 rounded-3xl p-12 text-center transition-all group shadow-sm">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                e.target.value = '';
              }}
              title=""
            />
            <div className="pointer-events-none flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                📑
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Upload PDF to Extract Pages
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-md mb-5">
                Drag and drop your document here, or click to choose a multi-page PDF.
              </p>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400 px-2.5 py-1 rounded-lg">
                  Loaded
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {totalPages} total pages
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setTotalPages(0);
                  setSelectedPages([]);
                  setRangeInput('');
                }}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                Change Document
              </button>
            </div>

            {/* Selection & Range Controls */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Range Input & Quick Buttons */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1.5">
                    Page Selection (Ranges or comma-separated list):
                  </label>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => handleRangeInputChange(e.target.value)}
                    placeholder="e.g. 1-3, 5, 8-10"
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-400 mr-1">
                    Quick Select:
                  </span>
                  <button
                    onClick={selectAll}
                    className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={invertSelection}
                    className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200"
                  >
                    Invert
                  </button>
                  <button
                    onClick={selectOddPages}
                    className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200"
                  >
                    Odd Pages
                  </button>
                  <button
                    onClick={selectEvenPages}
                    className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200"
                  >
                    Even Pages
                  </button>
                </div>
              </div>

              {/* Visual Page Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                    Click to Toggle Pages ({selectedPages.length} of {totalPages} selected):
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-80 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-200 dark:border-slate-800">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
                    const isSelected = selectedPages.includes(num);
                    return (
                      <button
                        key={num}
                        onClick={() => togglePageSelection(num)}
                        className={`aspect-3/4 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all relative ${
                          isSelected
                            ? 'bg-purple-600 border-purple-700 text-white shadow-sm scale-105 ring-2 ring-purple-400/50'
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-600'
                        }`}
                      >
                        <span className="text-[10px] opacity-75">Page</span>
                        <span className="text-sm font-black">{num}</span>
                        {isSelected && (
                          <span className="absolute top-1 right-1 text-[11px] leading-none bg-white text-purple-600 rounded-full w-4 h-4 flex items-center justify-center font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Output Mode Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-3">
                  Output Format:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setExtractMode('single-pdf')}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      extractMode === 'single-pdf'
                        ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 dark:border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">📄</span>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        Combine into 1 PDF
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Merges all {selectedPages.length} selected pages in order into a single clean PDF document.
                    </p>
                  </button>

                  <button
                    onClick={() => setExtractMode('zip-archive')}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      extractMode === 'zip-archive'
                        ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 dark:border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">📦</span>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        Separate PDFs in ZIP Archive
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Saves each selected page as an individual PDF file (page_01.pdf, page_02.pdf) inside a ZIP archive.
                    </p>
                  </button>
                </div>
              </div>

              {/* Feedback */}
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

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleExtractPages}
                  disabled={isProcessing || selectedPages.length === 0}
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Extracting Pages...</span>
                    </>
                  ) : (
                    <span>
                      Extract {selectedPages.length} Page{selectedPages.length === 1 ? '' : 's'} Now
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Result Card with Preview First & Download Button */}
        {resultUrl && file && (
          <div className="mt-8">
            <ToolResultCard
              title={isZipResult ? 'ZIP Archive Generated!' : 'Pages Extracted to PDF!'}
              filename={resultFilename}
              downloadUrl={resultUrl}
              fileSize={resultSize}
              badgeText={isZipResult ? 'ZIP Package Ready' : `${selectedPages.length} Pages Extracted`}
              previewUrl={!isZipResult ? resultUrl : undefined}
              previewType={!isZipResult ? 'pdf' : undefined}
              details={[
                { label: 'Original Pages', value: totalPages },
                { label: 'Pages Selected', value: selectedPages.length },
                { label: 'Output Format', value: isZipResult ? 'Individual Files (.zip)' : 'Single Combined PDF' },
              ]}
              onReset={() => {
                if (resultUrl) URL.revokeObjectURL(resultUrl);
                setResultUrl(null);
              }}
              resetButtonText="Extract Different Pages"
              nextTool={{
                name: 'Merge PDF',
                url: '/tools/organize-pdf/merge-pdf',
                description: 'Combine your extracted pages with other PDF files.'
              }}
            />
          </div>
        )}

        {/* How to Use */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">How to Extract Pages from PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Upload Document</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Drop your multi-page PDF file into the upload zone to view all pages.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Select Pages</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Click on the visual page cards or enter page ranges like &quot;1-4, 7, 9&quot; into the input box.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Choose Format</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Choose between combining selected pages into a single PDF or packaging separate PDFs in a ZIP.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Extract & Download</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Click Extract Pages Now to generate and download your extracted files instantaneously.
              </p>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-8">
          <RelatedTools currentSlug="extract-pdf-pages" />
        </div>
      </div>
    </div>
  );
}
