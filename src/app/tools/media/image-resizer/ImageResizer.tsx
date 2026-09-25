'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  
  const [resizeMode, setResizeMode] = useState<'pixels' | 'percentage'>('pixels');
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [percentage, setPercentage] = useState<number>(50);
  
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

    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setWidth(img.width);
      setHeight(img.height);
    };
    img.src = url;
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (maintainAspectRatio && originalWidth > 0) {
      setHeight(Math.round((val * originalHeight) / originalWidth));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (maintainAspectRatio && originalHeight > 0) {
      setWidth(Math.round((val * originalWidth) / originalHeight));
    }
  };

  const handleProcess = () => {
    if (!previewUrl) return;
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      
      let finalWidth = width;
      let finalHeight = height;
      
      if (resizeMode === 'percentage') {
        finalWidth = Math.round(originalWidth * (percentage / 100));
        finalHeight = Math.round(originalHeight * (percentage / 100));
      }

      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `resized_${file?.name || 'image.png'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
          setIsProcessing(false);
        }, file?.type || 'image/png', 0.95);
      }
    };
    img.src = previewUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <nav className="text-sm font-medium text-gray-500">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Image Resizer</span>
        </nav>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Image Resizer</h1>
          <p className="text-gray-600">Quickly resize your images online without losing quality.</p>
        </div>

        <AdSlot format="horizontal" />

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 space-y-6">
          {!previewUrl ? (
            <div
              className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-12 text-center hover:border-primary-500 transition-colors group"
            >
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
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
                <p className="text-xs text-gray-400 mb-4">PNG, JPG, or WebP</p>
                <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                  Browse Files
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-sm font-medium text-gray-900 truncate">
                  Original Size: {originalWidth} x {originalHeight} px
                </div>
                <button
                  onClick={() => { setFile(null); setPreviewUrl(''); }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove Image
                </button>
              </div>

              <div className="flex justify-center max-h-64 bg-gray-100 rounded-xl overflow-hidden p-2">
                <img src={previewUrl} alt="Preview" className="object-contain h-full" />
              </div>

              <div className="space-y-6">
                <div className="flex space-x-4 border-b border-gray-200 pb-2">
                  <button
                    onClick={() => setResizeMode('pixels')}
                    className={`font-semibold ${resizeMode === 'pixels' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'} pb-2`}
                  >
                    By Pixels
                  </button>
                  <button
                    onClick={() => setResizeMode('percentage')}
                    className={`font-semibold ${resizeMode === 'percentage' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'} pb-2`}
                  >
                    By Percentage
                  </button>
                </div>

                {resizeMode === 'pixels' ? (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Width (px)</label>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                        className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height (px)</label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                        className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3"
                      />
                    </div>
                    <div className="col-span-2 flex items-center">
                      <input
                        type="checkbox"
                        id="maintainAspect"
                        checked={maintainAspectRatio}
                        onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label htmlFor="maintainAspect" className="ml-2 text-sm text-gray-700">
                        Maintain Aspect Ratio
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Percentage: {percentage}%</label>
                    <div className="flex gap-4 mb-4">
                      {[25, 50, 75, 150, 200].map(p => (
                        <button
                          key={p}
                          onClick={() => setPercentage(p)}
                          className={`px-4 py-2 rounded-xl border ${percentage === p ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                          {p}%
                        </button>
                      ))}
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      value={percentage}
                      onChange={(e) => setPercentage(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="mt-2 text-sm text-gray-500 text-center">
                      New Size: {Math.round(originalWidth * (percentage / 100))} x {Math.round(originalHeight * (percentage / 100))} px
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl px-8 py-3 font-semibold transition-colors"
                  >
                    {isProcessing ? 'Resizing...' : 'Resize & Download'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Upload an image by clicking the drop zone.</li>
            <li>Choose how you want to resize: by specific pixels or by a percentage.</li>
            <li>If using pixels, check "Maintain Aspect Ratio" to prevent distortion.</li>
            <li>Click "Resize & Download" to get your new image instantly.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
