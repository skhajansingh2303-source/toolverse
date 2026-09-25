'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PDFDocument, degrees } from 'pdf-lib';
import ToolResultCard from '@/components/ToolResultCard';

interface RotateResult {
  blobUrl: string;
  filename: string;
  size: number;
  rotationInfo: string;
}

export default function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rotationMode, setRotationMode] = useState<'all' | 'specific'>('all');
  const [globalRotation, setGlobalRotation] = useState<number>(90);
  const [specificPages, setSpecificPages] = useState<string>('');
  const [specificRotation, setSpecificRotation] = useState<number>(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [rotateResult, setRotateResult] = useState<RotateResult | null>(null);
  
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

  const processRotation = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();

      let pagesToRotate: number[] = [];
      let rotationAmount = 0;

      if (rotationMode === 'all') {
        pagesToRotate = Array.from({ length: totalPages }, (_, i) => i);
        rotationAmount = globalRotation;
      } else {
        if (!specificPages.trim()) {
          throw new Error('Please enter specific pages to rotate.');
        }
        pagesToRotate = parsePageRange(specificPages, totalPages);
        rotationAmount = specificRotation;
      }

      for (const idx of pagesToRotate) {
        if (idx >= 0 && idx < pages.length) {
          const page = pages[idx];
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + rotationAmount));
        }
      }

      const rotatedBytes = await pdfDoc.save();
      const blob = new Blob([rotatedBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const downloadFilename = 'rotated_' + file.name;

      setRotateResult({
        blobUrl: url,
        filename: downloadFilename,
        size: blob.size,
        rotationInfo:
          rotationMode === 'all'
            ? `All ${totalPages} pages by ${globalRotation}°`
            : `Selected pages by ${specificRotation}°`,
      });

      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {}

      setSuccess('PDF rotated successfully! Ready to download.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while rotating the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        <nav className="text-sm mb-8" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link href="/" className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">Home</Link>
              <svg className="fill-current w-3 h-3 mx-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
            </li>
            <li>
              <span className="text-gray-700 dark:text-slate-300" aria-current="page">Rotate PDF</span>
            </li>
          </ol>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Rotate PDF</h1>
          <p className="text-gray-600 dark:text-slate-400">Permanently rotate all or specific pages of your PDF document.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sm:p-8 mb-8">
          {!file ? (
            <div
              className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 rounded-2xl p-10 text-center transition-colors group"
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
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Click or drag a PDF file here</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Rotate PDF pages permanently</p>
                <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                  Browse Files
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 mb-6">
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path></svg>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{totalPages} pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setTotalPages(0); }} className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium">
                  Remove
                </button>
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex space-x-4 mb-4">
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" checked={rotationMode === 'all'} onChange={() => setRotationMode('all')} className="text-primary-600 focus:ring-primary-500 w-4 h-4 mr-2" />
                    <span className="text-gray-700 dark:text-slate-300 font-medium">Rotate all pages</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" checked={rotationMode === 'specific'} onChange={() => setRotationMode('specific')} className="text-primary-600 focus:ring-primary-500 w-4 h-4 mr-2" />
                    <span className="text-gray-700 dark:text-slate-300 font-medium">Rotate specific pages</span>
                  </label>
                </div>

                {rotationMode === 'all' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Direction</label>
                    <select value={globalRotation} onChange={(e) => setGlobalRotation(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
                      <option value={90}>Rotate 90° Clockwise</option>
                      <option value={-90}>Rotate 90° Counter-Clockwise</option>
                      <option value={180}>Rotate 180°</option>
                    </select>
                  </div>
                )}

                {rotationMode === 'specific' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Pages (e.g. 1-3, 5)</label>
                      <input
                        type="text"
                        value={specificPages}
                        onChange={(e) => setSpecificPages(e.target.value)}
                        placeholder="e.g. 1-3, 5, 7"
                        className="w-full rounded-xl border border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Direction</label>
                      <select value={specificRotation} onChange={(e) => setSpecificRotation(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
                        <option value={90}>Rotate 90° Clockwise</option>
                        <option value={-90}>Rotate 90° Counter-Clockwise</option>
                        <option value={180}>Rotate 180°</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl">{error}</div>}
              {success && <div className="mb-6 p-4 bg-green-50 dark:bg-emerald-950/40 text-green-700 dark:text-emerald-300 rounded-xl">{success}</div>}

              <button
                onClick={processRotation}
                disabled={isProcessing}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-slate-700 text-white rounded-xl px-6 py-3 font-semibold transition-colors flex justify-center items-center"
              >
                {isProcessing ? 'Rotating...' : 'Apply Rotation & Download'}
              </button>
            </div>
          )}
        </div>

        {/* Result Card with Persistent Download Button */}
        {rotateResult && (
          <ToolResultCard
            title="PDF Rotated Successfully!"
            filename={rotateResult.filename}
            downloadUrl={rotateResult.blobUrl}
            fileSize={rotateResult.size}
            badgeText="Orientation Updated"
            details={[
              { label: 'Rotation', value: rotateResult.rotationInfo },
              { label: 'Total Pages', value: totalPages },
            ]}
            previewUrl={rotateResult.blobUrl}
            onReset={() => {
              setRotateResult(null);
              setFile(null);
              setSuccess('');
            }}
            resetButtonText="Rotate Another PDF"
            nextTool={{
              name: 'Rearrange PDF Pages',
              url: '/tools/organize-pdf/rearrange-pdf-pages/',
            }}
          />
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal pl-5 space-y-3 text-gray-600 dark:text-slate-300">
            <li>Select the PDF file you want to rotate.</li>
            <li>Choose whether to rotate all pages or only specific pages.</li>
            <li>If specific pages, enter the page numbers or ranges (e.g., "1-3, 5").</li>
            <li>Select the rotation direction (90° clockwise, 90° counter-clockwise, or 180°).</li>
            <li>Click "Apply Rotation & Download" to save the changes permanently.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
