'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';
import ToolResultCard from '@/components/ToolResultCard';
import { PDFDocument, rgb } from 'pdf-lib';

export default function RedactPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [xPos, setXPos] = useState(50);
  const [yPos, setYPos] = useState(50);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(50);
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
      if (pageNumber > 0 && pageNumber <= pages.length) {
        const page = pages[pageNumber - 1];
        page.drawRectangle({
          x: xPos,
          y: yPos,
          width: width,
          height: height,
          color: rgb(0, 0, 0),
        });
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
          detail: { message: '⬛ PDF Redacted successfully! Preview ready below.' },
        })
      );
    } catch (e: any) {
      console.error(e);
      alert('Error processing PDF: ' + (e.message || ''));
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-primary-600">Home</Link> / Redact PDF
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Redact PDF</h1>
          <p className="text-gray-600">Blackout sensitive information on your PDF documents securely in your browser.</p>
        </div>

        <AdSlot format="horizontal" />

        {!file ? (
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 rounded-2xl p-10 transition-colors group bg-gray-50/50 dark:bg-slate-950/40 mb-8 mt-8">
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
                ⬛
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Choose PDF to Redact
              </span>
              <span className="text-xs text-gray-400 mb-4">or drag and drop your document here</span>
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

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 mb-8">

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page #</label>
              <input type="number" min="1" value={pageNumber} onChange={e => setPageNumber(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">X (pt)</label>
              <input type="number" value={xPos} onChange={e => setXPos(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Y (pt)</label>
              <input type="number" value={yPos} onChange={e => setYPos(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
              <input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
              <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 p-3" />
            </div>
          </div>

          <button 
            onClick={handleProcess}
            disabled={!file || isProcessing}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-3 font-semibold disabled:opacity-50 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            <span>⬛</span>
            <span>{isProcessing ? 'Applying Redaction...' : 'Apply Redaction & Preview PDF →'}</span>
          </button>
        </div>

        {/* Redacted PDF Result Card with Preview First & Download Button */}
        {resultUrl && file && (
          <ToolResultCard
            title="PDF Redacted Successfully!"
            filename={`redacted_${file.name}`}
            downloadUrl={resultUrl}
            fileSize={resultSize}
            badgeText="Confidential Info Redacted"
            previewUrl={resultUrl}
            previewType="pdf"
            details={[
              { label: 'Redacted Page', value: pageNumber },
              { label: 'Area', value: `${width}×${height} pt` },
              { label: 'Position', value: `X:${xPos}, Y:${yPos}` },
            ]}
            onReset={() => {
              if (resultUrl) URL.revokeObjectURL(resultUrl);
              setResultUrl(null);
            }}
            resetButtonText="Adjust Redaction Area"
            nextTool={{
              name: 'Protect PDF',
              url: '/tools/pdf-security/protect-pdf',
              description: 'Encrypt and password protect this redacted document.'
            }}
          />
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Upload a PDF file using the file input above.</li>
            <li>Specify the page number where you want to add the redaction block.</li>
            <li>Set the X and Y coordinates (from bottom-left in points) and the width/height of the rectangle.</li>
            <li>Click "Download Redacted PDF" to generate and download your redacted file.</li>
            <li>All processing is done entirely in your browser. No files are uploaded to any server.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
