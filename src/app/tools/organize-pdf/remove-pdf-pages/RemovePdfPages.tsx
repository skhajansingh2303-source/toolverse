'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import AdSlot from '@/components/AdSlot';
import ToolResultCard from '@/components/ToolResultCard';

export default function RemovePdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [removedCount, setRemovedCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setFile(uploadedFile);
    setError('');
    setSelectedPages(new Set());

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setNumPages(pdfDoc.getPageCount());
    } catch (err) {
      console.error(err);
      setError('Error reading PDF file. It might be corrupted or password protected.');
      setFile(null);
    }
  };

  const togglePageSelection = (pageIndex: number) => {
    setSelectedPages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pageIndex)) {
        newSet.delete(pageIndex);
      } else {
        newSet.add(pageIndex);
      }
      return newSet;
    });
  };

  const handleProcess = async () => {
    if (!file || selectedPages.size === 0) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      // Pages to keep
      const pagesToKeep = [];
      for (let i = 0; i < totalPages; i++) {
        if (!selectedPages.has(i)) {
          pagesToKeep.push(i);
        }
      }

      if (pagesToKeep.length === 0) {
        throw new Error('You cannot delete all pages.');
      }

      const newPdfDoc = await PDFDocument.create();
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesToKeep);
      copiedPages.forEach((page) => newPdfDoc.addPage(page));

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
      setResultUrl(url);
      setResultSize(blob.size);
      setRemovedCount(selectedPages.size);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `🗑️ Removed ${selectedPages.size} pages! Preview ready below.` },
        })
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error processing PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumbs */}
        <nav className="text-sm font-medium text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-semibold">Remove PDF Pages</span>
        </nav>

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Remove Pages from PDF</h1>
          <p className="text-gray-600 dark:text-slate-400">Select the pages you want to delete and download the updated document.</p>
        </div>

        <AdSlot format="horizontal" />

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 space-y-6">
          {!file ? (
            <div
              className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-12 text-center hover:border-primary-500 transition-colors group"
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title=""
                ref={fileInputRef}
                onChange={(e) => {
                  handleFileUpload(e);
                  e.target.value = '';
                }}
              />
              <div className="pointer-events-none flex flex-col items-center text-gray-500 dark:text-slate-400">
                <svg className="mx-auto h-12 w-12 mb-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-medium text-gray-900 dark:text-white">Click or drop a PDF file here</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Select pages you want to remove</p>
                <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                  Browse Files
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-lg font-medium text-gray-900 dark:text-white truncate max-w-md" title={file.name}>
                  {file.name} ({numPages} pages)
                </div>
                <button
                  onClick={() => { setFile(null); setNumPages(0); setSelectedPages(new Set()); }}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                >
                  Remove File
                </button>
              </div>

              {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto p-2">
                {Array.from({ length: numPages }).map((_, i) => (
                  <div
                    key={i}
                    onClick={() => togglePageSelection(i)}
                    className={`relative cursor-pointer aspect-[1/1.4] rounded-xl border-2 flex items-center justify-center transition-all ${
                      selectedPages.has(i)
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/40'
                        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-primary-400'
                    }`}
                  >
                    <span className={`text-xl font-bold ${selectedPages.has(i) ? 'text-red-500' : 'text-gray-400 dark:text-slate-500'}`}>
                      {i + 1}
                    </span>
                    {selectedPages.has(i) && (
                      <div className="absolute top-2 right-2 text-red-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-400">
                  {selectedPages.size} pages selected for deletion
                </span>
                <button
                  onClick={handleProcess}
                  disabled={isProcessing || selectedPages.size === 0}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl px-6 py-3 font-semibold transition-all active:scale-95 shadow-md flex items-center gap-2"
                >
                  <span>🗑️</span>
                  <span>{isProcessing ? 'Removing Pages...' : 'Remove Selected Pages & Preview →'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Cleaned PDF Result Card with Preview First & Download Button */}
          {resultUrl && file && (
            <div className="mt-8">
              <ToolResultCard
                title="Pages Removed Successfully!"
                filename={file.name.replace('.pdf', '_cleaned.pdf')}
                downloadUrl={resultUrl}
                fileSize={resultSize}
                badgeText={`${removedCount} Pages Removed`}
                previewUrl={resultUrl}
                previewType="pdf"
                details={[
                  { label: 'Original Page Count', value: numPages },
                  { label: 'Pages Removed', value: removedCount },
                  { label: 'Cleaned Page Count', value: numPages - removedCount },
                ]}
                onReset={() => {
                  if (resultUrl) URL.revokeObjectURL(resultUrl);
                  setResultUrl(null);
                  setSelectedPages(new Set());
                }}
                resetButtonText="Select Different Pages to Remove"
                nextTool={{
                  name: 'Merge PDF',
                  url: '/tools/organize-pdf/merge-pdf',
                  description: 'Combine your newly cleaned PDF with other documents.'
                }}
              />
            </div>
          )}
        </div>

        {/* How to Use Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-slate-300">
            <li>Click the upload area to select a PDF file from your device.</li>
            <li>Once loaded, you will see a grid representing all the pages in your PDF.</li>
            <li>Click on the pages you want to remove. They will be highlighted in red with a trash icon.</li>
            <li>Click the "Delete Marked Pages" button to process your file.</li>
            <li>Your new cleaned PDF will be downloaded automatically. Everything happens in your browser!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
