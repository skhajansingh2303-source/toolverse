'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import ToolResultCard from '@/components/ToolResultCard';
import { PDFDocument } from 'pdf-lib';

export default function ScanToPdf() {
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState<'normal' | 'grayscale' | 'contrast'>('normal');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraOn(true);
        }
      } catch (err) {
        console.error("Error accessing camera", err);
        alert("Could not access camera");
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (filter === 'grayscale') {
        ctx.filter = 'grayscale(100%)';
      } else if (filter === 'contrast') {
        ctx.filter = 'contrast(150%)';
      }
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setImages(prev => [...prev, canvas.toDataURL('image/jpeg')]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const compilePdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const imgStr of images) {
        let pdfImage;
        if (imgStr.includes('image/jpeg') || imgStr.includes('image/jpg')) {
          pdfImage = await pdfDoc.embedJpg(imgStr);
        } else {
          pdfImage = await pdfDoc.embedPng(imgStr);
        }
        const { width, height } = pdfImage.scale(1);
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(pdfImage, { x: 0, y: 0, width, height });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
      setResultUrl(url);
      setResultSize(blob.size);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `📄 Scanned PDF generated from ${images.length} pages! Preview ready below.` },
        })
      );
    } catch (e: any) {
      console.error(e);
      alert('Error creating PDF: ' + (e.message || ''));
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <nav className="text-sm text-gray-500 dark:text-slate-400 mb-4">
            <Link href="/" className="hover:text-primary-600">Home</Link> / Scan to PDF
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Scan to PDF</h1>
          <p className="text-gray-600 dark:text-slate-300">Convert physical documents or photos into a unified PDF.</p>
        </div>

        <AdSlot format="horizontal" />

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 mb-8 mt-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Upload Photos</label>
              <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-3 text-center hover:border-primary-500 cursor-pointer bg-gray-50/50 dark:bg-slate-950/40 group">
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    handleFileUpload(e);
                    e.target.value = '';
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title=""
                />
                <div className="pointer-events-none flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <span>📁</span>
                  <span className="font-semibold text-primary-600 group-hover:text-primary-700">Choose Photos</span>
                  <span className="text-xs text-gray-400 dark:text-slate-400">or drop here</span>
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-end">
              <button 
                onClick={toggleCamera}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl px-4 py-3 font-semibold"
              >
                {isCameraOn ? 'Turn Off Camera' : 'Use Camera'}
              </button>
            </div>
          </div>

          {isCameraOn && (
            <div className="mb-6">
              <video ref={videoRef} autoPlay playsInline className="w-full max-h-[400px] object-contain bg-black rounded-xl mb-4"></video>
              <div className="flex gap-4 mb-4">
                <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="rounded-xl border border-gray-300 dark:border-slate-700 p-2">
                  <option value="normal">Normal Color</option>
                  <option value="grayscale">Grayscale</option>
                  <option value="contrast">High Contrast</option>
                </select>
                <button onClick={capturePhoto} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-2 font-semibold">Snap Photo</button>
              </div>
            </div>
          )}

          {images.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pages ({images.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-[3/4] bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800">
                    <img src={img} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={compilePdf}
            disabled={images.length === 0 || isProcessing}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-3 font-semibold disabled:opacity-50 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            <span>📄</span>
            <span>{isProcessing ? 'Generating PDF...' : 'Compile Scanned PDF & Preview →'}</span>
          </button>
        </div>

        {/* Live Scanned PDF Result Card with Preview First & Download Button */}
        {resultUrl && images.length > 0 && (
          <ToolResultCard
            title="Scanned PDF Generated Successfully!"
            filename="scanned_document.pdf"
            downloadUrl={resultUrl}
            fileSize={resultSize}
            badgeText={`${images.length} Scanned Pages Compiled`}
            previewUrl={resultUrl}
            previewType="pdf"
            details={[
              { label: 'Total Pages', value: images.length },
              { label: 'Filter Style', value: filter.toUpperCase() },
            ]}
            onReset={() => {
              if (resultUrl) URL.revokeObjectURL(resultUrl);
              setResultUrl(null);
            }}
            resetButtonText="Add More Pages or Rescan"
            nextTool={{
              name: 'Compress PDF',
              url: '/tools/optimize-pdf/compress-pdf',
              description: 'Compress scanned pages to make the file smaller and email-ready.'
            }}
          />
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-slate-300">
            <li>Upload images of your document or use your device's camera to snap pages.</li>
            <li>Use the document filters if scanning physical paper via camera.</li>
            <li>Review the snapped pages and remove any mistakes.</li>
            <li>Click "Compile Scanned PDF" to generate your final PDF.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
