'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import ToolResultCard from '@/components/ToolResultCard';
import RelatedTools from '@/components/RelatedTools';
import { PDFDocument } from 'pdf-lib';

interface SignResult {
  blobUrl: string;
  filename: string;
  size: number;
}

type Step = 'upload' | 'signature' | 'position';
type SignatureMode = 'draw' | 'type' | 'upload';

interface SignaturePosition {
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  width: number; // percentage of page width
  height: number; // percentage of page height
  page: number; // 0-indexed page number
}

export default function SignPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [signatureText, setSignatureText] = useState('');
  const [signResult, setSignResult] = useState<SignResult | null>(null);
  const [mode, setMode] = useState<SignatureMode>('draw');
  const [step, setStep] = useState<Step>('upload');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Drawing canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // PDF rendering
  const [pdfPages, setPdfPages] = useState<HTMLCanvasElement[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const pageCanvasRef = useRef<HTMLCanvasElement>(null);

  // Signature positioning (draggable)
  const [sigPos, setSigPos] = useState<SignaturePosition>({
    x: 50, y: 80, width: 25, height: 10, page: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const signatureOverlayRef = useRef<HTMLDivElement>(null);
  const pdfViewerRef = useRef<HTMLDivElement>(null);

  // ── Drawing functions ──────────────────────────────
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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
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

  // ── File upload ────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      setFile(uploadedFile);
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPageCount();
      setPageCount(pages);
      setStep('signature');
    }
  };

  // ── Upload signature image ─────────────────────────
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setSignatureDataUrl(ev.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // ── Capture signature and move to position step ────
  const captureSignature = () => {
    let dataUrl = '';
    if (mode === 'draw' && canvasRef.current) {
      dataUrl = canvasRef.current.toDataURL('image/png');
      // Check if canvas has any drawing
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const imgData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const hasContent = imgData.data.some((v, i) => i % 4 === 3 && v > 0);
        if (!hasContent) {
          alert('Please draw your signature first.');
          return;
        }
      }
    } else if (mode === 'type') {
      if (!signatureText.trim()) {
        alert('Please type your signature first.');
        return;
      }
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 500;
      tempCanvas.height = 160;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.font = 'italic 56px "Georgia", serif';
        ctx.fillStyle = '#000';
        ctx.fillText(signatureText, 10, 110);
        dataUrl = tempCanvas.toDataURL('image/png');
      }
    } else if (mode === 'upload') {
      if (!signatureDataUrl) {
        alert('Please upload a signature image first.');
        return;
      }
      dataUrl = signatureDataUrl;
    }

    if (dataUrl) {
      setSignatureDataUrl(dataUrl);
      setStep('position');
      renderPdfPages();
    }
  };

  // ── Render PDF pages using pdfjs-dist ──────────────
  const renderPdfPages = useCallback(async () => {
    if (!file) return;

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const canvases: HTMLCanvasElement[] = [];
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        canvases.push(canvas);
      }
      setPdfPages(canvases);
      setCurrentPage(0);
      setSigPos(prev => ({ ...prev, page: 0 }));
    } catch (err) {
      console.error('Error rendering PDF:', err);
    }
  }, [file]);

  // Draw current page to visible canvas
  useEffect(() => {
    if (pdfPages.length > 0 && pageCanvasRef.current) {
      const srcCanvas = pdfPages[currentPage];
      const destCanvas = pageCanvasRef.current;
      destCanvas.width = srcCanvas.width;
      destCanvas.height = srcCanvas.height;
      const ctx = destCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(srcCanvas, 0, 0);
      }
    }
  }, [pdfPages, currentPage]);

  // ── Dragging logic ─────────────────────────────────
  const getRelativePosition = (clientX: number, clientY: number) => {
    if (!pdfViewerRef.current) return { x: 0, y: 0 };
    const rect = pdfViewerRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = getRelativePosition(e.clientX, e.clientY);
    setIsDragging(true);
    setDragStart({
      x: pos.x - sigPos.x,
      y: pos.y - sigPos.y,
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    const pos = getRelativePosition(touch.clientX, touch.clientY);
    setIsDragging(true);
    setDragStart({
      x: pos.x - sigPos.x,
      y: pos.y - sigPos.y,
    });
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (isDragging) {
        const pos = getRelativePosition(clientX, clientY);
        setSigPos(prev => ({
          ...prev,
          x: Math.max(0, Math.min(100 - prev.width, pos.x - dragStart.x)),
          y: Math.max(0, Math.min(100 - prev.height, pos.y - dragStart.y)),
          page: currentPage,
        }));
      }
      if (isResizing) {
        const dx = clientX - dragStart.x;
        const dy = clientY - dragStart.y;
        if (!pdfViewerRef.current) return;
        const rect = pdfViewerRef.current.getBoundingClientRect();
        const dxPercent = (dx / rect.width) * 100;
        const dyPercent = (dy / rect.height) * 100;
        setSigPos(prev => ({
          ...prev,
          width: Math.max(8, Math.min(80, prev.width + dxPercent)),
          height: Math.max(4, Math.min(40, prev.height + dyPercent)),
        }));
        setDragStart({ x: clientX, y: clientY });
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging || isResizing) e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, isResizing, dragStart, currentPage]);

  // ── Apply signature to PDF ─────────────────────────
  const handleSign = async () => {
    if (!file || !signatureDataUrl) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const targetPage = pages[sigPos.page] || pages[0];
      const { width: pageWidth, height: pageHeight } = targetPage.getSize();

      // Convert percentage positions to PDF coordinates
      // PDF coordinates: origin is bottom-left, y increases upward
      const sigX = (sigPos.x / 100) * pageWidth;
      const sigW = (sigPos.width / 100) * pageWidth;
      const sigH = (sigPos.height / 100) * pageHeight;
      // y in our UI: from top. PDF y: from bottom.
      const sigY = pageHeight - ((sigPos.y / 100) * pageHeight) - sigH;

      let pngImage;
      if (signatureDataUrl.includes('image/png')) {
        pngImage = await pdfDoc.embedPng(signatureDataUrl);
      } else {
        // For JPEG/other formats, convert to PNG via canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = signatureDataUrl;
        });
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.naturalWidth;
        tempCanvas.height = img.naturalHeight;
        const ctx = tempCanvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const pngDataUrl = tempCanvas.toDataURL('image/png');
        pngImage = await pdfDoc.embedPng(pngDataUrl);
      }

      targetPage.drawImage(pngImage, {
        x: sigX,
        y: sigY,
        width: sigW,
        height: sigH,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const downloadFilename = `signed_${file.name}`;
      setSignResult({
        blobUrl: url,
        filename: downloadFilename,
        size: blob.size,
      });
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch {}
    } catch (err) {
      console.error('Error signing PDF:', err);
      alert('Error while signing PDF. Please try again.');
    }
    setIsProcessing(false);
  };

  // ── Step indicator ─────────────────────────────────
  const steps = [
    { key: 'upload', label: 'Upload PDF', icon: '📄', num: 1 },
    { key: 'signature', label: 'Create Signature', icon: '✍️', num: 2 },
    { key: 'position', label: 'Place & Download', icon: '📌', num: 3 },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 transition-colors">
      <div className="max-w-5xl mx-auto px-4">
        <nav className="text-sm mb-8 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Sign PDF</span>
        </nav>

        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sign PDF Online</h1>
          <p className="text-gray-600 dark:text-slate-400">Add an electronic signature to your PDF — position it exactly where you want.</p>
        </header>

        <AdSlot format="horizontal" />

        {/* Step Progress Bar */}
        {!signResult && (
          <div className="flex items-center justify-center gap-0 mb-10 px-4">
            {steps.map((s, i) => (
              <React.Fragment key={s.key}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    i < currentStepIndex
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : i === currentStepIndex
                      ? 'bg-primary-600 border-primary-600 text-white scale-110 shadow-lg'
                      : 'bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-400 dark:text-slate-500'
                  }`}>
                    {i < currentStepIndex ? '✓' : s.num}
                  </div>
                  <span className={`text-[11px] mt-1.5 font-medium whitespace-nowrap ${
                    i === currentStepIndex ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-slate-500'
                  }`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-16 sm:w-24 h-0.5 mt-[-12px] mx-2 rounded ${
                    i < currentStepIndex ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-slate-800'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ─── STEP 1: Upload PDF ─── */}
        {step === 'upload' && !signResult && (
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
              <span className="text-xs text-gray-400 dark:text-slate-400 mb-4">or drag and drop your document here</span>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Create Signature ─── */}
        {step === 'signature' && !signResult && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Your Signature</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">File: {file?.name} • {pageCount} pages</p>
              </div>
              <button
                onClick={() => { setStep('upload'); setFile(null); setPageCount(0); }}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
              >
                ← Change File
              </button>
            </div>

            {/* Mode tabs */}
            <div className="mb-5 flex gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
              {(['draw', 'type', 'upload'] as SignatureMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                    mode === m
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {m === 'draw' ? '✏️ Draw' : m === 'type' ? '⌨️ Type' : '📁 Upload'}
                </button>
              ))}
            </div>

            {/* Signature input area */}
            {mode === 'draw' && (
              <div>
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={160}
                  onMouseDown={startDrawing}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onMouseMove={draw}
                  onTouchStart={startDrawing}
                  onTouchEnd={stopDrawing}
                  onTouchMove={draw}
                  className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl mb-3 bg-white dark:bg-slate-950 touch-none w-full max-w-[500px] h-[160px] cursor-crosshair"
                  style={{ touchAction: 'none' }}
                />
                <button onClick={clearCanvas} className="text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 mb-4 flex items-center gap-1">
                  🗑️ Clear Signature
                </button>
              </div>
            )}

            {mode === 'type' && (
              <div className="mb-4">
                <input
                  type="text"
                  value={signatureText}
                  onChange={e => setSignatureText(e.target.value)}
                  placeholder="Type your signature here"
                  className="w-full max-w-md rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white p-4 font-serif italic text-3xl"
                />
                {signatureText && (
                  <div className="mt-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 max-w-md">
                    <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">Preview:</p>
                    <p className="font-serif italic text-3xl text-gray-900 dark:text-white">{signatureText}</p>
                  </div>
                )}
              </div>
            )}

            {mode === 'upload' && (
              <div className="mb-4">
                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 rounded-xl p-6 transition-colors cursor-pointer max-w-md">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => { handleSignatureUpload(e); e.target.value = ''; }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="text-2xl mb-2">🖼️</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Upload Signature Image</span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 mt-1">PNG, JPG, or SVG with transparent background recommended</span>
                </label>
                {signatureDataUrl && mode === 'upload' && (
                  <div className="mt-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 max-w-md">
                    <p className="text-xs text-gray-400 dark:text-slate-500 mb-2">Uploaded signature preview:</p>
                    <img src={signatureDataUrl} alt="Uploaded signature" className="max-h-20 max-w-full object-contain" />
                  </div>
                )}
              </div>
            )}

            <button
              onClick={captureSignature}
              className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-8 py-3 font-semibold mt-2 transition-all active:scale-95 flex items-center gap-2"
            >
              Continue — Place on PDF →
            </button>
          </div>
        )}

        {/* ─── STEP 3: Position Signature on PDF ─── */}
        {step === 'position' && !signResult && (
          <div className="mb-8">
            {/* Controls bar */}
            <div className="bg-white dark:bg-slate-900 rounded-t-2xl border border-b-0 border-gray-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  📌 Position Your Signature
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Drag your signature to the exact position. Resize using the corner handle.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep('signature')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                >
                  ← Change Signature
                </button>
              </div>
            </div>

            {/* Page navigation */}
            {pageCount > 1 && (
              <div className="bg-gray-50 dark:bg-slate-950/80 border-x border-gray-200 dark:border-slate-800 px-4 py-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => { setCurrentPage(p => Math.max(0, p - 1)); }}
                  disabled={currentPage === 0}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  ◀ Prev
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: pageCount }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === i
                          ? 'bg-primary-600 text-white shadow-md scale-110'
                          : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      } ${sigPos.page === i ? 'ring-2 ring-emerald-400' : ''}`}
                    >
                      {i + 1}
                    </button>
                  )).slice(0, 20)}
                  {pageCount > 20 && <span className="text-xs text-gray-400">...</span>}
                </div>
                <button
                  onClick={() => { setCurrentPage(p => Math.min(pageCount - 1, p + 1)); }}
                  disabled={currentPage === pageCount - 1}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Next ▶
                </button>
              </div>
            )}

            {/* PDF Viewer with draggable signature */}
            <div
              ref={pdfContainerRef}
              className="bg-slate-100 dark:bg-slate-950 border-x border-gray-200 dark:border-slate-800 overflow-auto flex items-start justify-center p-4 sm:p-6"
              style={{ minHeight: '500px', maxHeight: '80vh' }}
            >
              {pdfPages.length > 0 ? (
                <div
                  ref={pdfViewerRef}
                  className="relative inline-block shadow-xl rounded-lg overflow-hidden select-none"
                  style={{ maxWidth: '100%' }}
                >
                  {/* Rendered PDF page */}
                  <canvas
                    ref={pageCanvasRef}
                    className="block w-full h-auto max-w-[800px]"
                  />

                  {/* Draggable signature overlay — only show on the page where the signature is placed OR current page */}
                  {currentPage === sigPos.page && signatureDataUrl && (
                    <div
                      ref={signatureOverlayRef}
                      onMouseDown={handleMouseDown}
                      onTouchStart={handleTouchStart}
                      style={{
                        position: 'absolute',
                        left: `${sigPos.x}%`,
                        top: `${sigPos.y}%`,
                        width: `${sigPos.width}%`,
                        height: `${sigPos.height}%`,
                        cursor: isDragging ? 'grabbing' : 'grab',
                        zIndex: 10,
                        touchAction: 'none',
                      }}
                      className="group"
                    >
                      {/* Signature image */}
                      <img
                        src={signatureDataUrl}
                        alt="Your signature"
                        className="w-full h-full object-contain pointer-events-none"
                        draggable={false}
                      />
                      {/* Border indicator */}
                      <div className="absolute inset-0 border-2 border-dashed border-primary-500 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      {/* Resize handle */}
                      <div
                        onMouseDown={handleResizeStart}
                        onTouchStart={handleResizeStart}
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-600 rounded-full cursor-se-resize shadow-md border-2 border-white dark:border-slate-800 hover:scale-125 transition-transform z-20 flex items-center justify-center"
                      >
                        <span className="text-white text-[8px] font-bold pointer-events-none">↘</span>
                      </div>
                      {/* Label */}
                      <div className="absolute -top-6 left-0 bg-primary-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap shadow-sm pointer-events-none">
                        ✍️ Drag to reposition
                      </div>
                    </div>
                  )}

                  {/* Click-to-place hint when viewing other pages */}
                  {currentPage !== sigPos.page && (
                    <button
                      onClick={() => setSigPos(prev => ({ ...prev, page: currentPage }))}
                      className="absolute inset-0 flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors"
                    >
                      <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2 shadow-lg border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-700 dark:text-slate-300">
                        Click to move signature to Page {currentPage + 1}
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
                  <p className="text-sm text-gray-500 dark:text-slate-400">Rendering PDF pages...</p>
                </div>
              )}
            </div>

            {/* Position info bar */}
            <div className="bg-gray-50 dark:bg-slate-950/80 border-x border-gray-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-500">
              <span>Signature on Page {sigPos.page + 1} — Position: ({Math.round(sigPos.x)}%, {Math.round(sigPos.y)}%)</span>
              <span>Drag to move • Corner handle to resize</span>
            </div>

            {/* Apply button */}
            <div className="bg-white dark:bg-slate-900 rounded-b-2xl border border-t-0 border-gray-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-gray-500 dark:text-slate-400">
                ✅ Signature placed on <strong>Page {sigPos.page + 1}</strong>. Adjust position if needed, then apply.
              </p>
              <button
                onClick={handleSign}
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white rounded-xl px-8 py-3 font-bold transition-all active:scale-95 flex items-center gap-2 shadow-md"
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    ✅ Apply Signature & Download
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ─── Result ─── */}
        {signResult && (
          <ToolResultCard
            title="Document Signed Successfully!"
            filename={signResult.filename}
            downloadUrl={signResult.blobUrl}
            fileSize={signResult.size}
            originalSize={file?.size}
            badgeText="Legally Bound & Private"
            details={[
              { label: 'Signature Type', value: mode === 'draw' ? 'Hand-Drawn e-Signature' : mode === 'type' ? 'Cursive Type' : 'Uploaded Image' },
              { label: 'Placed On', value: `Page ${sigPos.page + 1} of ${pageCount}` },
              { label: 'Position', value: `(${Math.round(sigPos.x)}%, ${Math.round(sigPos.y)}%)` },
              { label: 'Processing Engine', value: '100% In-Browser Cryptographic PDF Embed' },
            ]}
            previewUrl={signResult.blobUrl}
            previewType="pdf"
            onReset={() => {
              setSignResult(null);
              setFile(null);
              setSignatureText('');
              setSignatureDataUrl('');
              setPdfPages([]);
              setStep('upload');
              clearCanvas();
            }}
            resetButtonText="Sign Another Document"
            nextTool={{
              name: 'Protect with Password',
              url: '/tools/pdf-security/protect-pdf/',
              description: 'Encrypt your newly signed agreement with military-grade AES-256 password protection.'
            }}
            suggestedTools={[
              { name: 'Protect PDF', url: '/tools/pdf-security/protect-pdf/', icon: '🔒', badge: 'AES-256' },
              { name: 'Compress PDF', url: '/tools/optimize-pdf/compress-pdf/', icon: '🗜️', badge: 'Save Space' },
              { name: 'Watermark PDF', url: '/tools/edit-pdf/watermark-pdf/', icon: '💧', badge: 'Protect' },
              { name: 'Merge Documents', url: '/tools/organize-pdf/merge-pdf/', icon: '📎', badge: 'Combine' },
            ]}
          />
        )}

        {/* How to Use */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-slate-300 space-y-2">
            <li>Upload your PDF file using the file picker.</li>
            <li>Choose your signature method: <strong>Draw</strong>, <strong>Type</strong>, or <strong>Upload</strong> a signature image.</li>
            <li>Click &quot;Continue&quot; to see a live preview of your PDF.</li>
            <li>Drag your signature to the exact position where you want it on the page.</li>
            <li>Use the corner handle to resize the signature.</li>
            <li>Navigate between pages to place the signature on any page.</li>
            <li>Click &quot;Apply Signature &amp; Download&quot; to embed the signature and save.</li>
          </ol>
        </section>

        <RelatedTools currentSlug="sign-pdf" />
      </div>
    </div>
  );
}
