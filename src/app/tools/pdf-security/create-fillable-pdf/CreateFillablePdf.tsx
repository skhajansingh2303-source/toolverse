'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import AdSlot from '@/components/AdSlot';
import FeedbackWidget from '@/components/FeedbackWidget';
import RelatedTools from '@/components/RelatedTools';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';
import { PDFDocument } from 'pdf-lib';

type FieldType = 'text' | 'textarea' | 'checkbox' | 'dropdown' | 'signature';

interface DesignerField {
  id: string;
  pageIndex: number; // 0-based
  name: string;
  type: FieldType;
  x: number; // relative to canvas rendered px
  y: number;
  width: number;
  height: number;
  defaultValue?: string;
  checked?: boolean;
  options?: string; // comma-separated for dropdown
}

export default function CreateFillablePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [activeTool, setActiveTool] = useState<FieldType>('text');
  const [fields, setFields] = useState<DesignerField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const [canvasScale, setCanvasScale] = useState<number>(1.2);
  const [renderedDimensions, setRenderedDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 800,
  });
  const [originalPageDimensions, setOriginalPageDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 800,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [createdBlob, setCreatedBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const pdfDocRef = useRef<any>(null);

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragFieldIdRef = useRef<string | null>(null);
  const dragStartPosRef = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number }>({
    mouseX: 0,
    mouseY: 0,
    initialX: 0,
    initialY: 0,
  });

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
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);
    setFields([]);
    setSelectedFieldId(null);
    setDownloadUrl(null);
    setCreatedBlob(null);
    setErrorMsg(null);
    setCurrentPage(1);

    if ((window as any).pdfjsLib) {
      loadAndRenderPdf(uploaded, 1);
    }
  };

  const loadAndRenderPdf = async (pdfFile: File, pageNumber: number) => {
    try {
      const buffer = await pdfFile.arrayBuffer();
      const pdf = await (window as any).pdfjsLib.getDocument({ data: buffer }).promise;
      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);
      renderPage(pdf, pageNumber);
    } catch (err: any) {
      console.error('Error loading PDF:', err);
      setErrorMsg('Failed to load PDF preview. The file may be corrupt or encrypted.');
    }
  };

  const renderPage = async (pdf: any, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: canvasScale });
      const origViewport = page.getViewport({ scale: 1.0 });

      setOriginalPageDimensions({
        width: origViewport.width,
        height: origViewport.height,
      });
      setRenderedDimensions({
        width: Math.floor(viewport.width),
        height: Math.floor(viewport.height),
      });

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  };

  useEffect(() => {
    if (pdfDocRef.current && file) {
      renderPage(pdfDocRef.current, currentPage);
    }
  }, [currentPage, canvasScale]);

  // Click on canvas overlay to add field
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If we just finished dragging, don't create a field
    if (isDraggingRef.current) return;
    if (!overlayRef.current) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let width = 180;
    let height = 30;

    if (activeTool === 'textarea') {
      width = 220;
      height = 65;
    } else if (activeTool === 'checkbox') {
      width = 24;
      height = 24;
    } else if (activeTool === 'dropdown') {
      width = 180;
      height = 30;
    } else if (activeTool === 'signature') {
      width = 200;
      height = 50;
    }

    // Keep inside bounds
    const boundedX = Math.max(0, Math.min(clickX, renderedDimensions.width - width));
    const boundedY = Math.max(0, Math.min(clickY, renderedDimensions.height - height));

    const id = `field_${Date.now()}`;
    const fieldIndex = fields.length + 1;
    const defaultName =
      activeTool === 'text'
        ? `textField_${fieldIndex}`
        : activeTool === 'textarea'
        ? `textArea_${fieldIndex}`
        : activeTool === 'checkbox'
        ? `checkBox_${fieldIndex}`
        : activeTool === 'dropdown'
        ? `dropdown_${fieldIndex}`
        : `signature_${fieldIndex}`;

    const newField: DesignerField = {
      id,
      pageIndex: currentPage - 1,
      name: defaultName,
      type: activeTool,
      x: Math.round(boundedX),
      y: Math.round(boundedY),
      width,
      height,
      defaultValue: '',
      checked: false,
      options: activeTool === 'dropdown' ? 'Option 1, Option 2, Option 3' : undefined,
    };

    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(id);
  };

  // Dragging logic
  const handleMouseDownOnField = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    setSelectedFieldId(fieldId);
    dragFieldIdRef.current = fieldId;
    isDraggingRef.current = true;

    const targetField = fields.find((f) => f.id === fieldId);
    if (!targetField) return;

    dragStartPosRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: targetField.x,
      initialY: targetField.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !dragFieldIdRef.current) return;
      const deltaX = moveEvent.clientX - dragStartPosRef.current.mouseX;
      const deltaY = moveEvent.clientY - dragStartPosRef.current.mouseY;

      setFields((prev) =>
        prev.map((f) => {
          if (f.id !== dragFieldIdRef.current) return f;
          const newX = Math.max(
            0,
            Math.min(
              dragStartPosRef.current.initialX + deltaX,
              renderedDimensions.width - f.width
            )
          );
          const newY = Math.max(
            0,
            Math.min(
              dragStartPosRef.current.initialY + deltaY,
              renderedDimensions.height - f.height
            )
          );
          return { ...f, x: Math.round(newX), y: Math.round(newY) };
        })
      );
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      dragFieldIdRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  const updateSelectedField = (props: Partial<DesignerField>) => {
    if (!selectedFieldId) return;
    setFields((prev) =>
      prev.map((f) => (f.id === selectedFieldId ? { ...f, ...props } : f))
    );
  };

  const deleteSelectedField = () => {
    if (!selectedFieldId) return;
    setFields((prev) => prev.filter((f) => f.id !== selectedFieldId));
    setSelectedFieldId(null);
  };

  const saveInteractivePdf = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const form = pdfDoc.getForm();

      for (const field of fields) {
        const page = pdfDoc.getPage(field.pageIndex);
        const pageMediaBox = page.getMediaBox();
        const pagePdfW = pageMediaBox.width;
        const pagePdfH = pageMediaBox.height;

        // Ratio of PDF points to Canvas pixels
        const scaleX = pagePdfW / renderedDimensions.width;
        const scaleY = pagePdfH / renderedDimensions.height;

        const pdfX = field.x * scaleX;
        const pdfW = field.width * scaleX;
        const pdfH = field.height * scaleY;
        // Invert Y coordinate because PDF origin (0,0) is bottom-left
        const pdfY = pagePdfH - (field.y * scaleY + pdfH);

        const safeFieldName = field.name.trim() || `field_${field.id}`;

        if (field.type === 'text' || field.type === 'textarea') {
          const tf = form.createTextField(safeFieldName);
          if (field.type === 'textarea') {
            tf.enableMultiline();
          }
          tf.addToPage(page, {
            x: pdfX,
            y: pdfY,
            width: pdfW,
            height: pdfH,
          });
          if (field.defaultValue) {
            tf.setText(field.defaultValue);
          }
        } else if (field.type === 'checkbox') {
          const cb = form.createCheckBox(safeFieldName);
          cb.addToPage(page, {
            x: pdfX,
            y: pdfY,
            width: pdfW,
            height: pdfH,
          });
          if (field.checked) {
            cb.check();
          }
        } else if (field.type === 'dropdown') {
          const dd = form.createDropdown(safeFieldName);
          dd.addToPage(page, {
            x: pdfX,
            y: pdfY,
            width: pdfW,
            height: pdfH,
          });
          if (field.options) {
            const opts = field.options.split(',').map((o) => o.trim()).filter(Boolean);
            if (opts.length > 0) {
              dd.addOptions(opts);
            }
          }
        } else if (field.type === 'signature') {
          // Signature AcroForm text container
          const tf = form.createTextField(safeFieldName);
          tf.addToPage(page, {
            x: pdfX,
            y: pdfY,
            width: pdfW,
            height: pdfH,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      setCreatedBlob(blob);

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `📋 Created Fillable PDF with ${fields.length} Interactive Fields!` },
        })
      );
    } catch (err: any) {
      console.error('Error saving fillable PDF:', err);
      setErrorMsg(err.message || 'Failed to generate fillable PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPageFields = fields.filter((f) => f.pageIndex === currentPage - 1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={handleScriptLoad}
        strategy="afterInteractive"
      />

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Create Fillable PDF</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white text-xl shadow-sm">
            📋
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Create Fillable PDF Forms
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Transform static PDF documents into interactive fillable forms. Add text boxes, multiline text areas, checkboxes, dropdown menus, and signature boxes visually.
        </p>
      </div>

      <AdSlot format="horizontal" />

      {/* Main Container */}
      <div className="mt-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
        {!file ? (
          <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 rounded-3xl p-10 transition-colors group bg-gray-50/50 dark:bg-slate-950/40 text-center">
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                handleFileUpload(e);
                e.target.value = '';
              }}
            />
            <div className="pointer-events-none flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-3xl mb-3 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                📋
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Upload Any PDF to Make Fillable
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                Drag &amp; drop your PDF document here
              </p>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/60">
              {/* Field Tool Selector */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'text' as const, label: 'Text Field', icon: '📝' },
                  { id: 'textarea' as const, label: 'Text Area', icon: '📑' },
                  { id: 'checkbox' as const, label: 'Checkbox', icon: '☑️' },
                  { id: 'dropdown' as const, label: 'Dropdown', icon: '🔽' },
                  { id: 'signature' as const, label: 'Signature', icon: '✍️' },
                ].map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setActiveTool(tool.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeTool === tool.id
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tool.icon}</span>
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>

              {/* Page Navigator */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 disabled:opacity-40 font-bold"
                >
                  ← Prev
                </button>
                <span className="font-semibold text-gray-700 dark:text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 disabled:opacity-40 font-bold"
                >
                  Next →
                </button>

                <button
                  onClick={() => {
                    setFile(null);
                    setFields([]);
                    setDownloadUrl(null);
                    setCreatedBlob(null);
                  }}
                  className="ml-2 text-xs text-red-600 dark:text-red-400 hover:underline font-medium"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Instruction Callout */}
            <div className="p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 rounded-xl text-xs text-sky-900 dark:text-sky-300 flex items-center justify-between">
              <span>
                💡 <strong>Click anywhere on the document</strong> to place the active{' '}
                <strong>{activeTool}</strong> field. Drag placed boxes to reposition them.
              </span>
              <span className="text-[11px] font-bold">
                {fields.length} Field{fields.length === 1 ? '' : 's'} placed
              </span>
            </div>

            {/* Workspace: Interactive Canvas + Properties Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document Canvas Container */}
              <div className="lg:col-span-2 flex justify-center bg-gray-100 dark:bg-slate-950/60 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-auto max-h-[700px]">
                <div
                  ref={overlayRef}
                  onClick={handleOverlayClick}
                  className="relative shadow-md bg-white cursor-crosshair select-none"
                  style={{
                    width: renderedDimensions.width,
                    height: renderedDimensions.height,
                  }}
                >
                  <canvas ref={canvasRef} className="block" />

                  {/* Rendered Interactive Fields on Current Page */}
                  {currentPageFields.map((field) => {
                    const isSelected = field.id === selectedFieldId;
                    return (
                      <div
                        key={field.id}
                        onMouseDown={(e) => handleMouseDownOnField(e, field.id)}
                        className={`absolute border-2 rounded transition-colors cursor-move flex items-center px-1.5 text-xs select-none ${
                          isSelected
                            ? 'border-primary-600 bg-primary-500/20 ring-2 ring-primary-500'
                            : 'border-blue-500/80 bg-blue-500/10 hover:bg-blue-500/20'
                        }`}
                        style={{
                          left: field.x,
                          top: field.y,
                          width: field.width,
                          height: field.height,
                        }}
                      >
                        <span className="text-[10px] font-mono font-bold text-blue-900 dark:text-blue-100 truncate pointer-events-none">
                          {field.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Field Properties Panel */}
              <div className="space-y-4 p-5 rounded-2xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 h-fit">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Field Properties Inspector
                </h3>

                {selectedField ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-gray-700 dark:text-slate-300 font-semibold mb-1">
                        Field Name (AcroForm ID)
                      </label>
                      <input
                        type="text"
                        value={selectedField.name}
                        onChange={(e) => updateSelectedField({ name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-slate-300 font-semibold mb-1">
                        Field Type
                      </label>
                      <span className="inline-block px-2.5 py-1 rounded bg-gray-200 dark:bg-slate-700 font-bold uppercase text-[10px] text-gray-800 dark:text-slate-200">
                        {selectedField.type}
                      </span>
                    </div>

                    {/* Width & Height */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-700 dark:text-slate-300 font-semibold mb-1">
                          Width (px)
                        </label>
                        <input
                          type="number"
                          value={selectedField.width}
                          onChange={(e) =>
                            updateSelectedField({ width: parseInt(e.target.value) || 20 })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-slate-300 font-semibold mb-1">
                          Height (px)
                        </label>
                        <input
                          type="number"
                          value={selectedField.height}
                          onChange={(e) =>
                            updateSelectedField({ height: parseInt(e.target.value) || 20 })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Default value for text */}
                    {(selectedField.type === 'text' || selectedField.type === 'textarea') && (
                      <div>
                        <label className="block text-gray-700 dark:text-slate-300 font-semibold mb-1">
                          Default Value / Placeholder
                        </label>
                        <input
                          type="text"
                          value={selectedField.defaultValue || ''}
                          onChange={(e) => updateSelectedField({ defaultValue: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}

                    {/* Checkbox initial state */}
                    {selectedField.type === 'checkbox' && (
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={!!selectedField.checked}
                          onChange={(e) => updateSelectedField({ checked: e.target.checked })}
                          className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-slate-700"
                        />
                        <span className="font-semibold text-gray-700 dark:text-slate-300">
                          Checked by Default
                        </span>
                      </label>
                    )}

                    {/* Dropdown options */}
                    {selectedField.type === 'dropdown' && (
                      <div>
                        <label className="block text-gray-700 dark:text-slate-300 font-semibold mb-1">
                          Options (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={selectedField.options || ''}
                          onChange={(e) => updateSelectedField({ options: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={deleteSelectedField}
                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-950/60 dark:text-red-400 font-bold rounded-lg transition-colors"
                      >
                        Delete Field 🗑️
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-400 dark:text-slate-500 text-xs">
                    No field selected. Click on an existing field to inspect or click the canvas to place a new one.
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={saveInteractivePdf}
                disabled={isProcessing || fields.length === 0}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-sky-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Compiling Form Fields...</span>
                  </>
                ) : (
                  <>
                    <span>Generate &amp; Download Fillable PDF</span>
                    <span>→</span>
                  </>
                )}
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={`fillable-${file.name}`}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  <span>Download Fillable PDF ↓</span>
                </a>
              )}
            </div>

            {/* Live Document Preview */}
            {createdBlob && (
              <div className="pt-4">
                <DocumentLiveViewer
                  file={createdBlob}
                  fileName={`fillable-${file.name}`}
                  title="Interactive Fillable PDF Preview"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <FeedbackWidget toolName="Create Fillable PDF" />
      <RelatedTools currentSlug="create-fillable-pdf" />

      {/* How to Use Section */}
      <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          How to Create Fillable PDF Forms Online
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-primary-600 text-sm">1. Upload Static Document</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Choose Any PDF</p>
            <p className="mt-0.5">
              Select contracts, registration sheets, feedback templates, or invoices you want people to fill.
            </p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">2. Add Form Elements</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Visual Designer</p>
            <p className="mt-0.5">
              Click to drop text fields, checkboxes, dropdown options, and signature blocks directly onto page lines.
            </p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">3. Download Interactive Form</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">AcroForm Compliant</p>
            <p className="mt-0.5">
              Save your newly created interactive PDF form that opens and fills smoothly in Chrome, Edge, and Acrobat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
