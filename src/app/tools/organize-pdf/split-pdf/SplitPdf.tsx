'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';
import ToolResultCard from '@/components/ToolResultCard';

interface SplitResult {
  blobUrl: string;
  filename: string;
  size: number;
  description: string;
  isZip: boolean;
}

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState<string>('');
  const [mode, setMode] = useState<'extract' | 'all'>('extract');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [splitResult, setSplitResult] = useState<SplitResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.endsWith('.pdf')) {
      setError('Please upload a valid PDF file.');
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
      // Default select first page
      setSelectedPages([1]);
      setRangeInput('1');
    } catch (err: any) {
      setError('Could not read PDF: ' + (err.message || 'File may be corrupted or password protected.'));
    }
  };

  const togglePageSelection = (pageNum: number) => {
    let updated: number[];
    if (selectedPages.includes(pageNum)) {
      updated = selectedPages.filter((p) => p !== pageNum);
    } else {
      updated = [...selectedPages, pageNum].sort((a, b) => a - b);
    }
    setSelectedPages(updated);
    setRangeInput(updated.join(', '));
  };

  const selectAll = () => {
    const all = Array.from({ length: totalPages }, (_, i) => i + 1);
    setSelectedPages(all);
    setRangeInput(`1-${totalPages}`);
  };

  const clearSelection = () => {
    setSelectedPages([]);
    setRangeInput('');
  };

  const handleRangeInputChange = (input: string) => {
    setRangeInput(input);
    const parsed: number[] = [];
    const parts = input.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start > 0 && end <= totalPages && start <= end) {
          for (let i = start; i <= end; i++) {
            if (!parsed.includes(i)) parsed.push(i);
          }
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num > 0 && num <= totalPages) {
          if (!parsed.includes(num)) parsed.push(num);
        }
      }
    }
    setSelectedPages(parsed.sort((a, b) => a - b));
  };

  const processSplit = async () => {
    if (!file) return;

    if (mode === 'extract' && selectedPages.length === 0) {
      setError('Please select at least one page to extract.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      if (mode === 'extract') {
        const newDoc = await PDFDocument.create();
        const pageIndices = selectedPages.map((p) => p - 1);
        const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
        copiedPages.forEach((page) => newDoc.addPage(page));

        const newBytes = await newDoc.save();
        const blob = new Blob([newBytes as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const downloadFilename = `extracted_pages_${selectedPages.join('_')}.pdf`;

        setSplitResult({
          blobUrl: url,
          filename: downloadFilename,
          size: blob.size,
          description: `${selectedPages.length} Pages Extracted`,
          isZip: false,
        });

        try {
          const a = document.createElement('a');
          a.href = url;
          a.download = downloadFilename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (e) {}

        setSuccess(`Successfully extracted ${selectedPages.length} pages into a single PDF.`);
      } else {
        // Split each page individually and pack into a single organized ZIP archive
        const zip = new JSZip();
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const folder = zip.folder(baseName) || zip;
        const pad = totalPages >= 100 ? 3 : 2;

        for (let i = 0; i < totalPages; i++) {
          const singleDoc = await PDFDocument.create();
          const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
          singleDoc.addPage(copiedPage);

          const pageBytes = await singleDoc.save();
          const pageNum = String(i + 1).padStart(pad, '0');
          folder.file(`${baseName}_page_${pageNum}.pdf`, pageBytes);
        }

        const zipBlob = await zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        });

        const url = URL.createObjectURL(zipBlob);
        const downloadFilename = `${baseName}_all_${totalPages}_pages.zip`;

        setSplitResult({
          blobUrl: url,
          filename: downloadFilename,
          size: zipBlob.size,
          description: `All ${totalPages} Pages in ZIP`,
          isZip: true,
        });

        try {
          const a = document.createElement('a');
          a.href = url;
          a.download = downloadFilename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (e) {}

        setSuccess(`Successfully generated ZIP archive containing all ${totalPages} separate PDF pages!`);
      }
    } catch (err: any) {
      setError('Error while processing: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span className="mx-2 text-gray-300 dark:text-slate-600">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Split PDF</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              ✂️
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              Split PDF &amp; Extract Pages
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Visually select pages to extract into a new document or split every page into standalone files. 100% private in-browser tool.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Interactive Page Selector
        </span>
      </div>

      <AdSlot format="horizontal" />

      {/* File Upload Screen */}
      {!file ? (
        <div
          className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-3xl p-12 text-center bg-white dark:bg-slate-900 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-all mb-8 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title=""
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              e.target.value = '';
            }}
          />
          <div className="pointer-events-none flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 mx-auto flex items-center justify-center text-3xl mb-4 shadow-xs">
              📑
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
              Choose a PDF file to split
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-4">
              Upload your multi-page PDF document to visually pick pages or specify extraction ranges.
            </p>
            <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
              Select PDF
            </span>
          </div>
        </div>
      ) : (
        /* Document Control Center */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  Loaded
                </span>
                <h3 className="text-sm font-bold text-gray-900 truncate max-w-sm">
                  {file.name}
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {totalPages} total pages
              </p>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setTotalPages(0);
                setSelectedPages([]);
              }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              Choose Different File
            </button>
          </div>

          {/* Mode Selection Toggle */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              onClick={() => setMode('extract')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'extract'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              Extract Selected Pages
            </button>
            <button
              onClick={() => setMode('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'all'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              Split Every Page ({totalPages} files)
            </button>
          </div>

          {mode === 'extract' && (
            <div className="mb-6 space-y-4">
              {/* Range Input & Quick Buttons */}
              <div className="bg-gray-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Page Range or List (e.g. 1-3, 5, 8-10):
                  </label>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => handleRangeInputChange(e.target.value)}
                    placeholder="e.g. 1-3, 5"
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4 md:pt-0">
                  <button
                    onClick={selectAll}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              {/* Visual Page Tiles Grid */}
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-3">
                  Click any page to toggle selection ({selectedPages.length} selected):
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-72 overflow-y-auto p-3 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border border-gray-200/60 dark:border-slate-700">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
                    const isSelected = selectedPages.includes(num);
                    return (
                      <button
                        key={num}
                        onClick={() => togglePageSelection(num)}
                        className={`aspect-3/4 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all relative ${
                          isSelected
                            ? 'bg-orange-500 border-orange-600 text-white shadow-xs scale-105'
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-orange-300'
                        }`}
                      >
                        <span className="text-[10px] opacity-75">Page</span>
                        <span className="text-sm font-black">{num}</span>
                        {isSelected && (
                          <span className="absolute top-1 right-1 text-[10px] leading-none">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-4 mb-4 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-4 mb-4 flex items-center gap-2">
              <span>✓</span>
              <span>{success}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
            <button
              onClick={processSplit}
              disabled={isProcessing || (mode === 'extract' && selectedPages.length === 0)}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-40"
            >
              {isProcessing
                ? 'Processing Document...'
                : mode === 'extract'
                ? `Extract ${selectedPages.length} Pages Now`
                : `Split into ${totalPages} Separate PDFs`}
            </button>
          </div>
        </div>
      )}

      {/* Result Card with Persistent Download Button */}
      {splitResult && (
        <ToolResultCard
          title="PDF Split Completed Successfully!"
          filename={splitResult.filename}
          downloadUrl={splitResult.blobUrl}
          fileSize={splitResult.size}
          badgeText="Ready to Download"
          details={[
            { label: 'Mode', value: mode === 'extract' ? 'Selected Pages' : 'All Pages (ZIP)' },
            { label: 'Output Details', value: splitResult.description },
          ]}
          previewUrl={!splitResult.isZip ? splitResult.blobUrl : undefined}
          onReset={() => {
            setSplitResult(null);
            setFile(null);
            setSelectedPages([]);
            setSuccess('');
          }}
          resetButtonText="Split Another PDF"
          nextTool={{
            name: 'Merge Extracted PDFs',
            url: '/tools/organize-pdf/merge-pdf/',
          }}
        />
      )}

      {/* Explanation Guide */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 mb-2">How to Extract Pages from a PDF</h2>
        <ol className="list-decimal list-inside space-y-1.5 text-xs text-gray-600 leading-relaxed">
          <li>Upload your multi-page PDF document.</li>
          <li>Click the visual page tiles or type a range like &ldquo;1-3, 5, 8&rdquo; into the range input box.</li>
          <li>Choose whether to combine selected pages into one file or split each page into a standalone download.</li>
          <li>Click the extraction button to generate your clean PDF document instantly.</li>
        </ol>
      </div>
    </div>
  );
}
