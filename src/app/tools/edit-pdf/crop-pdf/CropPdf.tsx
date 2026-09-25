'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';
import ToolResultCard from '@/components/ToolResultCard';
import { PDFDocument } from 'pdf-lib';

export default function CropPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        page.setCropBox(
          cropLeft,
          cropBottom,
          width - cropLeft - cropRight,
          height - cropTop - cropBottom
        );
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
      setResultUrl(url);
      setResultSize(blob.size);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: '✂️ PDF Cropped successfully! Preview ready below.' },
        })
      );
    } catch (e: any) {
      console.error(e);
      alert('Error processing PDF: ' + (e.message || ''));
    }
    setIsProcessing(false);
  };

  const applyPreset = (type: string) => {
    if (type === '10percent') {
      setCropTop(50); setCropBottom(50); setCropLeft(50); setCropRight(50);
    } else if (type === 'square') {
      setCropTop(100); setCropBottom(100); setCropLeft(0); setCropRight(0);
    } else {
      setCropTop(0); setCropBottom(0); setCropLeft(0); setCropRight(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <nav className="text-sm text-gray-500 dark:text-slate-400 mb-4">
            <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white font-medium">Crop PDF</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Crop PDF</h1>
          <p className="text-gray-600 dark:text-slate-400">Trim margins and adjust dimensions of your PDF pages online.</p>
        </div>

        <AdSlot format="horizontal" />

        {!file ? (
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 rounded-3xl p-10 transition-colors group bg-white/70 dark:bg-slate-900/50 mb-8 mt-8 shadow-xs">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                e.target.value = '';
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title=""
            />
            <div className="pointer-events-none flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-2xl text-primary-600 dark:text-primary-400 mb-3 group-hover:scale-110 transition-transform">
                ✂️
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Choose PDF to Crop
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-500 mb-4">or drag and drop your document here</span>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-8 mb-6">
            <DocumentLiveViewer
              file={file}
              onFileChange={(newFile) => setFile(newFile)}
              onRemove={() => setFile(null)}
            />
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8">
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => applyPreset('10percent')}
              className="text-xs sm:text-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
            >
              Trim 10% Margins
            </button>
            <button
              onClick={() => applyPreset('square')}
              className="text-xs sm:text-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
            >
              Square Crop
            </button>
            <button
              onClick={() => applyPreset('reset')}
              className="text-xs sm:text-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
            >
              Custom Crop / Reset
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Crop Top (pt)</label>
              <input
                type="number"
                value={cropTop}
                onChange={e => setCropTop(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Crop Bottom (pt)</label>
              <input
                type="number"
                value={cropBottom}
                onChange={e => setCropBottom(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Crop Left (pt)</label>
              <input
                type="number"
                value={cropLeft}
                onChange={e => setCropLeft(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Crop Right (pt)</label>
              <input
                type="number"
                value={cropRight}
                onChange={e => setCropRight(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm"
              />
            </div>
          </div>

          <button 
            onClick={handleProcess}
            disabled={!file || isProcessing}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-3 font-semibold disabled:opacity-50 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            <span>✂️</span>
            <span>{isProcessing ? 'Cropping Pages...' : 'Crop & Preview PDF →'}</span>
          </button>
        </div>

        {/* Live Cropped Result Card with Preview First & Download Button */}
        {resultUrl && file && (
          <ToolResultCard
            title="PDF Cropped Successfully!"
            filename={`cropped_${file.name}`}
            downloadUrl={resultUrl}
            fileSize={resultSize}
            badgeText="Margins Trimmed"
            previewUrl={resultUrl}
            previewType="pdf"
            details={[
              { label: 'Top Margin', value: `${cropTop} pt` },
              { label: 'Bottom Margin', value: `${cropBottom} pt` },
              { label: 'Left Margin', value: `${cropLeft} pt` },
              { label: 'Right Margin', value: `${cropRight} pt` },
            ]}
            onReset={() => {
              if (resultUrl) URL.revokeObjectURL(resultUrl);
              setResultUrl(null);
            }}
            resetButtonText="Adjust Crop Margins"
            nextTool={{
              name: 'Compress PDF',
              url: '/tools/optimize-pdf/compress-pdf',
              description: 'Shrink your newly cropped PDF file size.'
            }}
          />
        )}

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-slate-400 text-sm">
            <li>Upload a PDF file using the file input above.</li>
            <li>Select a preset or enter custom margin values (in points).</li>
            <li>Click &quot;Crop &amp; Preview PDF&quot; to generate and preview your trimmed file.</li>
            <li>All processing is done entirely in your browser. No files are uploaded to any server.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
