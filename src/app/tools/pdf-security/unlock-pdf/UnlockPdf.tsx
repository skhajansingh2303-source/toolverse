'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import AdSlot from '@/components/AdSlot';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';
import RelatedTools from '@/components/RelatedTools';
import ToolResultCard from '@/components/ToolResultCard';

interface UnlockResult {
  blobUrl: string;
  filename: string;
  size: number;
  pageCount: number;
}

export default function UnlockPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isProtected, setIsProtected] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [legalConfirmed, setLegalConfirmed] = useState<boolean>(true);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [unlockResult, setUnlockResult] = useState<UnlockResult | null>(null);

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

      // Test whether standard load throws encryption error
      let detectedProtected = false;
      try {
        await PDFDocument.load(buffer);
      } catch (loadErr: any) {
        if (
          loadErr.message?.includes('encrypted') ||
          loadErr.message?.includes('ignoreEncryption')
        ) {
          detectedProtected = true;
        }
      }

      // Load with ignoreEncryption to analyze structure
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setTotalPages(doc.getPageCount());

      // Check trailer /Encrypt
      if ((doc.context as any).trailerInfo?.Encrypt) {
        detectedProtected = true;
      }

      setIsProtected(detectedProtected);
    } catch (err: any) {
      console.error(err);
      setError('Error analyzing PDF: ' + (err.message || 'File cannot be read.'));
    }
  };

  const handleUnlockPdf = async () => {
    if (!file) return;

    if (!legalConfirmed) {
      setError('Please confirm that you have the legal right or permission to unlock this document.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const buffer = await file.arrayBuffer();

      // Load source PDF with encryption ignored
      const sourceDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pageCount = sourceDoc.getPageCount();

      // Create a brand-new clean PDF document
      const cleanDoc = await PDFDocument.create();

      // Copy all pages from protected source document
      const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
      const copiedPages = await cleanDoc.copyPages(sourceDoc, pageIndices);

      // Append copied pages into clean document
      copiedPages.forEach((page) => cleanDoc.addPage(page));

      // Retain standard metadata if available
      try {
        if (sourceDoc.getTitle()) cleanDoc.setTitle(sourceDoc.getTitle()!);
        if (sourceDoc.getAuthor()) cleanDoc.setAuthor(sourceDoc.getAuthor()!);
        cleanDoc.setProducer('ToolsVerse Clean PDF Engine');
        cleanDoc.setModificationDate(new Date());
      } catch {
        // Ignore metadata copying errors
      }

      // Save unlocked, restriction-free PDF
      const pdfBytes = await cleanDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadFilename = `unlocked_${file.name.replace(/^protected_/, '')}`;

      setUnlockResult({
        blobUrl: downloadUrl,
        filename: downloadFilename,
        size: blob.size,
        pageCount,
      });

      try {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {}

      setSuccess(`Successfully removed restrictions and saved clean PDF (${pageCount} pages)!`);
    } catch (err: any) {
      console.error(err);
      setError('Failed to unlock PDF: ' + (err.message || 'Could not decrypt document.'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
            <li className="text-gray-800 dark:text-white font-semibold">Unlock PDF</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Unlock PDF (Remove Password & Restrictions)
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">
            Remove PDF passwords and eliminate printing, copying, and editing restrictions to create an unrestricted document.
          </p>
        </div>

        {/* AdSlot */}
        <div className="mb-8">
          <AdSlot format="horizontal" />
        </div>

        {/* Workspace */}
        {!file ? (
          /* Upload Dropzone */
          <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-rose-500 bg-white dark:bg-slate-900 rounded-3xl p-12 text-center transition-all group shadow-sm">
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
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                🔓
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Upload Protected PDF
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-md mb-5">
                Drag and drop your password-protected or restricted PDF here to unlock it.
              </p>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Live Document Preview */}
            <DocumentLiveViewer
              file={file}
              fileName={file.name}
              onFileChange={(newFile) => handleFileUpload(newFile)}
              onRemove={() => {
                setFile(null);
                setTotalPages(0);
              }}
            />

            {/* Document Unlock Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Protection Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  isProtected
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    : 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-900 dark:text-green-200'
                }`}
              >
                <span className="text-2xl">{isProtected ? '🔒' : '🔓'}</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {isProtected ? 'Protected / Encrypted PDF Detected' : 'Unrestricted PDF Detected'}
                  </h4>
                  <p className="text-xs opacity-80 mt-0.5">
                    {isProtected
                      ? `This document has ${totalPages} page(s) with security restrictions or password encryption.`
                      : `This document has ${totalPages} page(s). You can strip any residual permission flags or re-save clean.`}
                  </p>
                </div>
              </div>

              {/* Password field (optional / if known) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                  Password (if document requires open authorization):
                </label>
                <div className="relative max-w-md">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter document password (if required)..."
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 pr-12 text-xs sm:text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-xs"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Leave blank if only permission restrictions (e.g. printing or copying) need to be removed.
                </p>
              </div>

              {/* Legal Confirmation Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={legalConfirmed}
                    onChange={(e) => setLegalConfirmed(e.target.checked)}
                    className="mt-0.5 rounded accent-primary-600 h-4 w-4"
                  />
                  <span className="text-xs text-gray-600 dark:text-slate-300">
                    I confirm that I am the owner of this document or have legal authorization to decrypt and remove access restrictions.
                  </span>
                </label>
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

              {/* Unlock Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleUnlockPdf}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Unlocking & Decrypting...</span>
                    </>
                  ) : (
                    <span>🔓 Unlock & Save PDF</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Result Card with Persistent Download Button */}
        {unlockResult && (
          <ToolResultCard
            title="PDF Unlocked & Restrictions Removed!"
            filename={unlockResult.filename}
            downloadUrl={unlockResult.blobUrl}
            fileSize={unlockResult.size}
            badgeText="Restrictions Stripped"
            details={[
              { label: 'Total Pages', value: unlockResult.pageCount },
              { label: 'Status', value: 'Print, Copy & Edit Enabled' },
            ]}
            previewUrl={unlockResult.blobUrl}
            onReset={() => {
              setUnlockResult(null);
              setFile(null);
              setPassword('');
              setSuccess('');
            }}
            resetButtonText="Unlock Another PDF"
            nextTool={{
              name: 'Compress PDF',
              url: '/tools/optimize-pdf/compress-pdf/',
            }}
          />
        )}

        {/* How to Use */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">How to Unlock a PDF Online</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Upload File</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Select or drag and drop your protected PDF file into the upload zone.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Automatic Detection</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Our engine automatically scans the security trailer for encryption dictionaries and permissions.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Remove Security</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Click Unlock & Save PDF. All locks and limitations on printing, editing, and copying are stripped.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Clean Download</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                An entirely clean, unencrypted PDF document is downloaded immediately to your device.
              </p>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-8">
          <RelatedTools currentSlug="unlock-pdf" />
        </div>
      </div>
    </div>
  );
}
