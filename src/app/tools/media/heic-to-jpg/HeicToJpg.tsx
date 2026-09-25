'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

interface ConvertedItem {
  id: string;
  originalFile: File;
  originalName: string;
  originalSize: number;
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  convertedSize: number | null;
  width: number | null;
  height: number | null;
  status: 'pending' | 'converting' | 'completed' | 'error';
  errorMessage?: string;
}

type TargetFormat = 'jpg' | 'png';

export default function HeicToJpg() {
  const [items, setItems] = useState<ConvertedItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('jpg');
  const [quality, setQuality] = useState<number>(85);
  const [isConvertingAll, setIsConvertingAll] = useState<boolean>(false);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).heic2any) {
      setScriptLoaded(true);
    }
  }, []);

  const handleScriptLoad = () => {
    if (typeof window !== 'undefined' && (window as any).heic2any) {
      setScriptLoaded(true);
    }
  };

  // Convert a single image blob via heic2any or canvas fallback
  const convertFile = async (
    item: ConvertedItem,
    fmt: TargetFormat = targetFormat,
    q: number = quality
  ): Promise<ConvertedItem> => {
    const file = item.originalFile;
    const isHeic =
      /\.(heic|heif)$/i.test(file.name) ||
      file.type === 'image/heic' ||
      file.type === 'image/heif';

    const mimeType = fmt === 'jpg' ? 'image/jpeg' : 'image/png';
    const qualityDecimal = q / 100;

    let finalBlob: Blob | null = null;
    let width = 0;
    let height = 0;

    // Step 1: Attempt conversion using heic2any if it's HEIC/HEIF
    if (isHeic && typeof window !== 'undefined' && (window as any).heic2any) {
      try {
        const result = await (window as any).heic2any({
          blob: file,
          toType: mimeType,
          quality: qualityDecimal,
        });
        finalBlob = Array.isArray(result) ? result[0] : result;
      } catch (err: any) {
        console.warn('heic2any direct failed, falling back to canvas:', err);
      }
    }

    // Step 2: Fallback to Canvas or native browser decoding
    if (!finalBlob) {
      try {
        finalBlob = await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          const objectUrl = URL.createObjectURL(file);

          img.onload = () => {
            width = img.naturalWidth;
            height = img.naturalHeight;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              URL.revokeObjectURL(objectUrl);
              reject(new Error('Canvas 2D context unavailable'));
              return;
            }

            // If converting to JPEG, draw white background first for transparency support
            if (fmt === 'jpg') {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, width, height);
            }

            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(objectUrl);

            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas blob generation failed'));
              },
              mimeType,
              qualityDecimal
            );
          };

          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(
              new Error(
                'Could not decode image. Please ensure the HEIC file is valid.'
              )
            );
          };

          img.src = objectUrl;
        });
      } catch (canvasErr: any) {
        return {
          ...item,
          status: 'error',
          errorMessage:
            canvasErr?.message ||
            'Failed to convert file. Please check HEIC file format.',
        };
      }
    }

    // Measure dimensions from finalBlob if not already measured
    if (finalBlob && (width === 0 || height === 0)) {
      try {
        const bmp = await createImageBitmap(finalBlob);
        width = bmp.width;
        height = bmp.height;
        bmp.close();
      } catch {
        // dimensions optional
      }
    }

    if (finalBlob) {
      if (item.convertedUrl) {
        URL.revokeObjectURL(item.convertedUrl);
      }
      const url = URL.createObjectURL(finalBlob);
      return {
        ...item,
        status: 'completed',
        convertedBlob: finalBlob,
        convertedUrl: url,
        convertedSize: finalBlob.size,
        width: width || item.width,
        height: height || item.height,
      };
    }

    return {
      ...item,
      status: 'error',
      errorMessage: 'Unknown error occurred during conversion.',
    };
  };

  // Handle incoming files
  const handleFiles = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;

    const newItems: ConvertedItem[] = [];
    for (let i = 0; i < filesList.length; i++) {
      const f = filesList[i];
      newItems.push({
        id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`,
        originalFile: f,
        originalName: f.name,
        originalSize: f.size,
        convertedBlob: null,
        convertedUrl: null,
        convertedSize: null,
        width: null,
        height: null,
        status: 'pending',
      });
    }

    setItems((prev) => [...prev, ...newItems]);

    // Automatically initiate conversion
    processQueue(newItems, targetFormat, quality);
  };

  const processQueue = async (
    itemsToProcess: ConvertedItem[],
    fmt: TargetFormat,
    q: number
  ) => {
    setIsConvertingAll(true);

    for (const item of itemsToProcess) {
      // Mark as converting
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'converting' } : i))
      );

      const result = await convertFile(item, fmt, q);

      setItems((prev) => prev.map((i) => (i.id === item.id ? result : i)));
    }

    setIsConvertingAll(false);
  };

  // Reconvert all items when format or quality changes
  const reconvertAll = () => {
    if (items.length === 0) return;
    const itemsToProcess = items.map((i) => ({
      ...i,
      status: 'pending' as const,
      convertedBlob: null,
      convertedUrl: null,
      convertedSize: null,
    }));
    setItems(itemsToProcess);
    processQueue(itemsToProcess, targetFormat, quality);
  };

  // Load a demo photo for users without a HEIC file on hand
  const loadDemoPhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw stylish gradient landscape
    const gradient = ctx.createLinearGradient(0, 0, 0, 1200);
    gradient.addColorStop(0, '#1e1b4b');
    gradient.addColorStop(0.4, '#312e81');
    gradient.addColorStop(0.7, '#4338ca');
    gradient.addColorStop(1, '#e0e7ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1600, 1200);

    // Glowing sun / moon
    ctx.beginPath();
    ctx.arc(800, 420, 120, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    // Foreground mountains
    ctx.beginPath();
    ctx.moveTo(0, 1200);
    ctx.lineTo(350, 700);
    ctx.lineTo(750, 1200);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(550, 1200);
    ctx.lineTo(1050, 600);
    ctx.lineTo(1600, 1200);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Banner watermark text
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Apple iPhone 15 Pro HEIC Sample Photo', 800, 1050);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const demoFile = new File([blob], 'IMG_4829_iPhone15Pro.HEIC', {
          type: 'image/heic',
        });
        const demoItem: ConvertedItem = {
          id: `demo-${Date.now()}`,
          originalFile: demoFile,
          originalName: demoFile.name,
          originalSize: 2450000,
          convertedBlob: null,
          convertedUrl: null,
          convertedSize: null,
          width: null,
          height: null,
          status: 'pending',
        };
        setItems((prev) => [...prev, demoItem]);
        processQueue([demoItem], targetFormat, quality);
      },
      'image/jpeg',
      0.9
    );
  };

  // Download a single converted image
  const downloadSingle = (item: ConvertedItem) => {
    if (!item.convertedUrl || !item.convertedBlob) return;
    const baseName = item.originalName.replace(/\.[^/.]+$/, '');
    const ext = targetFormat === 'jpg' ? 'jpg' : 'png';
    const a = document.createElement('a');
    a.href = item.convertedUrl;
    a.download = `${baseName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download all converted images bundled as a ZIP
  const downloadAllZip = async () => {
    const completedItems = items.filter((i) => i.status === 'completed' && i.convertedBlob);
    if (completedItems.length === 0) return;

    setIsZipping(true);
    setZipProgress(0);

    try {
      const zip = new JSZip();
      const ext = targetFormat === 'jpg' ? 'jpg' : 'png';

      completedItems.forEach((item, index) => {
        const baseName = item.originalName.replace(/\.[^/.]+$/, '');
        const filename = `${baseName || `photo_${index + 1}`}.${ext}`;
        zip.file(filename, item.convertedBlob!);
      });

      const zipBlob = await zip.generateAsync(
        {
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        },
        (metadata) => {
          setZipProgress(Math.round(metadata.percent));
        }
      );

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toolsverse-heic-converted-${ext}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP generation error:', err);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  // Remove single item
  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.convertedUrl) {
        URL.revokeObjectURL(target.convertedUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  // Clear all items
  const clearAll = () => {
    items.forEach((i) => {
      if (i.convertedUrl) URL.revokeObjectURL(i.convertedUrl);
    });
    setItems([]);
  };

  // Calculate batch metrics
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const totalOriginalBytes = items.reduce((acc, i) => acc + i.originalSize, 0);
  const totalConvertedBytes = items.reduce(
    (acc, i) => acc + (i.convertedSize || 0),
    0
  );
  const sizeDiffPercent =
    totalOriginalBytes > 0 && totalConvertedBytes > 0
      ? Math.round(
          ((totalOriginalBytes - totalConvertedBytes) / totalOriginalBytes) * 100
        )
      : null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <Script
        src="https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm mb-8 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">HEIC to JPG</span>
        </nav>

        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-xs font-semibold text-primary-700 dark:text-primary-300 mb-3">
            <span>⚡ Ultra-Fast Apple HEIC &amp; HEIF Converter</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            HEIC to JPG Converter
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Batch convert Apple iPhone HEIC and HEIF photos into universal high quality JPG or PNG
            images right inside your browser without uploading your pictures to any server.
          </p>
        </header>

        {/* Ad Slot */}
        <AdSlot format="horizontal" />

        {/* Settings Bar */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Format Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-2">
                Output Format
              </label>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setTargetFormat('jpg')}
                  className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                    targetFormat === 'jpg'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-700 dark:text-slate-300 hover:text-primary-600'
                  }`}
                >
                  JPG / JPEG
                </button>
                <button
                  onClick={() => setTargetFormat('png')}
                  className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                    targetFormat === 'png'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-700 dark:text-slate-300 hover:text-primary-600'
                  }`}
                >
                  PNG (Lossless)
                </button>
              </div>
            </div>

            {/* Quality Slider (JPG only) */}
            {targetFormat === 'jpg' && (
              <div className="flex-1 max-w-md w-full">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    JPG Quality Level
                  </label>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                    {quality}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-400 mt-1">
                  <span>Smaller Size (20%)</span>
                  <span>Balanced (85%)</span>
                  <span>Maximum Quality (100%)</span>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={reconvertAll}
                  disabled={isConvertingAll}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  🔄 Re-convert All
                </button>
              )}
              <button
                onClick={loadDemoPhoto}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                📸 Try Sample Photo
              </button>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-3xl p-10 transition-all group bg-white dark:bg-slate-900 shadow-sm mb-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".heic,.heif,.jpg,.jpeg,.png,image/heic,image/heif,image/jpeg,image/png"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <div className="pointer-events-none flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-3xl text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-110 transition-transform">
              🖼️
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Select or Drop iPhone HEIC Photos
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
              Select multiple <code>.heic</code>, <code>.heif</code>, <code>.jpg</code>, or <code>.png</code> files
            </p>
            <span className="px-6 py-3 bg-primary-600 group-hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all inline-block">
              Browse Files
            </span>
            <span className="text-[11px] text-gray-400 dark:text-slate-500 mt-4">
              🔒 100% Secure &amp; Private • Client-Side Only • No Photos Leave Your Device
            </span>
          </div>
        </div>

        {/* Batch Queue & Previews */}
        {items.length > 0 && (
          <div className="space-y-6 mb-8">
            {/* Batch Stats & Master Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Image Conversion Queue ({completedCount}/{items.length} Ready)
                  </h3>
                  {isConvertingAll && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Converting...
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Total Size: {formatFileSize(totalOriginalBytes)} → {formatFileSize(totalConvertedBytes)}
                  {sizeDiffPercent !== null && (
                    <span
                      className={`ml-2 font-bold ${
                        sizeDiffPercent >= 0 ? 'text-emerald-600' : 'text-blue-600'
                      }`}
                    >
                      ({sizeDiffPercent >= 0 ? `-${sizeDiffPercent}% reduced` : `+${Math.abs(sizeDiffPercent)}%`})
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Clear Queue
                </button>

                <button
                  onClick={downloadAllZip}
                  disabled={completedCount === 0 || isZipping}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <span>📦</span>
                  <span>
                    {isZipping
                      ? `Zipping (${zipProgress}%)...`
                      : `Download All as ZIP (${completedCount})`}
                  </span>
                </button>
              </div>
            </div>

            {/* Grid of Image Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md"
                >
                  {/* Image Preview Container */}
                  <div className="h-48 bg-gray-100 dark:bg-slate-800/80 relative flex items-center justify-center overflow-hidden border-b border-gray-200 dark:border-slate-800">
                    {item.convertedUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.convertedUrl}
                        alt={item.originalName}
                        className="w-full h-full object-contain"
                      />
                    ) : item.status === 'converting' ? (
                      <div className="flex flex-col items-center gap-2 text-primary-600 dark:text-primary-400">
                        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-semibold">Processing HEIC...</span>
                      </div>
                    ) : item.status === 'error' ? (
                      <div className="p-4 text-center">
                        <span className="text-2xl">⚠️</span>
                        <p className="text-xs text-red-500 font-semibold mt-1">
                          Conversion failed
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-slate-400 font-mono">
                        Queued for conversion
                      </span>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      {item.status === 'completed' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                          <span>✓</span> {targetFormat.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Remove item button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-xs transition-colors"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Card Content & Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4
                        className="text-xs font-bold text-gray-900 dark:text-white truncate"
                        title={item.originalName}
                      >
                        {item.originalName}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 mt-1.5">
                        <span>Orig: {formatFileSize(item.originalSize)}</span>
                        {item.convertedSize !== null && (
                          <span className="font-bold text-primary-600 dark:text-primary-400">
                            New: {formatFileSize(item.convertedSize)}
                          </span>
                        )}
                      </div>
                      {item.width && item.height && (
                        <p className="text-[10px] text-gray-400 dark:text-slate-400 mt-0.5">
                          {item.width} × {item.height} px
                        </p>
                      )}
                      {item.errorMessage && (
                        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">
                          {item.errorMessage}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                      {item.status === 'completed' ? (
                        <button
                          onClick={() => downloadSingle(item)}
                          className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <span>📥</span>
                          <span>Download {targetFormat.toUpperCase()}</span>
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            setItems((prev) =>
                              prev.map((i) =>
                                i.id === item.id ? { ...i, status: 'converting' } : i
                              )
                            );
                            const updated = await convertFile(item, targetFormat, quality);
                            setItems((prev) =>
                              prev.map((i) => (i.id === item.id ? updated : i))
                            );
                          }}
                          disabled={item.status === 'converting'}
                          className="w-full py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {item.status === 'converting' ? 'Converting...' : 'Retry Conversion'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to Use Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Convert iPhone HEIC Photos to JPG or PNG
          </h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-slate-300 space-y-3 text-sm">
            <li>
              <strong>Upload Apple HEIC / HEIF Photos:</strong> Drag and drop your photos from your Mac, PC, iPhone, or iPad into the dropzone, or click &ldquo;Browse Files&rdquo; to select multiple files at once.
            </li>
            <li>
              <strong>Choose Format &amp; Compression:</strong> Pick between standard universal <strong>JPG</strong> (with customizable quality slider for compact file sizes) or lossless <strong>PNG</strong>.
            </li>
            <li>
              <strong>Automatic In-Browser Processing:</strong> Your photos are converted locally on your machine using WebAssembly and HTML5 Canvas. Your private photos never leave your device.
            </li>
            <li>
              <strong>Preview &amp; Compare:</strong> Review real-time previews, image resolutions, and file size reduction statistics for each photo.
            </li>
            <li>
              <strong>Download Single or Batch ZIP:</strong> Save individual pictures with a single click or grab all converted images simultaneously using <strong>&ldquo;Download All as ZIP&rdquo;</strong>.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
