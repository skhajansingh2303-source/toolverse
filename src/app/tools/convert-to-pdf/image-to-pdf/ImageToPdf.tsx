'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';

interface ImageFile {
  file: File;
  previewUrl: string;
}

export default function ImageToPdf() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Fit'>('A4');
  const [orientation, setOrientation] = useState<'Portrait' | 'Landscape' | 'Auto'>('Portrait');
  const [margin, setMargin] = useState<'None' | 'Small' | 'Medium'>('None');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.type.startsWith('image/'));
    if (validFiles.length > 0) {
      const newImages = validFiles.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newImages]);
      setError('');
    } else {
      setError('Please provide valid image files (JPG, PNG, WebP).');
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].previewUrl);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === images.length - 1)) return;
    setImages(prev => {
      const newImages = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = newImages[targetIndex];
      newImages[targetIndex] = newImages[index];
      newImages[index] = temp;
      return newImages;
    });
  };

  const convertWebpToPng = async (file: File): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Failed to get canvas context'));
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
          if (!blob) return reject(new Error('Canvas to Blob failed'));
          const reader = new FileReader();
          reader.onloadend = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        }, 'image/png');
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const pdfDoc = await PDFDocument.create();

      for (const imgFile of images) {
        const { file } = imgFile;
        let imageToEmbed;
        
        try {
          if (file.type === 'image/png') {
            const bytes = await file.arrayBuffer();
            imageToEmbed = await pdfDoc.embedPng(bytes);
          } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            const bytes = await file.arrayBuffer();
            imageToEmbed = await pdfDoc.embedJpg(bytes);
          } else {
            // WebP or other, try canvas conversion
            const pngBytes = await convertWebpToPng(file);
            imageToEmbed = await pdfDoc.embedPng(pngBytes);
          }
        } catch (err) {
          console.error('Error embedding image', file.name, err);
          throw new Error('Failed to process image: ' + file.name);
        }

        const imgWidth = imageToEmbed.width;
        const imgHeight = imageToEmbed.height;

        let pageWidth = 595.28; // A4 default
        let pageHeight = 841.89;

        if (pageSize === 'Fit') {
          pageWidth = imgWidth;
          pageHeight = imgHeight;
        } else if (pageSize === 'Letter') {
          pageWidth = 612;
          pageHeight = 792;
        }

        // Handle Orientation (if not 'Fit')
        if (pageSize !== 'Fit') {
          const isImgLandscape = imgWidth > imgHeight;
          if (orientation === 'Landscape' || (orientation === 'Auto' && isImgLandscape)) {
            const temp = pageWidth;
            pageWidth = pageHeight;
            pageHeight = temp;
          }
        }

        const marginMap = { 'None': 0, 'Small': 20, 'Medium': 40 };
        const m = pageSize === 'Fit' ? 0 : marginMap[margin];

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        const availWidth = pageWidth - (2 * m);
        const availHeight = pageHeight - (2 * m);
        
        const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight);
        
        const finalWidth = imgWidth * scale;
        const finalHeight = imgHeight * scale;
        
        const x = m + (availWidth - finalWidth) / 2;
        const y = m + (availHeight - finalHeight) / 2;

        page.drawImage(imageToEmbed, {
          x,
          y,
          width: finalWidth,
          height: finalHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'images_converted.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess('PDF successfully generated with ' + images.length + ' page(s)!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while creating the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <nav className="text-sm mb-8" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              <svg className="fill-current w-3 h-3 mx-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
            </li>
            <li>
              <span className="text-gray-700" aria-current="page">Image to PDF</span>
            </li>
          </ol>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Image to PDF</h1>
          <p className="text-gray-600">Convert JPG, PNG, and WebP images into a single PDF document.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors group mb-6 ${
              isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-gray-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                handleFileSelect(e);
                e.target.value = '';
              }}
              multiple
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title=""
            />
            <div className="pointer-events-none flex flex-col items-center">
              <div className="mx-auto w-12 h-12 text-primary-500 mb-3">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Click to select or drag and drop images here</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Supports JPG, PNG, and WebP</p>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>

          {images.length > 0 && (
            <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50 aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.previewUrl} alt={img.file.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <button onClick={(e) => { e.stopPropagation(); removeImage(index); }} className="self-end p-1 text-white hover:text-red-400 bg-black bg-opacity-50 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <div className="flex justify-between">
                      <button onClick={(e) => { e.stopPropagation(); moveImage(index, 'up'); }} disabled={index === 0} className="p-1 text-white hover:text-primary-400 disabled:opacity-30 bg-black bg-opacity-50 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); moveImage(index, 'down'); }} disabled={index === images.length - 1} className="p-1 text-white hover:text-primary-400 disabled:opacity-30 bg-black bg-opacity-50 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
              <select value={pageSize} onChange={(e) => setPageSize(e.target.value as any)} className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3">
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
                <option value="Fit">Fit to Image</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
              <select value={orientation} onChange={(e) => setOrientation(e.target.value as any)} disabled={pageSize === 'Fit'} className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3 disabled:bg-gray-100 disabled:text-gray-400">
                <option value="Portrait">Portrait</option>
                <option value="Landscape">Landscape</option>
                <option value="Auto">Auto (based on image)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Margin</label>
              <select value={margin} onChange={(e) => setMargin(e.target.value as any)} disabled={pageSize === 'Fit'} className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3 disabled:bg-gray-100 disabled:text-gray-400">
                <option value="None">None</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
              </select>
            </div>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>}
          {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl">{success}</div>}

          <button
            onClick={generatePdf}
            disabled={isProcessing || images.length === 0}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-xl px-6 py-3 font-semibold transition-colors flex justify-center items-center"
          >
            {isProcessing ? 'Generating PDF...' : 'Convert to PDF'}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use</h2>
          <ol className="list-decimal pl-5 space-y-3 text-gray-600">
            <li>Upload one or more images (JPG, PNG, WebP) by dragging and dropping or selecting them.</li>
            <li>Reorder the images if necessary using the arrow buttons that appear when hovering over a thumbnail.</li>
            <li>Choose your preferred page size, orientation, and margin settings for the PDF document.</li>
            <li>Click "Convert to PDF" to generate and download your new PDF file.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
