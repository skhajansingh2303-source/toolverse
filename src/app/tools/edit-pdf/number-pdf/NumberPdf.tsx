'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import AdSlot from '@/components/AdSlot';

type Position = 'bottomCenter' | 'bottomRight' | 'topRight';
type Format = 'Page X of Y' | 'X of Y' | 'Page X' | 'X';

export default function NumberPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const [position, setPosition] = useState<Position>('bottomCenter');
  const [format, setFormat] = useState<Format>('Page X of Y');
  const [startNum, setStartNum] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(12);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setFile(uploadedFile);
    setError('');
  };

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const totalPages = pdfDoc.getPageCount();

      const pages = pdfDoc.getPages();

      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const currentNum = startNum + i;
        
        let text = '';
        if (format === 'Page X of Y') text = `Page ${currentNum} of ${totalPages}`;
        else if (format === 'X of Y') text = `${currentNum} of ${totalPages}`;
        else if (format === 'Page X') text = `Page ${currentNum}`;
        else if (format === 'X') text = `${currentNum}`;

        const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
        
        let x = 0;
        let y = 0;
        const margin = 30;

        if (position === 'bottomCenter') {
          x = (width - textWidth) / 2;
          y = margin;
        } else if (position === 'bottomRight') {
          x = width - textWidth - margin;
          y = margin;
        } else if (position === 'topRight') {
          x = width - textWidth - margin;
          y = height - margin - fontSize;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace('.pdf', '_numbered.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error processing PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <nav className="text-sm font-medium text-gray-500">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Add Page Numbers to PDF</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Add Page Numbers to PDF</h1>
          <p className="text-gray-600">Customize and add page numbers to your PDF documents instantly.</p>
        </div>

        <AdSlot format="horizontal" />

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 space-y-6">
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
                <p className="text-xs text-gray-400 mb-4">Add numbers to your PDF pages</p>
                <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                  Browse Files
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-lg font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove File
                </button>
              </div>

              {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as Position)}
                    className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3"
                  >
                    <option value="bottomCenter">Bottom Center</option>
                    <option value="bottomRight">Bottom Right</option>
                    <option value="topRight">Top Right</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as Format)}
                    className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3"
                  >
                    <option value="Page X of Y">Page 1 of 5</option>
                    <option value="X of Y">1 of 5</option>
                    <option value="Page X">Page 1</option>
                    <option value="X">1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Starting Number</label>
                  <input
                    type="number"
                    min="1"
                    value={startNum}
                    onChange={(e) => setStartNum(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3"
                  >
                    <option value="10">Small (10pt)</option>
                    <option value="12">Medium (12pt)</option>
                    <option value="14">Large (14pt)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl px-8 py-3 font-semibold transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Add Page Numbers'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Upload your PDF file using the drop zone above.</li>
            <li>Choose where you want the page numbers to appear (Position).</li>
            <li>Select how the page numbers should be formatted.</li>
            <li>Set the starting number (useful if this PDF is a continuation of another document).</li>
            <li>Click "Add Page Numbers" to process and download your updated PDF.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
