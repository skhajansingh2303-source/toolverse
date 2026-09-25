'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

const SIZES = [
  { size: 16, name: 'Classic Favicon', format: 'png', file: 'favicon-16x16.png' },
  { size: 32, name: 'Standard Desktop', format: 'png', file: 'favicon-32x32.png' },
  { size: 48, name: 'Windows Site Icon', format: 'png', file: 'favicon-48x48.png' },
  { size: 180, name: 'Apple Touch Icon', format: 'png', file: 'apple-touch-icon.png' },
  { size: 192, name: 'Android PWA Icon', format: 'png', file: 'android-chrome-192x192.png' },
  { size: 512, name: 'Android PWA Splash', format: 'png', file: 'android-chrome-512x512.png' }
];

export default function FaviconGenerator() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
    }
  };

  const downloadAllAsZip = async () => {
    if (!imageSrc) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageSrc;
      });

      for (const item of SIZES) {
        const canvas = document.createElement('canvas');
        canvas.width = item.size;
        canvas.height = item.size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, item.size, item.size);
          const dataUrl = canvas.toDataURL('image/png');
          const base64Data = dataUrl.split(',')[1];
          zip.file(item.file, base64Data, { base64: true });
        }
      }

      const manifest = {
        name: 'My App',
        short_name: 'App',
        icons: [
          { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
      };
      zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));
      zip.file('html-head-tags.html', htmlTags);

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'favicon_package.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: '📦 Downloaded complete Favicon package ZIP!' },
        })
      );
    } catch (err) {
      console.error('Error creating favicon zip:', err);
      alert('Failed to generate favicon package.');
    } finally {
      setIsZipping(false);
    }
  };

  const generateDataUrl = (size: number): string => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx && imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      ctx.drawImage(img, 0, 0, size, size);
      return canvas.toDataURL('image/png');
    }
    return '';
  };

  const downloadIcon = (size: number, filename: string) => {
    if (!imageSrc) return;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, size, size);
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = imageSrc;
  };

  const htmlTags = `
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" sizes="48x48" href="/favicon-48x48.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">
  `.trim();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied HTML tags!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm mb-8" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link href="/" className="text-primary-600 hover:text-primary-700">Home</Link>
              <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
            </li>
            <li>
              <span className="text-gray-500 dark:text-slate-400" aria-current="page">Favicon Generator</span>
            </li>
          </ol>
        </nav>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Favicon Generator</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400">Generate standard favicons for browsers, iOS, and Android from a single image.</p>
        </div>

        <AdSlot format="horizontal" />

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-xs mb-8">
          <div className="flex flex-col items-center gap-6 mb-12">
            <div className="relative w-full max-w-md flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl cursor-pointer bg-gray-50 dark:bg-slate-950/40 hover:bg-gray-100 dark:hover:bg-slate-800/50 group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleFileUpload(e);
                  e.target.value = '';
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title=""
              />
              <div className="pointer-events-none flex flex-col items-center text-center">
                <span className="text-3xl mb-2">⭐</span>
                <span className="text-gray-900 dark:text-white font-bold mb-1">Upload Square Image</span>
                <span className="text-xs text-gray-500 dark:text-slate-400 mb-3">PNG, JPG, or SVG (min 512x512 recommended)</span>
                <span className="px-5 py-2 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                  Browse Files
                </span>
              </div>
            </div>
            
            {imageSrc && (
              <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm">
                <img src={imageSrc} alt="Source Preview" className="w-full h-full object-contain bg-gray-100 dark:bg-slate-800" />
              </div>
            )}
          </div>

          {imageSrc && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Generated Icons</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">All standard resolutions for web, iOS, and Android</p>
                </div>
                <button
                  onClick={downloadAllAsZip}
                  disabled={isZipping}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-primary-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <span>📦</span>
                  <span>{isZipping ? 'Packaging ZIP...' : 'Download Favicon Package (ZIP)'}</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {SIZES.map((icon, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center bg-gray-50 dark:bg-slate-800/60">
                    <div className="h-24 flex items-center justify-center mb-4">
                      <img src={imageSrc} alt={icon.name} style={{ width: icon.size, height: icon.size }} className="shadow-sm bg-white rounded" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{icon.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{icon.size}x{icon.size} {icon.format.toUpperCase()}</p>
                    <button onClick={() => downloadIcon(icon.size, icon.file)} className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-2 font-semibold text-sm w-full">Download {icon.file}</button>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800 dark:bg-slate-950 text-gray-100 rounded-2xl p-6 border border-gray-700 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg text-white">HTML Integration</h3>
                  <button onClick={() => copyToClipboard(htmlTags)} className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl px-4 py-2 font-semibold text-sm">Copy Code</button>
                </div>
                <pre className="overflow-x-auto text-sm font-mono text-gray-300">
                  <code>{htmlTags}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-xs mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-slate-300">
            <li>Upload a square image (preferably your logo) using the upload box. A size of 512x512 pixels or larger is recommended.</li>
            <li>The tool will automatically resize your image to all standard favicon formats.</li>
            <li>Review the generated icons in the preview cards.</li>
            <li>Download the individual PNG files you need.</li>
            <li>Copy the provided HTML tags snippet and paste it inside the <code>&lt;head&gt;</code> section of your website.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
