'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DocumentLiveViewerProps {
  file: File | Blob | null;
  fileName?: string;
  onFileChange?: (newFile: File) => void;
  onRemove?: () => void;
  accept?: string;
  title?: string;
  heightClass?: string;
}

export default function DocumentLiveViewer({
  file,
  fileName,
  onFileChange,
  onRemove,
  accept = '.pdf,image/*',
  title = 'Live Document Preview',
  heightClass = 'h-[460px]',
}: DocumentLiveViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'other'>('other');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate object URL and detect type
  useEffect(() => {
    if (!file) {
      setBlobUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setBlobUrl(url);

    const type = file.type || '';
    const name = (file as File).name || fileName || '';

    if (type.includes('pdf') || name.toLowerCase().endsWith('.pdf')) {
      setFileType('pdf');
    } else if (
      type.startsWith('image/') ||
      /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name)
    ) {
      setFileType('image');
    } else {
      setFileType('other');
    }

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, fileName]);

  if (!file || !blobUrl) return null;

  const currentFileName = (file as File).name || fileName || 'Uploaded Document';
  const currentFileSize = file.size
    ? file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    : '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && onFileChange) {
      onFileChange(selected);
      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `🔄 Changed document to: ${selected.name}` },
        })
      );
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`my-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-md overflow-hidden flex flex-col transition-all ${
        isFullscreen ? 'p-4 bg-slate-950 text-white' : ''
      }`}
    >
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50/90 dark:bg-slate-950/80 border-b border-gray-200 dark:border-slate-800">
        
        {/* Document Info Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold shrink-0">
            {fileType === 'pdf' ? '📄' : fileType === 'image' ? '🖼️' : '📁'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">
                {currentFileName}
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-800">
                Live Preview
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">
              {currentFileSize} • {fileType.toUpperCase()} • 100% In-Browser
            </p>
          </div>
        </div>

        {/* Action Controls: Change File, Zoom (for image), Fullscreen, Remove */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* Zoom controls for images */}
          {fileType === 'image' && (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-0.5 mr-1">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="w-6 h-6 rounded flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-xs font-bold"
                title="Zoom Out"
              >
                -
              </button>
              <span className="text-[10px] font-bold text-gray-700 dark:text-slate-300 px-1">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                className="w-6 h-6 rounded flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-xs font-bold"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="text-[10px] px-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
                title="Reset Zoom"
              >
                Reset
              </button>
            </div>
          )}

          {/* Change File Trigger */}
          {onFileChange && (
            <label
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-xs font-bold text-gray-800 dark:text-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Upload a different document"
            >
              <input
                type="file"
                accept={accept}
                onChange={(e) => {
                  handleInputChange(e);
                  e.target.value = '';
                }}
                className="sr-only"
              />
              <span>🔄</span>
              <span>Change Document</span>
            </label>
          )}

          {/* Fullscreen / New Window */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-xs font-bold text-gray-600 dark:text-slate-300 transition-colors shadow-2xs"
            title="Expand Fullscreen"
          >
            ⛶
          </button>

          {/* Remove / Clear */}
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors"
              title="Remove document"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Live Preview Render Viewport */}
      <div className={`relative w-full ${isFullscreen ? 'flex-1 min-h-[500px]' : heightClass} bg-slate-100 dark:bg-slate-950 overflow-auto flex items-center justify-center`}>
        {fileType === 'pdf' ? (
          <iframe
            src={`${blobUrl}#toolbar=1&view=FitH`}
            title={currentFileName}
            className="w-full h-full border-0"
          />
        ) : fileType === 'image' ? (
          <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
            <img
              src={blobUrl}
              alt={currentFileName}
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-full max-w-full object-contain rounded-lg shadow-md transition-transform duration-150"
            />
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-500 dark:text-slate-400">
            <p className="font-bold text-gray-800 dark:text-white mb-1">
              Document loaded in memory: {currentFileName}
            </p>
            <p>Direct live rendering ready for processing.</p>
          </div>
        )}
      </div>

      {/* Sub-bar Guidance */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500">
        <span>Scroll inside the viewer to browse all pages.</span>
        <button
          onClick={() => window.open(blobUrl, '_blank')}
          className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
        >
          Open in New Tab ↗
        </button>
      </div>
    </div>
  );
}
