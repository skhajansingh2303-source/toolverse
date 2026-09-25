'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import FeedbackWidget from '@/components/FeedbackWidget';
import RelatedTools from '@/components/RelatedTools';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';
import { PDFDocument } from 'pdf-lib';

export default function FlattenPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [fieldCount, setFieldCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile || uploadedFile.type !== 'application/pdf') return;

    setFile(uploadedFile);
    setDownloadUrl(null);
    try {
      const bytes = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setPageCount(pdfDoc.getPageCount());
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      setFieldCount(fields.length);
    } catch {
      setPageCount(null);
      setFieldCount(null);
    }
  };

  const flattenAndDownload = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const form = pdfDoc.getForm();
      form.flatten();

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `flattened-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.dispatchEvent(new CustomEvent('toolsverse-toast', { detail: { message: '🔒 PDF Flattened & Downloaded Successfully!' } }));
    } catch (err) {
      console.error(err);
      alert('Error flattening PDF. Please ensure the file is not encrypted with a password.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Flatten PDF</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white text-xl shadow-sm">
            🔒
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Flatten PDF Document
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Freeze all form fields, checkboxes, and signatures into static document graphics. Ensures forms cannot be edited or altered.
        </p>
      </div>

      <AdSlot format="horizontal" />

      {/* Main Panel */}
      <div className="mt-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
        {!file ? (
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 rounded-2xl p-10 transition-colors group bg-gray-50/50 dark:bg-slate-950/40">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                handleFileUpload(e);
                e.target.value = '';
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title=""
            />
            <div className="pointer-events-none flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-2xl text-primary-600 dark:text-primary-400 mb-3 group-hover:scale-110 transition-transform">
                📄
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Choose PDF to Flatten
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-400 mb-4">or drag and drop your file here</span>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Live Document Viewer with Instant Change Document */}
            <DocumentLiveViewer
              file={file}
              onFileChange={(newFile) => {
                setFile(newFile);
                setDownloadUrl(null);
              }}
              onRemove={() => {
                setFile(null);
                setDownloadUrl(null);
              }}
            />

            {/* Action Card */}
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
              <span className="text-base shrink-0">ℹ️</span>
              <p className="leading-relaxed">
                Flattening will permanently merge all form text, signatures, and stamps into the background layer. Recipients will be able to view and print the PDF normally, but form inputs will no longer be clickable or editable.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={flattenAndDownload}
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-primary-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Flattening Document...</span>
                ) : (
                  <>
                    <span>Flatten &amp; Download PDF</span>
                    <span>→</span>
                  </>
                )}
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={`flattened-${file.name}`}
                  className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs text-center transition-colors"
                >
                  Download Again ↓
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <FeedbackWidget toolName="Flatten PDF" />
      <RelatedTools currentSlug="flatten-pdf" />

      {/* How to Use Section */}
      <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          Why and How to Flatten a PDF
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-primary-600 text-sm">1. Select Document</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Upload Fillable PDF</p>
            <p className="mt-0.5">Choose any government form, tax document, employment contract, or signed PDF.</p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">2. 1-Click Flattening</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Merge Form Elements</p>
            <p className="mt-0.5">All fillable boxes and signatures are converted into unmodifiable PDF page graphics.</p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">3. Safe Sharing</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Save Read-Only PDF</p>
            <p className="mt-0.5">Download your secured, tamper-proof PDF file ready for archiving or sending to clients.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
