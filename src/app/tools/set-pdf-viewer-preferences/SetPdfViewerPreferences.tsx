'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import { PDFDocument, PDFName, PDFBool, PDFDict, PDFName as PDFNameType } from 'pdf-lib';

interface CurrentPrefs {
  pageMode: string;
  pageLayout: string;
  hideToolbar: boolean;
  hideMenubar: boolean;
  hideWindowUI: boolean;
  fitWindow: boolean;
  centerWindow: boolean;
  displayDocTitle: boolean;
  direction?: string;
  duplex?: string;
}

export default function SetPdfViewerPreferences() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPrefs, setCurrentPrefs] = useState<CurrentPrefs | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState<string>('');

  // Target Configuration States
  const [pageMode, setPageMode] = useState<string>('UseNone');
  const [pageLayout, setPageLayout] = useState<string>('OneColumn');
  const [hideToolbar, setHideToolbar] = useState<boolean>(false);
  const [hideMenubar, setHideMenubar] = useState<boolean>(false);
  const [hideWindowUI, setHideWindowUI] = useState<boolean>(false);
  const [fitWindow, setFitWindow] = useState<boolean>(true);
  const [centerWindow, setCenterWindow] = useState<boolean>(true);
  const [displayDocTitle, setDisplayDocTitle] = useState<boolean>(true);
  const [direction, setDirection] = useState<string>('L2R');
  const [printScaling, setPrintScaling] = useState<string>('AppDefault');
  const [duplex, setDuplex] = useState<string>('Default');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setIsDone(false);
    setDownloadUrl(null);

    try {
      const buffer = await selected.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(pdfDoc.getPageCount());

      const catalog = pdfDoc.catalog;

      // Extract existing /PageMode
      const pm = catalog.get(PDFName.of('PageMode'));
      const existingPm = pm ? pm.toString().replace('/', '') : 'Default / Not Specified';

      // Extract existing /PageLayout
      const pl = catalog.get(PDFName.of('PageLayout'));
      const existingPl = pl ? pl.toString().replace('/', '') : 'Default / Not Specified';

      // Extract existing /ViewerPreferences
      const vp = catalog.get(PDFName.of('ViewerPreferences'));
      let ht = false, hm = false, hw = false, fw = false, cw = false, ddt = false;
      let dir = 'Default', dpx = 'Default';

      if (vp && vp instanceof PDFDict) {
        const getBool = (name: string) => {
          const val = vp.get(PDFName.of(name));
          return val ? val.toString() === 'true' : false;
        };
        ht = getBool('HideToolbar');
        hm = getBool('HideMenubar');
        hw = getBool('HideWindowUI');
        fw = getBool('FitWindow');
        cw = getBool('CenterWindow');
        ddt = getBool('DisplayDocTitle');

        const dirVal = vp.get(PDFName.of('Direction'));
        if (dirVal) dir = dirVal.toString().replace('/', '');

        const dpxVal = vp.get(PDFName.of('Duplex'));
        if (dpxVal) dpx = dpxVal.toString().replace('/', '');
      }

      setCurrentPrefs({
        pageMode: existingPm,
        pageLayout: existingPl,
        hideToolbar: ht,
        hideMenubar: hm,
        hideWindowUI: hw,
        fitWindow: fw,
        centerWindow: cw,
        displayDocTitle: ddt,
        direction: dir,
        duplex: dpx,
      });
    } catch (err) {
      console.error('Error analyzing PDF catalog:', err);
    }
  };

  // Preset Applicators
  const applyPreset = (type: 'kiosk' | 'reading' | 'book' | 'manual') => {
    if (type === 'kiosk') {
      setPageMode('FullScreen');
      setPageLayout('SinglePage');
      setHideToolbar(true);
      setHideMenubar(true);
      setHideWindowUI(true);
      setFitWindow(true);
      setCenterWindow(true);
      setDisplayDocTitle(true);
    } else if (type === 'reading') {
      setPageMode('UseNone');
      setPageLayout('OneColumn');
      setHideToolbar(true);
      setHideMenubar(false);
      setHideWindowUI(false);
      setFitWindow(true);
      setCenterWindow(true);
      setDisplayDocTitle(true);
    } else if (type === 'book') {
      setPageMode('UseThumbs');
      setPageLayout('TwoColumnLeft');
      setHideToolbar(false);
      setHideMenubar(false);
      setHideWindowUI(false);
      setFitWindow(true);
      setCenterWindow(true);
      setDisplayDocTitle(true);
    } else if (type === 'manual') {
      setPageMode('UseOutlines');
      setPageLayout('OneColumn');
      setHideToolbar(false);
      setHideMenubar(false);
      setHideWindowUI(false);
      setFitWindow(false);
      setCenterWindow(false);
      setDisplayDocTitle(true);
    }
  };

  const applyPreferences = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const catalog = pdfDoc.catalog;

      // 1. Set /PageMode
      if (pageMode === 'Default') {
        catalog.delete(PDFName.of('PageMode'));
      } else {
        catalog.set(PDFName.of('PageMode'), PDFName.of(pageMode));
      }

      // 2. Set /PageLayout
      if (pageLayout === 'Default') {
        catalog.delete(PDFName.of('PageLayout'));
      } else {
        catalog.set(PDFName.of('PageLayout'), PDFName.of(pageLayout));
      }

      // 3. Construct /ViewerPreferences dictionary
      const prefsDict = pdfDoc.context.obj({
        HideToolbar: hideToolbar ? PDFBool.True : PDFBool.False,
        HideMenubar: hideMenubar ? PDFBool.True : PDFBool.False,
        HideWindowUI: hideWindowUI ? PDFBool.True : PDFBool.False,
        FitWindow: fitWindow ? PDFBool.True : PDFBool.False,
        CenterWindow: centerWindow ? PDFBool.True : PDFBool.False,
        DisplayDocTitle: displayDocTitle ? PDFBool.True : PDFBool.False,
      });

      if (direction && direction !== 'Default') {
        prefsDict.set(PDFName.of('Direction'), PDFName.of(direction));
      }
      if (printScaling && printScaling !== 'Default') {
        prefsDict.set(PDFName.of('PrintScaling'), PDFName.of(printScaling));
      }
      if (duplex && duplex !== 'Default') {
        prefsDict.set(PDFName.of('Duplex'), PDFName.of(duplex));
      }

      catalog.set(PDFName.of('ViewerPreferences'), prefsDict);

      const modifiedBytes = await pdfDoc.save();
      const blob = new Blob([modifiedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setOutputFileName(`${cleanName}_configured.pdf`);
      setDownloadUrl(url);
      setIsDone(true);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: 'PDF Viewer Preferences applied successfully!' },
        })
      );
    } catch (error) {
      console.error('Failed to configure viewer preferences:', error);
      alert('An error occurred while saving the viewer preferences. The PDF might be corrupted or protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">Set PDF Viewer Preferences</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Set PDF Viewer Preferences
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Control how Adobe Acrobat, Apple Preview, and web PDF readers open your document. Configure initial page view, layout mode, default zoom, and reader UI visibility.
          </p>
        </div>

        {/* Dropzone */}
        {!file && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-10">
            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-400 rounded-3xl p-8 sm:p-12 text-center transition-colors group">
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => {
                  handleFile(e);
                  e.target.value = '';
                }}
              />
              <div className="pointer-events-none flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-105 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Upload PDF to Configure Preferences
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Supports any PDF. Client-side processing ensures zero data leaves your browser.
                </p>
                <span className="inline-flex items-center px-6 py-3 rounded-xl bg-primary-600 group-hover:bg-primary-700 text-white font-semibold shadow-md transition-all">
                  Browse Files
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Panel */}
        {file && (
          <div className="space-y-6">
            {/* File Info & Existing Specs Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                  PDF
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white truncate max-w-sm sm:max-w-md">
                    {file.name}
                  </h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-3 mt-0.5">
                    <span>{pageCount} pages</span>
                    <span>•</span>
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Loaded</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setCurrentPrefs(null);
                  setIsDone(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Change Document
              </button>
            </div>

            {/* Quick Presets */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                Quick Setup Presets
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => applyPreset('kiosk')}
                  className="p-3 text-left rounded-xl border border-gray-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 bg-gray-50 dark:bg-slate-800/50 hover:bg-primary-50/50 dark:hover:bg-primary-950/30 transition-all group"
                >
                  <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary-600">
                    Kiosk / Fullscreen
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Auto full screen, hides toolbars & UI
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('reading')}
                  className="p-3 text-left rounded-xl border border-gray-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 bg-gray-50 dark:bg-slate-800/50 hover:bg-primary-50/50 dark:hover:bg-primary-950/30 transition-all group"
                >
                  <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary-600">
                    Clean Reading
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Continuous scroll, fits window width
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('book')}
                  className="p-3 text-left rounded-xl border border-gray-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 bg-gray-50 dark:bg-slate-800/50 hover:bg-primary-50/50 dark:hover:bg-primary-950/30 transition-all group"
                >
                  <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary-600">
                    Book / 2-Page Spread
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Facing two-page mode with thumbnails
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('manual')}
                  className="p-3 text-left rounded-xl border border-gray-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 bg-gray-50 dark:bg-slate-800/50 hover:bg-primary-50/50 dark:hover:bg-primary-950/30 transition-all group"
                >
                  <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary-600">
                    Document Manual
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Opens outline/bookmarks sidebar
                  </div>
                </button>
              </div>
            </div>

            {/* Viewer Preferences Form Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Configure Catalog & Viewer Preferences
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Initial Page Mode (/PageMode) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    Initial Document Mode (/PageMode)
                  </label>
                  <select
                    value={pageMode}
                    onChange={(e) => setPageMode(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="UseNone">Default Document View (UseNone)</option>
                    <option value="UseOutlines">Show Bookmarks / Document Outline (UseOutlines)</option>
                    <option value="UseThumbs">Show Page Thumbnails (UseThumbs)</option>
                    <option value="FullScreen">Fullscreen Presentation (FullScreen)</option>
                    <option value="UseOC">Show Layers & Optional Content (UseOC)</option>
                    <option value="UseAttachments">Show Attachments Panel (UseAttachments)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Determines what navigation panels automatically open in Acrobat / Preview.
                  </p>
                </div>

                {/* Page Layout (/PageLayout) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    Page Layout Mode (/PageLayout)
                  </label>
                  <select
                    value={pageLayout}
                    onChange={(e) => setPageLayout(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="OneColumn">Continuous Scroll (OneColumn)</option>
                    <option value="SinglePage">Single Page at a Time (SinglePage)</option>
                    <option value="TwoColumnLeft">Two Pages Facing - Odd on Left (TwoColumnLeft)</option>
                    <option value="TwoColumnRight">Two Pages Facing - Odd on Right (TwoColumnRight)</option>
                    <option value="TwoPageLeft">Two Pages - Odd on Left (TwoPageLeft)</option>
                    <option value="TwoPageRight">Two Pages - Odd on Right (TwoPageRight)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Sets default page flow for reading (single page vs continuous vs two-page spread).
                  </p>
                </div>
              </div>

              {/* UI Visibility Checkboxes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
                  Reader Interface Elements (/ViewerPreferences)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <label className="flex items-start space-x-3 p-3 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideToolbar}
                      onChange={(e) => setHideToolbar(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Hide Toolbar</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Hides top buttons and toolbars</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-3 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideMenubar}
                      onChange={(e) => setHideMenubar(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Hide Menubar</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Hides application menu bar</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-3 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideWindowUI}
                      onChange={(e) => setHideWindowUI(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Hide Window UI</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Hides scrollbars & UI chrome</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-3 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fitWindow}
                      onChange={(e) => setFitWindow(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Fit Window</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Resizes window to fit first page</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-3 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={centerWindow}
                      onChange={(e) => setCenterWindow(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Center Window</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Positions window at screen center</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-3 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={displayDocTitle}
                      onChange={(e) => setDisplayDocTitle(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Display Doc Title</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Shows Title instead of file name</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Additional Specs: Direction & Print Scaling */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-gray-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    Reading Direction
                  </label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 p-2.5 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="L2R">Left to Right (Western)</option>
                    <option value="R2L">Right to Left (Arabic/Hebrew/CJK)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    Print Scaling
                  </label>
                  <select
                    value={printScaling}
                    onChange={(e) => setPrintScaling(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 p-2.5 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="AppDefault">Application Default</option>
                    <option value="None">None (Force 100% scale on print)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    Duplex Print Mode
                  </label>
                  <select
                    value={duplex}
                    onChange={(e) => setDuplex(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 p-2.5 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="Default">Default</option>
                    <option value="Simplex">Simplex (Single-sided)</option>
                    <option value="DuplexFlipShortEdge">Duplex (Flip Short Edge)</option>
                    <option value="DuplexFlipLongEdge">Duplex (Flip Long Edge)</option>
                  </select>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="button"
                  onClick={applyPreferences}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Applying Preferences...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Apply & Download PDF
                    </>
                  )}
                </button>

                {isDone && downloadUrl && (
                  <a
                    href={downloadUrl}
                    download={outputFileName}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md transition-all text-center flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download {outputFileName}
                  </a>
                )}
              </div>
            </div>

            {/* Current Preferences Inspector */}
            {currentPrefs && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Original Document Catalog Inspector
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-gray-500 dark:text-gray-400 block">Current PageMode</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {currentPrefs.pageMode}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-gray-500 dark:text-gray-400 block">Current PageLayout</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {currentPrefs.pageLayout}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-gray-500 dark:text-gray-400 block">HideToolbar</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {currentPrefs.hideToolbar ? 'true' : 'false'}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-gray-500 dark:text-gray-400 block">FitWindow</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {currentPrefs.fitWindow ? 'true' : 'false'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ad Slot */}
        <AdSlot format="horizontal" />

        {/* How to Use Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Set PDF Viewer Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                1
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Select Your PDF Document</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload your document to inspect its current embedded catalog settings and viewer configuration flags.
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                2
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Configure Display Modes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose presets like Kiosk Presentation, 2-Page Book Spread, or Clean Reading. Toggle toolbar visibility and window centering.
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                3
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Save & Download</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click &quot;Apply &amp; Download PDF&quot; to inject the updated /ViewerPreferences dictionary into your document catalog without recompressing or altering page content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
