'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';
import { PDFDocument } from 'pdf-lib';

export default function SignPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [signatureText, setSignatureText] = useState('');
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.fillStyle = 'transparent';
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }
  }, [mode]);

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      const arrayBuffer = await e.target.files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPageCount(pdfDoc.getPageCount());
    }
  };

  const handleSign = async () => {
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    let dataUrl = '';
    if (mode === 'draw' && canvasRef.current) {
        dataUrl = canvasRef.current.toDataURL('image/png');
    } else if (mode === 'type') {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 400;
        tempCanvas.height = 150;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
            ctx.font = 'italic 48px serif';
            ctx.fillStyle = 'black';
            ctx.fillText(signatureText, 10, 100);
            dataUrl = tempCanvas.toDataURL('image/png');
        }
    }
    
    if (dataUrl) {
      const pngImage = await pdfDoc.embedPng(dataUrl);
      const page = pdfDoc.getPages()[0];
      const { width } = page.getSize();
      const pngDims = pngImage.scale(0.5);
      
      page.drawImage(pngImage, {
        x: width / 2 - pngDims.width / 2,
        y: 100,
        width: pngDims.width,
        height: pngDims.height,
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signed_${file.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <nav className="text-sm mb-8 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Sign PDF</span>
        </nav>

        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sign PDF Online</h1>
          <p className="text-gray-600 dark:text-slate-400">Add an electronic signature to your PDF document quickly and securely.</p>
        </header>

        <AdSlot format="horizontal" />

        {!file ? (
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 rounded-2xl p-10 transition-colors group bg-gray-50/50 dark:bg-slate-950/40 mb-8">
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
                ✍️
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Choose PDF to Sign
              </span>
              <span className="text-xs text-gray-400 mb-4">or drag and drop your document here</span>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <DocumentLiveViewer
              file={file}
              onFileChange={async (newFile) => {
                setFile(newFile);
                const arrayBuffer = await newFile.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                setPageCount(pdfDoc.getPageCount());
              }}
              onRemove={() => {
                setFile(null);
                setPageCount(0);
              }}
            />
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm mb-8">
          {file && (
            <div className="mb-6">
              <p className="text-gray-700 dark:text-slate-300 font-medium mb-4">Selected File: {file.name} ({pageCount} pages)</p>
              
              <div className="mb-4 flex gap-4">
                  <button onClick={() => setMode('draw')} className={`px-4 py-2 rounded-xl font-medium ${mode === 'draw' ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200'}`}>Draw</button>
                  <button onClick={() => setMode('type')} className={`px-4 py-2 rounded-xl font-medium ${mode === 'type' ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200'}`}>Type</button>
              </div>

              {mode === 'draw' ? (
                  <div>
                    <canvas 
                        ref={canvasRef} 
                        width={400} 
                        height={150} 
                        onMouseDown={startDrawing}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onMouseMove={draw}
                        onTouchStart={startDrawing}
                        onTouchEnd={stopDrawing}
                        onTouchMove={draw}
                        className="border border-gray-300 dark:border-slate-700 rounded-xl mb-4 bg-white touch-none" 
                    />
                    <button onClick={clearCanvas} className="text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 block mb-4">Clear Signature</button>
                  </div>
              ) : (
                  <input type="text" value={signatureText} onChange={e => setSignatureText(e.target.value)} placeholder="Type your signature here" className="w-full max-w-md rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 font-serif italic text-2xl mb-4" />
              )}
              
              <button onClick={handleSign} className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-3 font-semibold mt-4 block w-full sm:w-auto">
                Apply Signature & Download
              </button>
            </div>
          )}
        </div>

        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-slate-300 space-y-2">
            <li>Upload your PDF file using the file picker.</li>
            <li>Select your preferred signature mode: "Draw" or "Type".</li>
            <li>If drawing, use your mouse or finger to sign in the canvas area.</li>
            <li>If typing, enter your name to generate a cursive signature.</li>
            <li>Click "Apply Signature & Download" to add the signature to the bottom center of the first page and save the signed file.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
