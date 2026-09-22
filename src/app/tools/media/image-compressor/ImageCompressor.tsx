'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import FeedbackWidget from '@/components/FeedbackWidget';
import RelatedTools from '@/components/RelatedTools';

interface CompressedResult {
  originalName: string;
  originalSize: number;
  compressedSize: number;
  originalUrl: string;
  compressedUrl: string;
  savedPercent: number;
  width: number;
  height: number;
  format: string;
}

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [scalePercent, setScalePercent] = useState<number>(100);
  const [format, setFormat] = useState<'webp' | 'jpeg' | 'png'>('webp');
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<CompressedResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }
    setError('');
    setFile(selectedFile);
    compressImage(selectedFile, quality, format, scalePercent);
  };

  const compressImage = (
    imageFile: File,
    targetQuality: number,
    targetFormat: string,
    targetScale: number = scalePercent
  ) => {
    setIsCompressing(true);
    setError('');

    const objectUrl = URL.createObjectURL(imageFile);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const targetW = Math.max(1, Math.round(img.width * (targetScale / 100)));
      const targetH = Math.max(1, Math.round(img.height * (targetScale / 100)));

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d', { alpha: targetFormat !== 'jpeg' });

      if (!ctx) {
        setError('Canvas context could not be initialized.');
        setIsCompressing(false);
        return;
      }

      if (targetFormat === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const mimeType =
        targetFormat === 'jpeg'
          ? 'image/jpeg'
          : targetFormat === 'webp'
          ? 'image/webp'
          : 'image/png';
      const qualityRatio = targetQuality / 100;

      canvas.toBlob(
        (blob) => {
          canvas.width = 0;
          canvas.height = 0;

          if (!blob) {
            setError('Failed to compress image.');
            setIsCompressing(false);
            return;
          }

          const compressedUrl = URL.createObjectURL(blob);
          const originalUrl = URL.createObjectURL(imageFile);
          const saved = Math.max(
            0,
            Math.round(((imageFile.size - blob.size) / imageFile.size) * 100)
          );

          setResult({
            originalName: imageFile.name,
            originalSize: imageFile.size,
            compressedSize: blob.size,
            originalUrl,
            compressedUrl,
            savedPercent: saved,
            width: targetW,
            height: targetH,
            format: targetFormat,
          });
          setIsCompressing(false);

          window.dispatchEvent(
            new CustomEvent('toolsverse-toast', {
              detail: {
                message:
                  saved > 0
                    ? `⚡ Image compressed: saved ${saved}%!`
                    : '⚡ Image processed successfully!',
              },
            })
          );
        },
        mimeType,
        qualityRatio
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError('Could not decode this image file.');
      setIsCompressing(false);
    };

    img.src = objectUrl;
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.compressedUrl;
    const baseName =
      result.originalName.substring(0, result.originalName.lastIndexOf('.')) ||
      result.originalName;
    a.download = `compressed_${baseName}.${result.format}`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span className="mx-2 text-gray-300 dark:text-slate-700">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Image Compressor</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              🖼️
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              Browser Image Compressor
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Compress and convert JPEG, PNG, and WebP images locally with zero quality loss and immediate side-by-side comparison.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          100% Client-Side Privacy
        </span>
      </div>

      <AdSlot format="horizontal" />

      {/* Upload Zone */}
      {!file ? (
        <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-3xl p-12 text-center bg-white dark:bg-slate-900 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-all mb-8 group">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title=""
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              e.target.value = '';
            }}
          />
          <div className="pointer-events-none flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center text-3xl mb-4 shadow-xs group-hover:scale-110 transition-transform">
              📷
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
              Drop an image here or click to browse
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-4">
              Supports PNG, JPG, JPEG, and WebP. Instant client-side compression without server lag.
            </p>
            <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
              Select Image
            </span>
          </div>
        </div>
      ) : (
        /* Compression Playground */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 mb-8 transition-colors">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Top Bar Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-gray-100 dark:border-slate-800 mb-6">
            {/* Quality Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">
                <span>Quality</span>
                <span className="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded font-mono">
                  {quality}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={quality}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setQuality(val);
                  if (file) compressImage(file, val, format, scalePercent);
                }}
                className="w-full accent-primary-600 cursor-pointer"
              />
            </div>

            {/* Resolution Scaling */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">
                <span>Scale Dimensions</span>
                <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded font-mono">
                  {scalePercent}%
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[100, 75, 50, 25].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      setScalePercent(pct);
                      if (file) compressImage(file, quality, format, pct);
                    }}
                    className={`py-1 rounded-lg text-xs font-bold transition-all ${
                      scalePercent === pct
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Target Format */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">
                Output Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['webp', 'jpeg', 'png'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => {
                      setFormat(fmt);
                      if (file) compressImage(file, quality, fmt, scalePercent);
                    }}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                      format === fmt
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Change File Trigger */}
            <div className="flex items-end justify-start md:justify-end">
              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                }}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 px-4 py-2.5 rounded-xl transition-colors"
              >
                Choose Another
              </button>
            </div>
          </div>

          {/* Results Comparison Overview */}
          {result && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <span className="block text-xs text-gray-500 dark:text-slate-400 font-medium mb-1">
                    Original Size
                  </span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatSize(result.originalSize)}
                  </span>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-800/60">
                  <span className="block text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-1">
                    Compressed Size
                  </span>
                  <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                    {formatSize(result.compressedSize)}
                  </span>
                </div>

                <div className="p-4 bg-primary-50 dark:bg-primary-950/40 rounded-2xl border border-primary-100 dark:border-primary-800/60">
                  <span className="block text-xs text-primary-700 dark:text-primary-300 font-medium mb-1">
                    Space Saved
                  </span>
                  <span className="text-xl font-black text-primary-700 dark:text-primary-300">
                    {result.savedPercent}% Smaller
                  </span>
                </div>
              </div>

              {/* Side by Side Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50/70 dark:bg-slate-800/40 rounded-2xl border border-gray-200/80 dark:border-slate-800 text-center">
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 block mb-2">
                    Original Image
                  </span>
                  <div className="h-64 flex items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-slate-950 p-2 border border-gray-200 dark:border-slate-800">
                    <img
                      src={result.originalUrl}
                      alt="Original"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50/70 dark:bg-slate-800/40 rounded-2xl border border-gray-200/80 dark:border-slate-800 text-center">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 block mb-2">
                    Optimized Preview ({result.format.toUpperCase()})
                  </span>
                  <div className="h-64 flex items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-slate-950 p-2 border border-gray-200 dark:border-slate-800">
                    <img
                      src={result.compressedUrl}
                      alt="Compressed"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Download Action */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  Resolution: <strong>{result.width} × {result.height} px</strong>
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>📥</span>
                  <span>Download Compressed Image ({formatSize(result.compressedSize)})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <FeedbackWidget toolName="Image Compressor" />
      <RelatedTools currentSlug="image-compressor" />

      {/* Instructional Guide */}
      <div className="mt-12 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
          Why Compress into WebP?
        </h2>
        <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
          Search engines and web browsers heavily reward websites that load quickly. Converting your heavy PNGs and JPEGs to modern <strong>WebP</strong> format typically reduces image file size by 40% to 85% with zero visible loss in visual fidelity.
        </p>
      </div>
    </div>
  );
}
