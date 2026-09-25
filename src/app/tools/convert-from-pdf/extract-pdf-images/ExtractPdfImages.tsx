'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import AdSlot from '@/components/AdSlot';
import FeedbackWidget from '@/components/FeedbackWidget';
import RelatedTools from '@/components/RelatedTools';
import { PDFDocument, PDFName } from 'pdf-lib';
import JSZip from 'jszip';

interface ExtractedImage {
  id: number;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  label: string;
  type: 'embedded' | 'page';
}

export default function ExtractPdfImages() {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [extractionMode, setExtractionMode] = useState<'all' | 'embedded' | 'pages'>('all');
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfjsLoaded(true);
    }
  }, []);

  const handleScriptLoad = () => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfjsLoaded(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setImages([]);
    extractImages(uploadedFile, extractionMode);
  };

  const extractImages = async (
    targetFile: File,
    mode: 'all' | 'embedded' | 'pages' = extractionMode
  ) => {
    setIsExtracting(true);
    setStatusText('Reading PDF streams...');
    const extractedList: ExtractedImage[] = [];
    let imageCounter = 1;

    try {
      const bytes = await targetFile.arrayBuffer();

      // 1. Extract embedded raw images via pdf-lib stream examination
      if (mode === 'all' || mode === 'embedded') {
        setStatusText('Searching for embedded image streams...');
        try {
          const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
          const indirectObjs = pdfDoc.context.enumerateIndirectObjects();

          for (const [ref, obj] of indirectObjs) {
            if ((obj as any).dict && (obj as any).contents) {
              const dict = (obj as any).dict;
              const subtype = dict.get(PDFName.of('Subtype'));

              if (subtype === PDFName.of('Image')) {
                const filter = dict.get(PDFName.of('Filter'))?.toString();
                const width = Number(dict.get(PDFName.of('Width'))?.toString()) || 0;
                const height = Number(dict.get(PDFName.of('Height'))?.toString()) || 0;

                // DCTDecode is raw JPEG
                if (filter?.includes('DCTDecode') && (obj as any).contents.length > 0) {
                  const jpegBlob = new Blob([(obj as any).contents], { type: 'image/jpeg' });
                  const dataUrl = URL.createObjectURL(jpegBlob);
                  extractedList.push({
                    id: imageCounter++,
                    dataUrl,
                    blob: jpegBlob,
                    width: width || 800,
                    height: height || 600,
                    label: `embedded_image_${imageCounter - 1}.jpg`,
                    type: 'embedded',
                  });
                }
              }
            }
          }
        } catch (e) {
          console.warn('Direct stream extraction encountered an issue, continuing:', e);
        }
      }

      // 2. Extract page renderings via PDF.js if requested, or if no embedded images found
      if ((mode === 'all' || mode === 'pages' || extractedList.length === 0) && typeof window !== 'undefined' && (window as any).pdfjsLib) {
        setStatusText('Rendering high-resolution page images...');
        const pdfjs = (window as any).pdfjsLib;
        const pdf = await pdfjs.getDocument({ data: bytes }).promise;
        const numPages = pdf.numPages;

        for (let i = 1; i <= numPages; i++) {
          setStatusText(`Rendering page ${i} of ${numPages}...`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // High-DPI

          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext('2d', { alpha: false });

          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            await page.render({ canvasContext: ctx, viewport }).promise;

            const pageBlob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob((b) => resolve(b), 'image/png')
            );

            canvas.width = 0;
            canvas.height = 0;

            if (pageBlob) {
              const dataUrl = URL.createObjectURL(pageBlob);
              extractedList.push({
                id: imageCounter++,
                dataUrl,
                blob: pageBlob,
                width: Math.round(viewport.width),
                height: Math.round(viewport.height),
                label: `page_${i}.png`,
                type: 'page',
              });
            }
          }
        }
      }

      setImages(extractedList);
      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `🖼️ Successfully extracted ${extractedList.length} images!` },
        })
      );
    } catch (err: any) {
      console.error(err);
      alert('Error extracting images: ' + (err.message || 'Please check PDF permissions.'));
    } finally {
      setIsExtracting(false);
      setStatusText('');
    }
  };

  const downloadImage = (img: ExtractedImage) => {
    const a = document.createElement('a');
    a.href = img.dataUrl;
    a.download = img.label;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllAsZip = async () => {
    if (images.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'pdf_images';
      const folder = zip.folder(baseName) || zip;

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const arrayBuf = await img.blob.arrayBuffer();
        folder.file(img.label, arrayBuf);
      }

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_extracted_images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `📦 Downloaded ${images.length} images as ZIP!` },
        })
      );
    } catch (err) {
      console.error(err);
      alert('Failed to generate ZIP archive.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Extract PDF Images</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center text-white text-xl shadow-sm">
              🖼️
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Extract Images from PDF
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
            Export authentic embedded photos and crystal-clear page graphics from your PDF documents as PNG/JPEG files or download all in 1 ZIP.
          </p>
        </div>

        {images.length > 0 && (
          <button
            onClick={downloadAllAsZip}
            disabled={isZipping}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-primary-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <span>📦</span>
            <span>{isZipping ? 'Creating ZIP...' : `Download All as ZIP (${images.length} Images)`}</span>
          </button>
        )}
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
                🖼️
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Choose PDF to Extract Images
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-400 mb-4">Drag and drop your document here</span>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* File info and extraction options */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                    {file.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                    {isExtracting ? (statusText || 'Extracting...') : `${images.length} images extracted`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-white dark:bg-slate-900 p-1 rounded-lg border border-gray-200 dark:border-slate-700 text-[11px] font-bold">
                  <button
                    onClick={() => { setExtractionMode('all'); if (file) extractImages(file, 'all'); }}
                    className={`px-2.5 py-1 rounded-md transition-colors ${extractionMode === 'all' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-slate-300'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => { setExtractionMode('embedded'); if (file) extractImages(file, 'embedded'); }}
                    className={`px-2.5 py-1 rounded-md transition-colors ${extractionMode === 'embedded' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-slate-300'}`}
                  >
                    Embedded
                  </button>
                  <button
                    onClick={() => { setExtractionMode('pages'); if (file) extractImages(file, 'pages'); }}
                    className={`px-2.5 py-1 rounded-md transition-colors ${extractionMode === 'pages' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-slate-300'}`}
                  >
                    Pages
                  </button>
                </div>

                <button
                  onClick={() => { setFile(null); setImages([]); }}
                  className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white text-xs font-semibold p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Images Grid */}
            {isExtracting ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-600 dark:text-slate-300 font-medium">
                  {statusText || 'Extracting authentic images from PDF streams...'}
                </p>
              </div>
            ) : images.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500 dark:text-slate-400">
                No images found in this PDF document.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 flex flex-col justify-between group hover:shadow-md transition-all"
                  >
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 mb-2.5 flex items-center justify-center p-2 relative">
                      <img
                        src={img.dataUrl}
                        alt={img.label}
                        className="max-h-full max-w-full object-contain shadow-2xs"
                      />
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs uppercase">
                        {img.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200 dark:border-slate-700">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-[11px] truncate max-w-[80px]">
                          #{img.id}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-400">{img.width}×{img.height}</p>
                      </div>

                      <button
                        onClick={() => downloadImage(img)}
                        className="px-2.5 py-1 rounded bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold transition-colors"
                      >
                        Save ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>

      <FeedbackWidget toolName="Extract PDF Images" />
      <RelatedTools currentSlug="extract-pdf-images" />

      {/* How to Use Section */}
      <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          How to Extract Images from a PDF
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-primary-600 text-sm">1. Choose File</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Upload Your Document</p>
            <p className="mt-0.5">Select any PDF containing images, figures, or presentations.</p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">2. Instant Scan</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Zero Server Waiting</p>
            <p className="mt-0.5">Images are extracted locally inside your browser at full original resolution.</p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">3. Save PNGs</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Download High-Res Images</p>
            <p className="mt-0.5">Save individual pictures or download all files at once in a ZIP archive.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
