'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import AdSlot from '@/components/AdSlot';
import RelatedTools from '@/components/RelatedTools';
import ToolResultCard from '@/components/ToolResultCard';

interface PdfItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: number | null;
}

interface MergeResult {
  blobUrl: string;
  filename: string;
  size: number;
  pageCount: number;
}

export default function MergePdf() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputName, setOutputName] = useState('merged_document.pdf');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const processFiles = async (newFiles: File[]) => {
    const pdfFiles = newFiles.filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (pdfFiles.length === 0) {
      setError('Please provide valid .pdf files.');
      return;
    }
    setError('');

    const newItems: PdfItem[] = [];
    for (const file of pdfFiles) {
      const item: PdfItem = {
        id: Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        size: file.size,
        pages: null,
      };
      newItems.push(item);
    }

    setItems((prev) => [...prev, ...newItems]);

    // Inspect page counts asynchronously in background
    for (const item of newItems) {
      try {
        const buffer = await item.file.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = doc.getPageCount();
        setItems((current) =>
          current.map((it) => (it.id === item.id ? { ...it, pages: count } : it))
        );
      } catch {
        // Continue if unreadable
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setItems(updated);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalPagesEstimate = items.reduce((acc, item) => acc + (item.pages || 0), 0);
  const totalBytes = items.reduce((acc, item) => acc + item.size, 0);

  const mergePdfs = async () => {
    if (items.length < 2) {
      setError('Please upload at least 2 PDF documents to combine.');
      return;
    }

    setIsMerging(true);
    setProgress(10);
    setError('');
    setSuccess('');

    try {
      const mergedPdf = await PDFDocument.create();
      let step = 0;

      for (const item of items) {
        const bytes = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));

        step++;
        setProgress(Math.round(10 + (step / items.length) * 80));
      }

      setProgress(95);
      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const downloadFilename = outputName.endsWith('.pdf') ? outputName : `${outputName}.pdf`;

      // Store persistent result so the download button and preview remain active
      setMergeResult({
        blobUrl: url,
        filename: downloadFilename,
        size: blob.size,
        pageCount: mergedPdf.getPageCount(),
      });

      // Auto trigger download
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        // Fallback to manual download button if popup blocked
      }

      setProgress(100);
      setSuccess(
        `Merged successfully! Created "${downloadFilename}" with ${mergedPdf.getPageCount()} pages.`
      );
    } catch (err: any) {
      console.error(err);
      setError('Failed to merge documents: ' + (err.message || 'Please check if any PDF is corrupted.'));
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-medium text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-900 font-semibold">Merge PDF</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              📎
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
              Merge PDF Files Online
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
            Combine multiple PDF files into one clean document with custom ordering. Fast, free, and processed 100% in your browser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Zero Server Uploads
          </span>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Main Drag-and-Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 mb-8 group ${
          isDragging
            ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 scale-[1.01]'
            : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50/50 dark:hover:bg-slate-800/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          title=""
          onChange={(e) => {
            if (e.target.files) processFiles(Array.from(e.target.files));
            e.target.value = '';
          }}
        />
        <div className="pointer-events-none flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center text-3xl mb-4 shadow-xs">
            📄
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
            Select or drop PDF files here
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Choose 2 or more PDF documents from your computer. You can drag and drop multiple files at once.
          </p>
          <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
            Browse Files
          </span>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-4 mb-6 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-4 mb-6 flex items-center gap-2">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Uploaded File List & Sequence Controller */}
      {items.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Documents Sequence ({items.length} files)
              </h3>
              <p className="text-xs text-gray-400">
                Files will be merged in the order shown below. Use the arrows to reorder.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
              <span>Total size: <strong className="text-gray-900">{formatFileSize(totalBytes)}</strong></span>
              <span>•</span>
              <span>Est. pages: <strong className="text-gray-900">{totalPagesEstimate || 'Calculating...'}</strong></span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-gray-200/70 text-gray-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {formatFileSize(item.size)} • {item.pages !== null ? `${item.pages} pages` : 'Reading...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    title="Move earlier"
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 text-xs"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === items.length - 1}
                    title="Move later"
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 text-xs"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    title="Remove"
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 text-xs ml-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Settings & Action */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">Output Name:</span>
              <input
                type="text"
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                placeholder="merged_document.pdf"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <button
              onClick={mergePdfs}
              disabled={isMerging || items.length < 2}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isMerging ? `Merging... ${progress}%` : `Merge ${items.length} PDFs Now`}
            </button>
          </div>

          {/* Progress bar */}
          {isMerging && (
            <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-red-600 h-2 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Result Card with Persistent Download Button */}
      {mergeResult && (
        <ToolResultCard
          title="PDFs Merged Successfully!"
          filename={mergeResult.filename}
          downloadUrl={mergeResult.blobUrl}
          fileSize={mergeResult.size}
          badgeText="Document Ready"
          details={[
            { label: 'Total Pages', value: mergeResult.pageCount },
            { label: 'Combined From', value: `${items.length} files` },
          ]}
          previewUrl={mergeResult.blobUrl}
          onReset={() => {
            setMergeResult(null);
            setItems([]);
            setSuccess('');
          }}
          resetButtonText="Merge Another Set of PDFs"
          nextTool={{
            name: 'Compress Merged PDF',
            url: '/tools/optimize-pdf/compress-pdf/',
          }}
        />
      )}

      {/* Guide section */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 mb-3">
          How to Combine PDF Documents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600 mb-6">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <strong className="block text-gray-900 mb-1">1. Select Files</strong>
            Drop multiple PDF files or browse your local storage to choose your files.
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <strong className="block text-gray-900 mb-1">2. Arrange Order</strong>
            Use the sequence arrows to arrange the documents in your preferred reading sequence.
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <strong className="block text-gray-900 mb-1">3. Download</strong>
            Click Merge to instantly create and download your consolidated PDF file.
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-2">Enterprise-Level Security</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Standard online PDF converters upload your confidential agreements, invoices, and bank statements to remote servers. ToolsVerse works entirely on your local CPU memory using WebAssembly. Your documents never touch any server.
        </p>
      </div>

      {/* Related Tools Navigator */}
      <RelatedTools currentSlug="merge-pdf" />
    </div>
  );
}
