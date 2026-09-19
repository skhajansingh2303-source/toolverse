'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import AdSlot from '@/components/AdSlot';
import RelatedTools from '@/components/RelatedTools';

type ToolType = 'pen' | 'text' | 'highlight' | 'rectangle' | 'stamp';

interface Point {
  x: number;
  y: number;
}

interface BaseAnnotation {
  id: string;
  type: ToolType;
  color: string;
}

interface PenAnnotation extends BaseAnnotation {
  type: 'pen';
  points: Point[];
  strokeWidth: number;
}

interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

interface HighlightAnnotation extends BaseAnnotation {
  type: 'highlight';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RectAnnotation extends BaseAnnotation {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  strokeWidth: number;
  isFilled: boolean;
}

interface StampAnnotation extends BaseAnnotation {
  type: 'stamp';
  x: number;
  y: number;
  stampText: string;
  subText?: string;
  borderColor: string;
}

type Annotation =
  | PenAnnotation
  | TextAnnotation
  | HighlightAnnotation
  | RectAnnotation
  | StampAnnotation;

const STAMP_PRESETS = [
  { label: 'APPROVED', color: '#16a34a', border: '#15803d' },
  { label: 'CONFIDENTIAL', color: '#dc2626', border: '#b91c1c' },
  { label: 'REJECTED', color: '#ea580c', border: '#c2410c' },
  { label: 'DRAFT', color: '#d97706', border: '#b45309' },
  { label: 'FINAL', color: '#2563eb', border: '#1d4ed8' },
  { label: 'PAID', color: '#059669', border: '#047857' },
];

export default function EditPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfjsLoaded, setPdfjsLoaded] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Tool state
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [currentColor, setCurrentColor] = useState<string>('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [fontSize, setFontSize] = useState<number>(20);
  const [textInput, setTextInput] = useState<string>('Sample Text');
  const [selectedStamp, setSelectedStamp] = useState<string>('APPROVED');
  const [rectFilled, setRectFilled] = useState<boolean>(false);

  // Annotations per page: pageNumber (1-indexed) -> Annotation[]
  const [annotations, setAnnotations] = useState<Record<number, Annotation[]>>({});

  // Canvas interaction
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [currentPenPoints, setCurrentPenPoints] = useState<Point[]>([]);
  const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
  const [currentDragPoint, setCurrentDragPoint] = useState<Point | null>(null);

  // Canvas refs
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep track of loaded PDF doc proxy
  const pdfDocProxyRef = useRef<any>(null);

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

  // Handle PDF file upload
  const handleFileUpload = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file.');
      return;
    }

    setError('');
    setSuccess('');
    setFile(uploadedFile);
    setAnnotations({});
    setCurrentPage(1);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pagesCount = pdfDoc.getPageCount();
      setTotalPages(pagesCount);

      if ((window as any).pdfjsLib) {
        const loadingTask = (window as any).pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;
        pdfDocProxyRef.current = pdf;
      }
    } catch (err: any) {
      setError('Error loading PDF: ' + (err.message || 'Corrupted or unsupported file.'));
    }
  };

  // Redraw annotation canvas
  const redrawAnnotations = useCallback(
    (previewCurrent: boolean = false) => {
      const canvas = overlayCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pageAnns = annotations[currentPage] || [];

      // Draw saved annotations
      for (const ann of pageAnns) {
        if (ann.type === 'pen') {
          if (ann.points.length < 2) continue;
          ctx.save();
          ctx.beginPath();
          ctx.strokeStyle = ann.color;
          ctx.lineWidth = ann.strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.moveTo(ann.points[0].x, ann.points[0].y);
          for (let i = 1; i < ann.points.length; i++) {
            ctx.lineTo(ann.points[i].x, ann.points[i].y);
          }
          ctx.stroke();
          ctx.restore();
        } else if (ann.type === 'text') {
          ctx.save();
          ctx.font = `bold ${ann.fontSize}px sans-serif`;
          ctx.fillStyle = ann.color;
          ctx.fillText(ann.text, ann.x, ann.y);
          ctx.restore();
        } else if (ann.type === 'highlight') {
          ctx.save();
          ctx.fillStyle = ann.color;
          ctx.globalAlpha = 0.35;
          ctx.fillRect(ann.x, ann.y, ann.width, ann.height);
          ctx.restore();
        } else if (ann.type === 'rectangle') {
          ctx.save();
          ctx.strokeStyle = ann.color;
          ctx.lineWidth = ann.strokeWidth;
          if (ann.isFilled) {
            ctx.fillStyle = ann.color;
            ctx.fillRect(ann.x, ann.y, ann.width, ann.height);
          }
          ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
          ctx.restore();
        } else if (ann.type === 'stamp') {
          ctx.save();
          ctx.font = 'bold 22px sans-serif';
          const textMetrics = ctx.measureText(ann.stampText);
          const padX = 20;
          const padY = 12;
          const w = textMetrics.width + padX * 2;
          const h = 42;

          ctx.translate(ann.x, ann.y);
          ctx.rotate(-0.08); // Slight stamp angle
          ctx.fillStyle = ann.color + '15';
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = ann.borderColor;
          ctx.lineWidth = 3;
          ctx.strokeRect(-w / 2, -h / 2, w, h);

          ctx.fillStyle = ann.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ann.stampText, 0, 0);
          ctx.restore();
        }
      }

      // Draw active in-progress preview
      if (previewCurrent) {
        if (activeTool === 'pen' && currentPenPoints.length > 1) {
          ctx.save();
          ctx.beginPath();
          ctx.strokeStyle = currentColor;
          ctx.lineWidth = strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.moveTo(currentPenPoints[0].x, currentPenPoints[0].y);
          for (let i = 1; i < currentPenPoints.length; i++) {
            ctx.lineTo(currentPenPoints[i].x, currentPenPoints[i].y);
          }
          ctx.stroke();
          ctx.restore();
        } else if (
          (activeTool === 'rectangle' || activeTool === 'highlight') &&
          dragStartPoint &&
          currentDragPoint
        ) {
          const x = Math.min(dragStartPoint.x, currentDragPoint.x);
          const y = Math.min(dragStartPoint.y, currentDragPoint.y);
          const w = Math.abs(currentDragPoint.x - dragStartPoint.x);
          const h = Math.abs(currentDragPoint.y - dragStartPoint.y);

          ctx.save();
          if (activeTool === 'highlight') {
            ctx.fillStyle = currentColor;
            ctx.globalAlpha = 0.35;
            ctx.fillRect(x, y, w, h);
          } else {
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = strokeWidth;
            if (rectFilled) {
              ctx.fillStyle = currentColor;
              ctx.fillRect(x, y, w, h);
            }
            ctx.strokeRect(x, y, w, h);
          }
          ctx.restore();
        }
      }
    },
    [
      annotations,
      currentPage,
      activeTool,
      currentColor,
      strokeWidth,
      rectFilled,
      currentPenPoints,
      dragStartPoint,
      currentDragPoint,
    ]
  );

  // Render PDF page onto baseCanvas
  const renderPdfPage = useCallback(async () => {
    if (!file) return;
    setIsRendering(true);

    try {
      if (pdfDocProxyRef.current) {
        const page = await pdfDocProxyRef.current.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.5 });

        const baseCanvas = baseCanvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        if (!baseCanvas || !overlayCanvas) return;

        baseCanvas.width = viewport.width;
        baseCanvas.height = viewport.height;
        overlayCanvas.width = viewport.width;
        overlayCanvas.height = viewport.height;

        const ctx = baseCanvas.getContext('2d');
        if (ctx) {
          const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
          };
          await page.render(renderContext).promise;
        }
      } else {
        // Fallback placeholder if pdfjs isn't ready
        const baseCanvas = baseCanvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        if (baseCanvas && overlayCanvas) {
          baseCanvas.width = 600;
          baseCanvas.height = 800;
          overlayCanvas.width = 600;
          overlayCanvas.height = 800;
          const ctx = baseCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 600, 800);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Page ${currentPage} (Loading renderer...)`, 300, 400);
          }
        }
      }
    } catch (e: any) {
      console.error('Error rendering page:', e);
    } finally {
      setIsRendering(false);
      redrawAnnotations();
    }
  }, [file, currentPage, redrawAnnotations]);

  useEffect(() => {
    if (file) {
      renderPdfPage();
    }
  }, [file, currentPage, renderPdfPage, pdfjsLoaded]);

  // Coordinate helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Mouse / Pointer handlers on overlay canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsInteracting(true);

    if (activeTool === 'pen') {
      setCurrentPenPoints([coords]);
    } else if (activeTool === 'rectangle' || activeTool === 'highlight') {
      setDragStartPoint(coords);
      setCurrentDragPoint(coords);
    } else if (activeTool === 'text') {
      const newAnn: TextAnnotation = {
        id: Date.now().toString(),
        type: 'text',
        x: coords.x,
        y: coords.y,
        text: textInput.trim() || 'Sample Text',
        fontSize: fontSize,
        color: currentColor,
      };
      setAnnotations((prev) => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newAnn],
      }));
      setIsInteracting(false);
    } else if (activeTool === 'stamp') {
      const preset = STAMP_PRESETS.find((s) => s.label === selectedStamp) || STAMP_PRESETS[0];
      const newAnn: StampAnnotation = {
        id: Date.now().toString(),
        type: 'stamp',
        x: coords.x,
        y: coords.y,
        stampText: preset.label,
        borderColor: preset.border,
        color: preset.color,
      };
      setAnnotations((prev) => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newAnn],
      }));
      setIsInteracting(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInteracting) return;
    const coords = getCanvasCoords(e);

    if (activeTool === 'pen') {
      setCurrentPenPoints((prev) => [...prev, coords]);
      redrawAnnotations(true);
    } else if (activeTool === 'rectangle' || activeTool === 'highlight') {
      setCurrentDragPoint(coords);
      redrawAnnotations(true);
    }
  };

  const handleMouseUp = () => {
    if (!isInteracting) return;
    setIsInteracting(false);

    if (activeTool === 'pen' && currentPenPoints.length > 1) {
      const newAnn: PenAnnotation = {
        id: Date.now().toString(),
        type: 'pen',
        points: currentPenPoints,
        strokeWidth: strokeWidth,
        color: currentColor,
      };
      setAnnotations((prev) => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newAnn],
      }));
      setCurrentPenPoints([]);
    } else if (
      (activeTool === 'rectangle' || activeTool === 'highlight') &&
      dragStartPoint &&
      currentDragPoint
    ) {
      const x = Math.min(dragStartPoint.x, currentDragPoint.x);
      const y = Math.min(dragStartPoint.y, currentDragPoint.y);
      const w = Math.abs(currentDragPoint.x - dragStartPoint.x);
      const h = Math.abs(currentDragPoint.y - dragStartPoint.y);

      if (w > 5 || h > 5) {
        if (activeTool === 'highlight') {
          const newAnn: HighlightAnnotation = {
            id: Date.now().toString(),
            type: 'highlight',
            x,
            y,
            width: w,
            height: h,
            color: currentColor,
          };
          setAnnotations((prev) => ({
            ...prev,
            [currentPage]: [...(prev[currentPage] || []), newAnn],
          }));
        } else {
          const newAnn: RectAnnotation = {
            id: Date.now().toString(),
            type: 'rectangle',
            x,
            y,
            width: w,
            height: h,
            strokeWidth,
            isFilled: rectFilled,
            color: currentColor,
          };
          setAnnotations((prev) => ({
            ...prev,
            [currentPage]: [...(prev[currentPage] || []), newAnn],
          }));
        }
      }
      setDragStartPoint(null);
      setCurrentDragPoint(null);
    }
    redrawAnnotations();
  };

  // Undo last action on current page
  const handleUndo = () => {
    setAnnotations((prev) => {
      const pageAnns = prev[currentPage] || [];
      if (pageAnns.length === 0) return prev;
      return {
        ...prev,
        [currentPage]: pageAnns.slice(0, -1),
      };
    });
  };

  // Clear all annotations on current page
  const handleClearPage = () => {
    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: [],
    }));
  };

  // Save & Download Edited PDF
  const handleSaveEditedPdf = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const hexToRgbRatio = (hex: string) => {
        const clean = hex.replace('#', '');
        const bigint = parseInt(clean, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r: r / 255, g: g / 255, b: b / 255 };
      };

      // For every page with annotations, apply both vector primitives and high-res overlay
      for (let pNum = 1; pNum <= pages.length; pNum++) {
        const pageAnns = annotations[pNum];
        if (!pageAnns || pageAnns.length === 0) continue;

        const page = pages[pNum - 1];
        const { width: pdfWidth, height: pdfHeight } = page.getSize();

        // Canvas dimensions from overlay
        const canvasW = overlayCanvasRef.current?.width || 600;
        const canvasH = overlayCanvasRef.current?.height || 800;

        // Render page annotations onto an offscreen canvas at high resolution
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvasW;
        exportCanvas.height = canvasH;
        const eCtx = exportCanvas.getContext('2d');

        if (eCtx) {
          for (const ann of pageAnns) {
            if (ann.type === 'pen') {
              if (ann.points.length < 2) continue;
              eCtx.save();
              eCtx.beginPath();
              eCtx.strokeStyle = ann.color;
              eCtx.lineWidth = ann.strokeWidth;
              eCtx.lineCap = 'round';
              eCtx.lineJoin = 'round';
              eCtx.moveTo(ann.points[0].x, ann.points[0].y);
              for (let i = 1; i < ann.points.length; i++) {
                eCtx.lineTo(ann.points[i].x, ann.points[i].y);
              }
              eCtx.stroke();
              eCtx.restore();

              // Also draw via pdf-lib line primitives for vector compliance
              for (let i = 0; i < ann.points.length - 1; i++) {
                const pt1 = ann.points[i];
                const pt2 = ann.points[i + 1];
                const rgbColor = hexToRgbRatio(ann.color);
                page.drawLine({
                  start: {
                    x: (pt1.x / canvasW) * pdfWidth,
                    y: pdfHeight - (pt1.y / canvasH) * pdfHeight,
                  },
                  end: {
                    x: (pt2.x / canvasW) * pdfWidth,
                    y: pdfHeight - (pt2.y / canvasH) * pdfHeight,
                  },
                  thickness: (ann.strokeWidth / canvasW) * pdfWidth,
                  color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
                });
              }
            } else if (ann.type === 'text') {
              eCtx.save();
              eCtx.font = `bold ${ann.fontSize}px sans-serif`;
              eCtx.fillStyle = ann.color;
              eCtx.fillText(ann.text, ann.x, ann.y);
              eCtx.restore();

              // Vector PDF text
              const rgbColor = hexToRgbRatio(ann.color);
              const scaledFontSize = (ann.fontSize / canvasH) * pdfHeight;
              const pdfX = (ann.x / canvasW) * pdfWidth;
              const pdfY = pdfHeight - (ann.y / canvasH) * pdfHeight;
              page.drawText(ann.text, {
                x: pdfX,
                y: pdfY,
                size: Math.max(8, scaledFontSize),
                font: helveticaFont,
                color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
              });
            } else if (ann.type === 'highlight') {
              eCtx.save();
              eCtx.fillStyle = ann.color;
              eCtx.globalAlpha = 0.35;
              eCtx.fillRect(ann.x, ann.y, ann.width, ann.height);
              eCtx.restore();

              // Vector rectangle with opacity
              const rgbColor = hexToRgbRatio(ann.color);
              const pdfX = (ann.x / canvasW) * pdfWidth;
              const pdfY = pdfHeight - ((ann.y + ann.height) / canvasH) * pdfHeight;
              page.drawRectangle({
                x: pdfX,
                y: pdfY,
                width: (ann.width / canvasW) * pdfWidth,
                height: (ann.height / canvasH) * pdfHeight,
                color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
                opacity: 0.35,
              });
            } else if (ann.type === 'rectangle') {
              eCtx.save();
              eCtx.strokeStyle = ann.color;
              eCtx.lineWidth = ann.strokeWidth;
              if (ann.isFilled) {
                eCtx.fillStyle = ann.color;
                eCtx.fillRect(ann.x, ann.y, ann.width, ann.height);
              }
              eCtx.strokeRect(ann.x, ann.y, ann.width, ann.height);
              eCtx.restore();

              const rgbColor = hexToRgbRatio(ann.color);
              const pdfX = (ann.x / canvasW) * pdfWidth;
              const pdfY = pdfHeight - ((ann.y + ann.height) / canvasH) * pdfHeight;
              page.drawRectangle({
                x: pdfX,
                y: pdfY,
                width: (ann.width / canvasW) * pdfWidth,
                height: (ann.height / canvasH) * pdfHeight,
                borderColor: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
                borderWidth: (ann.strokeWidth / canvasW) * pdfWidth,
                color: ann.isFilled ? rgb(rgbColor.r, rgbColor.g, rgbColor.b) : undefined,
              });
            } else if (ann.type === 'stamp') {
              eCtx.save();
              eCtx.font = 'bold 22px sans-serif';
              const textMetrics = eCtx.measureText(ann.stampText);
              const padX = 20;
              const padY = 12;
              const w = textMetrics.width + padX * 2;
              const h = 42;

              eCtx.translate(ann.x, ann.y);
              eCtx.rotate(-0.08);
              eCtx.fillStyle = ann.color + '15';
              eCtx.fillRect(-w / 2, -h / 2, w, h);
              eCtx.strokeStyle = ann.borderColor;
              eCtx.lineWidth = 3;
              eCtx.strokeRect(-w / 2, -h / 2, w, h);

              eCtx.fillStyle = ann.color;
              eCtx.textAlign = 'center';
              eCtx.textBaseline = 'middle';
              eCtx.fillText(ann.stampText, 0, 0);
              eCtx.restore();

              // Embed stamp overlay via PNG for faithful rotation & badges
              const stampPng = await pdfDoc.embedPng(exportCanvas.toDataURL('image/png'));
              page.drawImage(stampPng, {
                x: 0,
                y: 0,
                width: pdfWidth,
                height: pdfHeight,
              });
            }
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `edited_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setSuccess('PDF successfully edited and downloaded!');
    } catch (err: any) {
      console.error(err);
      setError('Error saving edited PDF: ' + (err.message || 'Unknown error.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const totalCurrentPageAnnotations = (annotations[currentPage] || []).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      {/* Load PDF.js from cdnjs */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={handleScriptLoad}
      />

      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="text-sm mb-6" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex items-center text-xs font-medium text-gray-500 dark:text-slate-400">
            <li className="flex items-center">
              <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Home
              </Link>
              <svg className="w-3 h-3 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </li>
            <li className="text-gray-800 dark:text-white font-semibold">Edit PDF</li>
          </ol>
        </nav>

        {/* Tool Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit PDF</h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">
            Add text, draw with freehand pen, highlight content, draw shapes, and place custom stamps directly onto your PDF.
          </p>
        </div>

        {/* Horizontal AdSlot */}
        <div className="mb-8">
          <AdSlot format="horizontal" />
        </div>

        {/* Main Workspace */}
        {!file ? (
          /* Full-surface native overlay upload zone */
          <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 bg-white dark:bg-slate-900 rounded-3xl p-12 text-center transition-all group shadow-sm">
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                e.target.value = '';
              }}
              title=""
            />
            <div className="pointer-events-none flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                ✏️
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Upload PDF to Edit
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-md mb-5">
                Drag and drop your PDF document here, or click to browse from your device.
              </p>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase font-bold text-primary-600 bg-primary-50 dark:bg-primary-950/60 dark:text-primary-400 px-2.5 py-1 rounded-lg">
                  Editing
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {file.name}
                </span>
              </div>

              {/* Page Controls */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 disabled:opacity-40 hover:bg-gray-200 transition"
                >
                  ◀
                </button>
                <span className="text-gray-700 dark:text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 disabled:opacity-40 hover:bg-gray-200 transition"
                >
                  ▶
                </button>
              </div>

              {/* Reset / New File */}
              <button
                onClick={() => {
                  setFile(null);
                  setTotalPages(0);
                  setAnnotations({});
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              >
                Change Document
              </button>
            </div>

            {/* Tools Palette */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
              {/* Primary Tool Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'pen', label: '✏️ Pen', desc: 'Freehand draw' },
                  { id: 'text', label: 'T Text', desc: 'Click to place text' },
                  { id: 'highlight', label: '🖍️ Highlight', desc: 'Drag to highlight' },
                  { id: 'rectangle', label: '⬜ Rectangle', desc: 'Draw box' },
                  { id: 'stamp', label: '🏷️ Stamp', desc: 'Approved / Draft' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTool(t.id as ToolType)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      activeTool === t.id
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{t.label}</span>
                  </button>
                ))}

                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={handleUndo}
                    disabled={totalCurrentPageAnnotations === 0}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 disabled:opacity-40"
                    title="Undo last annotation"
                  >
                    ↩ Undo
                  </button>
                  <button
                    onClick={handleClearPage}
                    disabled={totalCurrentPageAnnotations === 0}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-red-100 hover:text-red-700 disabled:opacity-40"
                    title="Clear annotations on this page"
                  >
                    🗑️ Clear Page
                  </button>
                </div>
              </div>

              {/* Tool Specific Properties Bar */}
              <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs font-medium">
                {/* Color Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-slate-400">Color:</span>
                  <div className="flex items-center gap-1">
                    {['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#000000'].map((hex) => (
                      <button
                        key={hex}
                        onClick={() => setCurrentColor(hex)}
                        style={{ backgroundColor: hex }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          currentColor === hex ? 'scale-125 border-gray-900 dark:border-white shadow-xs' : 'border-white dark:border-slate-800'
                        }`}
                      />
                    ))}
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => setCurrentColor(e.target.value)}
                      className="w-6 h-6 rounded border cursor-pointer ml-1 p-0"
                    />
                  </div>
                </div>

                {/* Pen Stroke Width */}
                {activeTool === 'pen' && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-slate-400">Thickness:</span>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(Number(e.target.value))}
                      className="w-24 accent-primary-600"
                    />
                    <span className="text-gray-700 dark:text-slate-300">{strokeWidth}px</span>
                  </div>
                )}

                {/* Text Tool Inputs */}
                {activeTool === 'text' && (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 dark:text-slate-400">Text:</span>
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type text to place..."
                        className="px-2.5 py-1 text-xs border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 dark:text-slate-400">Font Size:</span>
                      <input
                        type="range"
                        min="12"
                        max="48"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-20 accent-primary-600"
                      />
                      <span className="text-gray-700 dark:text-slate-300">{fontSize}px</span>
                    </div>
                    <span className="text-primary-600 dark:text-primary-400 text-[11px]">
                      👉 Click anywhere on the PDF page to place text!
                    </span>
                  </div>
                )}

                {/* Rectangle Fill Toggle */}
                {activeTool === 'rectangle' && (
                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rectFilled}
                      onChange={(e) => setRectFilled(e.target.checked)}
                      className="rounded accent-primary-600"
                    />
                    <span>Fill Shape</span>
                  </label>
                )}

                {/* Stamp Selector */}
                {activeTool === 'stamp' && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-slate-400">Stamp Type:</span>
                    <select
                      value={selectedStamp}
                      onChange={(e) => setSelectedStamp(e.target.value)}
                      className="px-2.5 py-1 text-xs border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      {STAMP_PRESETS.map((s) => (
                        <option key={s.label} value={s.label}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-primary-600 dark:text-primary-400 text-[11px]">
                      👉 Click anywhere on the page to stamp!
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Error or Success notification */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                {success}
              </div>
            )}

            {/* Interactive Canvas Canvas Area */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 overflow-x-auto flex flex-col items-center">
              <div
                ref={containerRef}
                className="relative inline-block border border-gray-300 dark:border-slate-700 shadow-md rounded-lg overflow-hidden select-none bg-white cursor-crosshair"
              >
                {/* Base PDF Canvas */}
                <canvas ref={baseCanvasRef} className="block" />

                {/* Interactive Annotation Canvas Overlay */}
                <canvas
                  ref={overlayCanvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="absolute inset-0 w-full h-full"
                />

                {isRendering && (
                  <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 animate-pulse">
                      Rendering page...
                    </span>
                  </div>
                )}
              </div>

              {/* Status info */}
              <div className="mt-4 flex items-center justify-between w-full max-w-2xl text-xs text-gray-500 dark:text-slate-400">
                <span>
                  Page {currentPage}: {totalCurrentPageAnnotations} annotation{totalCurrentPageAnnotations === 1 ? '' : 's'}
                </span>
                <span>Active Tool: <strong className="text-gray-800 dark:text-white capitalize">{activeTool}</strong></span>
              </div>
            </div>

            {/* Save & Download Button */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Ready to finalize?</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Edits across all {totalPages} pages will be permanently embedded into your PDF document.
                </p>
              </div>
              <button
                onClick={handleSaveEditedPdf}
                disabled={isProcessing}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Saving & Embedding...</span>
                  </>
                ) : (
                  <>
                    <span>💾 Save & Download Edited PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* How to Use Section */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">How to Edit PDF Online</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Upload Document</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Drag and drop your PDF file or click to choose a document from your computer or phone.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Select Editing Tool</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Choose between Freehand Pen, Text Placement, Highlighter, Rectangles, or Official Stamps.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Annotate Pages</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Draw or click on any page. Navigate through multi-page PDFs smoothly and adjust colors as needed.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Download Result</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Click &quot;Save & Download Edited PDF&quot; to permanently bake your modifications into a new PDF.
              </p>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-8">
          <RelatedTools currentSlug="edit-pdf" />
        </div>
      </div>
    </div>
  );
}
