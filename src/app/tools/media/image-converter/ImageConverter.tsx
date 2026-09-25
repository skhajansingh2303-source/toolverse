'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.9);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    setFile(uploadedFile);
    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
    
    // Auto-select a different target format than the uploaded one if possible
    if (uploadedFile.type === 'image/jpeg') setTargetFormat('image/png');
    else setTargetFormat('image/jpeg');
  };

  const getExtension = (mime: string) => {
    switch (mime) {
      case 'image/jpeg': return '.jpg';
      case 'image/png': return '.png';
      case 'image/webp': return '.webp';
      default: return '.jpg';
    }
  };

  const getFormatLabel = (mime: string) => {
    switch (mime) {
      case 'image/jpeg': return 'JPG';
      case 'image/png': return 'PNG';
      case 'image/webp': return 'WebP';
      default: return 'JPG';
    }
  };

  const handleProcess = () => {
    if (!previewUrl || !file) return;
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Fill white background for transparent to JPG conversions
        if (targetFormat === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
            link.download = `${originalName}_converted${getExtension(targetFormat)}`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
          setIsProcessing(false);
        }, targetFormat, quality);
      }
    };
    img.src = previewUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <nav className="text-sm font-medium text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white">Image Converter</span>
        </nav>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Image Format Converter</h1>
          <p className="text-gray-600 dark:text-slate-300">Convert your images between PNG, JPG, and WebP instantly in your browser.</p>
        </div>

        <AdSlot format="horizontal" />

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 space-y-6">
          {!previewUrl ? (
            <div
              className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-12 text-center hover:border-primary-500 transition-colors group"
            >
              <input
                type="file"
                accept="image/*"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium text-gray-900 dark:text-white">Click or drop an image here</p>
                <p className="text-xs text-gray-400 dark:text-slate-400 mb-4">Supports PNG, JPG, BMP, WebP</p>
                <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                  Browse Files
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Original Format: {file?.type.split('/')[1].toUpperCase()}
                </div>
                <button
                  onClick={() => { setFile(null); setPreviewUrl(''); }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove Image
                </button>
              </div>

              <div className="flex justify-center max-h-64 bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden p-2">
                <img src={previewUrl} alt="Preview" className="object-contain h-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Convert to Format</label>
                  <select
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3"
                  >
                    <option value="image/png">PNG</option>
                    <option value="image/jpeg">JPG / JPEG</option>
                    <option value="image/webp">WebP</option>
                  </select>
                </div>

                {(targetFormat === 'image/jpeg' || targetFormat === 'image/webp') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                      Quality: {Math.round(quality * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full mt-2"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-slate-800">
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl px-8 py-3 font-semibold transition-colors"
                >
                  {isProcessing ? 'Converting...' : `Convert to ${getFormatLabel(targetFormat)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-slate-300">
            <li>Upload an image file using the area above.</li>
            <li>Select the format you want to convert it to (PNG, JPG, or WebP).</li>
            <li>If selecting JPG or WebP, adjust the quality slider to balance image size and clarity.</li>
            <li>Click "Convert" to instantly process and download the new image format securely in your browser.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
