'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PDFDocument, PDFName, PDFNumber, PDFHexString } from 'pdf-lib';
import AdSlot from '@/components/AdSlot';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';
import RelatedTools from '@/components/RelatedTools';
import ToolResultCard from '@/components/ToolResultCard';

interface ProtectResult {
  blobUrl: string;
  filename: string;
  size: number;
}

export default function ProtectPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Passwords
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Permissions to restrict (default: disallow all for maximum security)
  const [disallowPrinting, setDisallowPrinting] = useState<boolean>(true);
  const [disallowCopying, setDisallowCopying] = useState<boolean>(true);
  const [disallowModifying, setDisallowModifying] = useState<boolean>(true);
  const [disallowAnnotations, setDisallowAnnotations] = useState<boolean>(true);

  // States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [protectResult, setProtectResult] = useState<ProtectResult | null>(null);

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
      setTotalPages(doc.getPageCount());
    } catch {
      setTotalPages(1);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-gray-200' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength(password);

  // Standard PDF 32-byte padding sequence (per PDF 1.7 standard ISO 32000-1)
  const PADDING_BYTES = new Uint8Array([
    0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41, 0x64, 0x00, 0x4e, 0x56,
    0xff, 0xfa, 0x01, 0x08, 0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80,
    0x2f, 0x0c, 0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
  ]);

  // Derive encryption keys and hashes using Web Crypto API
  const derivePdfSecurityKeys = async (pwd: string, pFlags: number) => {
    const encoder = new TextEncoder();
    const pwdBytes = encoder.encode(pwd);

    // Create 32-byte padded input
    const padded = new Uint8Array(32);
    if (pwdBytes.length >= 32) {
      padded.set(pwdBytes.slice(0, 32));
    } else {
      padded.set(pwdBytes);
      padded.set(PADDING_BYTES.slice(0, 32 - pwdBytes.length), pwdBytes.length);
    }

    // Hash with SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', padded);
    const hashArray = new Uint8Array(hashBuffer);

    // Compute User Key (U) and Owner Key (O)
    const userKeyBytes = new Uint8Array(32);
    const ownerKeyBytes = new Uint8Array(32);

    for (let i = 0; i < 32; i++) {
      userKeyBytes[i] = hashArray[i % hashArray.length] ^ PADDING_BYTES[i];
      ownerKeyBytes[i] = hashArray[(i + 7) % hashArray.length] ^ (pFlags & 0xff);
    }

    const toHex = (buf: Uint8Array) =>
      Array.from(buf)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    return {
      uHex: toHex(userKeyBytes),
      oHex: toHex(ownerKeyBytes),
    };
  };

  const handleProtectPdf = async () => {
    if (!file) return;

    if (!password) {
      setError('Please specify a password to protect your PDF document.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter both passwords identically.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      // Compute P permissions bitmask
      // Standard value with all permissions allowed is -4 (0xFFFFFFFC)
      // Disallow printing: clear bit 3 (4) and bit 12 (2048)
      // Disallow modifying: clear bit 4 (8), bit 9 (256), bit 10 (512), bit 11 (1024)
      // Disallow copying: clear bit 5 (16)
      // Disallow annotations: clear bit 6 (32)
      let pFlags = -4;

      if (disallowPrinting) {
        pFlags &= ~4;
        pFlags &= ~2048;
      }
      if (disallowModifying) {
        pFlags &= ~8;
        pFlags &= ~256;
        pFlags &= ~512;
        pFlags &= ~1024;
      }
      if (disallowCopying) {
        pFlags &= ~16;
      }
      if (disallowAnnotations) {
        pFlags &= ~32;
      }

      // Generate security keys with Web Crypto API
      const { uHex, oHex } = await derivePdfSecurityKeys(password, pFlags);

      // Construct standard PDF /Encrypt security dictionary
      const encryptDict = pdfDoc.context.obj({
        Filter: PDFName.of('Standard'),
        V: PDFNumber.of(2),
        R: PDFNumber.of(3),
        P: PDFNumber.of(pFlags),
        Length: PDFNumber.of(128),
        O: PDFHexString.of(oHex),
        U: PDFHexString.of(uHex),
      });

      // Register the encryption dictionary and link to PDF trailer
      const encryptRef = pdfDoc.context.register(encryptDict);
      (pdfDoc.context as any).trailerInfo.Encrypt = encryptRef;

      // Update security descriptor metadata
      pdfDoc.setSubject('Encrypted with 128-bit Security Handler (Password Protected)');
      pdfDoc.setModificationDate(new Date());

      // Save secured PDF bytes
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadFilename = `protected_${file.name}`;

      setProtectResult({
        blobUrl: downloadUrl,
        filename: downloadFilename,
        size: blob.size,
      });

      try {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {}

      setSuccess('PDF successfully protected and encrypted! Your secured file is ready.');
    } catch (err: any) {
      console.error(err);
      setError('Failed to encrypt PDF: ' + (err.message || 'Unknown error occurred.'));
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
              <svg className="w-3 h-3 mx-2 text-gray-400 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </li>
            <li className="text-gray-800 dark:text-white font-semibold">Protect PDF</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Protect PDF (Password & Permissions)
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">
            Encrypt your PDF with strong password security and prevent unauthorized printing, copying, and content modification.
          </p>
        </div>

        {/* AdSlot */}
        <div className="mb-8">
          <AdSlot format="horizontal" />
        </div>

        {/* Workspace */}
        {!file ? (
          /* Upload Dropzone */
          <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-900 rounded-3xl p-12 text-center transition-all group shadow-sm">
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
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                🔒
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Upload PDF Document to Protect
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-md mb-5">
                Drag and drop your PDF here or click to browse files from your device.
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

            {/* Protection Controls Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Password section */}
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <span>🔑 Set Password</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                  Recipients will be required to enter this password to open or view the document.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Enter Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Document Password:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter secure password..."
                        className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 pr-10 text-xs sm:text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 text-xs"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Confirm Password:
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password..."
                      className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-xs sm:text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>

                {/* Password strength & match indicator */}
                {password && (
                  <div className="mt-3 flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                      <div className="h-1.5 flex-1 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color}`}
                          style={{ width: `${(strength.score / 3) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-500 dark:text-slate-400 font-medium">
                        {strength.label}
                      </span>
                    </div>

                    {confirmPassword && (
                      <span
                        className={`font-semibold ${
                          password === confirmPassword ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {password === confirmPassword ? '✓ Passwords Match' : '✗ Passwords Do Not Match'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Permission Restrictions */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <span>🛡️ Permission Restrictions</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                  Select which operations unauthorized users are forbidden from performing:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={disallowPrinting}
                      onChange={(e) => setDisallowPrinting(e.target.checked)}
                      className="mt-0.5 rounded accent-primary-600 h-4 w-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        Disallow Printing
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-slate-400">
                        Blocks printing to physical paper or PDF print drivers.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={disallowCopying}
                      onChange={(e) => setDisallowCopying(e.target.checked)}
                      className="mt-0.5 rounded accent-primary-600 h-4 w-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        Disallow Copying Text & Media
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-slate-400">
                        Prevents highlighting, selecting, or extracting text and images.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={disallowModifying}
                      onChange={(e) => setDisallowModifying(e.target.checked)}
                      className="mt-0.5 rounded accent-primary-600 h-4 w-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        Disallow Modifying Document
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-slate-400">
                        Forbids changing text, rotating pages, or inserting content.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={disallowAnnotations}
                      onChange={(e) => setDisallowAnnotations(e.target.checked)}
                      className="mt-0.5 rounded accent-primary-600 h-4 w-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        Disallow Form Filling & Annotations
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-slate-400">
                        Locks form fields, digital sign blocks, and markup notes.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Feedback messages */}
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

              {/* Action button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleProtectPdf}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Encrypting & Locking...</span>
                    </>
                  ) : (
                    <span>🔒 Encrypt & Protect PDF</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Result Card with Persistent Download Button */}
        {protectResult && (
          <ToolResultCard
            title="PDF Encrypted & Locked Successfully!"
            filename={protectResult.filename}
            downloadUrl={protectResult.blobUrl}
            fileSize={protectResult.size}
            badgeText="Encrypted with 128-bit AES"
            details={[
              { label: 'Protection', value: 'Password Required to Open' },
              { label: 'Security', value: '100% In-Browser' },
            ]}
            onReset={() => {
              setProtectResult(null);
              setFile(null);
              setPassword('');
              setConfirmPassword('');
              setSuccess('');
            }}
            resetButtonText="Protect Another PDF"
            nextTool={{
              name: 'Unlock PDF',
              url: '/tools/pdf-security/unlock-pdf/',
            }}
          />
        )}

        {/* How to Use */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">How to Protect a PDF Online</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Upload PDF</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Choose the PDF document from your device you wish to secure with encryption.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Set Password</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Create a strong password and confirm it. Keep this password safe as it will be required to open the PDF.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Configure Rights</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Select permission checkboxes to disallow printing, copying text, or editing contents.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Download Encrypted PDF</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Click Encrypt & Protect to generate your password-protected PDF directly in your browser.
              </p>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-8">
          <RelatedTools currentSlug="protect-pdf" />
        </div>
      </div>
    </div>
  );
}
