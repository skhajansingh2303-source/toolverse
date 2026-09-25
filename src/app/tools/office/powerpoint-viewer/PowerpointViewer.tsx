'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

interface SlideElement {
  type: 'shape' | 'image';
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  fill?: string;
  imgData?: string | null;
}

interface ParsedSlide {
  id: string;
  slideNumber: number;
  elements: SlideElement[];
}

export default function PowerpointViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [slides, setSlides] = useState<ParsedSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [slideWidth, setSlideWidth] = useState<number>(960);
  const [slideHeight, setSlideHeight] = useState<number>(540);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const parsePptx = async (buffer: ArrayBuffer, name: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const zip = await JSZip.loadAsync(buffer);
      const presXml = await zip.file('ppt/presentation.xml')?.async('text');
      let cx = 12192000, cy = 6858000;

      if (presXml) {
        const presDoc = new DOMParser().parseFromString(presXml, 'application/xml');
        const sldSz = presDoc.getElementsByTagName('p:sldSz')[0];
        if (sldSz) {
          cx = parseInt(sldSz.getAttribute('cx') || '12192000');
          cy = parseInt(sldSz.getAttribute('cy') || '6858000');
        }
      }

      const width = Math.round((cx * 96) / 914400);
      const height = Math.round((cy * 96) / 914400);
      setSlideWidth(width);
      setSlideHeight(height);

      const slideFiles = Object.keys(zip.files)
        .filter((f) => f.match(/^ppt\/slides\/slide\d+\.xml$/))
        .sort((a, b) => parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0'));

      if (slideFiles.length === 0) {
        throw new Error('No presentation slides found in this .pptx file.');
      }

      const parsedSlides: ParsedSlide[] = [];

      for (let i = 0; i < slideFiles.length; i++) {
        const slideFile = slideFiles[i];
        const slideXml = await zip.file(slideFile)?.async('text');
        if (!slideXml) continue;

        const slideDoc = new DOMParser().parseFromString(slideXml, 'application/xml');
        const shapes = Array.from(slideDoc.getElementsByTagName('p:sp'));
        const pictures = Array.from(slideDoc.getElementsByTagName('p:pic'));
        const elements: SlideElement[] = [];

        const slideNum = slideFile.match(/\d+/)?.[0];
        const relsFile = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
        const relsXml = await zip.file(relsFile)?.async('text');
        const rels: Record<string, string> = {};

        if (relsXml) {
          const relsDoc = new DOMParser().parseFromString(relsXml, 'application/xml');
          const relsArr = Array.from(relsDoc.getElementsByTagName('Relationship'));
          for (const rel of relsArr) {
            rels[rel.getAttribute('Id') || ''] = rel.getAttribute('Target') || '';
          }
        }

        for (const shape of shapes) {
          const off = shape.getElementsByTagName('a:off')[0];
          const ext = shape.getElementsByTagName('a:ext')[0];
          const x = off ? Math.round((parseInt(off.getAttribute('x') || '0') * 96) / 914400) : 0;
          const y = off ? Math.round((parseInt(off.getAttribute('y') || '0') * 96) / 914400) : 0;
          const w = ext ? Math.round((parseInt(ext.getAttribute('cx') || '0') * 96) / 914400) : 0;
          const h = ext ? Math.round((parseInt(ext.getAttribute('cy') || '0') * 96) / 914400) : 0;

          const tElements = Array.from(shape.getElementsByTagName('a:t'));
          const text = tElements.map((t) => t.textContent).join(' ');

          const solidFill = shape.getElementsByTagName('a:solidFill')[0];
          const srgbClr = solidFill?.getElementsByTagName('a:srgbClr')[0];
          const fill = srgbClr ? '#' + srgbClr.getAttribute('val') : undefined;

          elements.push({ type: 'shape', x, y, w, h, text, fill });
        }

        for (const pic of pictures) {
          const blip = pic.getElementsByTagName('a:blip')[0];
          const rId = blip?.getAttribute('r:embed');
          let imgData: string | null = null;

          if (rId && rels[rId]) {
            let target = rels[rId];
            let fullPath = target.startsWith('/') ? target.substring(1) : target.startsWith('../') ? 'ppt/' + target.substring(3) : 'ppt/slides/' + target;
            const imgFile = zip.file(fullPath);
            if (imgFile) {
              const base64 = await imgFile.async('base64');
              const ext = fullPath.split('.').pop()?.toLowerCase();
              const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
              imgData = `data:${mime};base64,${base64}`;
            }
          }

          const off = pic.getElementsByTagName('a:off')[0];
          const ext = pic.getElementsByTagName('a:ext')[0];
          const x = off ? Math.round((parseInt(off.getAttribute('x') || '0') * 96) / 914400) : 0;
          const y = off ? Math.round((parseInt(off.getAttribute('y') || '0') * 96) / 914400) : 0;
          const w = ext ? Math.round((parseInt(ext.getAttribute('cx') || '0') * 96) / 914400) : 0;
          const h = ext ? Math.round((parseInt(ext.getAttribute('cy') || '0') * 96) / 914400) : 0;

          elements.push({ type: 'image', x, y, w, h, imgData });
        }

        parsedSlides.push({
          id: `slide-${i + 1}`,
          slideNumber: i + 1,
          elements,
        });
      }

      setSlides(parsedSlides);
      setCurrentSlideIndex(0);
      setFileName(name);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Failed to parse PowerPoint presentation. Ensure it is a valid .pptx file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          parsePptx(ev.target.result as ArrayBuffer, uploadedFile.name);
        }
      };
      reader.readAsArrayBuffer(uploadedFile);
    }
  };

  const loadSample = () => {
    setSlideWidth(960);
    setSlideHeight(540);
    setFileName('ToolsVerse_Overview.pptx');
    setSlides([
      {
        id: 'slide-1',
        slideNumber: 1,
        elements: [
          { type: 'shape', x: 80, y: 120, w: 800, h: 100, text: 'ToolsVerse: In-Browser Productivity Suite', fill: '#f8fafc' },
          { type: 'shape', x: 80, y: 240, w: 800, h: 80, text: '100+ Free Online Tools for Students, Developers, and Professionals', fill: '#e2e8f0' },
          { type: 'shape', x: 80, y: 340, w: 800, h: 60, text: '100% Client-Side • Zero Cloud Uploads • Instant Privacy', fill: '#dbeafe' },
        ],
      },
      {
        id: 'slide-2',
        slideNumber: 2,
        elements: [
          { type: 'shape', x: 80, y: 80, w: 800, h: 80, text: 'Key Pillars of ToolsVerse', fill: '#f1f5f9' },
          { type: 'shape', x: 80, y: 180, w: 250, h: 260, text: '📄 PDF Suite: Merge, Split, Compress, Sign, and OCR PDFs directly in browser.', fill: '#fee2e2' },
          { type: 'shape', x: 355, y: 180, w: 250, h: 260, text: '💻 Developer Hub: JSON Formatter, JWT Decoder, RegEx Tester, Base64 & Hashes.', fill: '#e0e7ff' },
          { type: 'shape', x: 630, y: 180, w: 250, h: 260, text: '📊 Office Tools: Word to PDF, Excel to CSV, PowerPoint Viewer & Converters.', fill: '#dcfce7' },
        ],
      },
      {
        id: 'slide-3',
        slideNumber: 3,
        elements: [
          { type: 'shape', x: 180, y: 160, w: 600, h: 120, text: 'Start Presenting with Full Screen Slideshow!', fill: '#eff6ff' },
          { type: 'shape', x: 180, y: 300, w: 600, h: 70, text: 'Press Left / Right arrows to navigate slides, or Esc to exit full screen.', fill: '#f8fafc' },
        ],
      },
    ]);
    setCurrentSlideIndex(0);
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullScreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (slides.length === 0) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'f' || e.key === 'F5') {
        e.preventDefault();
        toggleFullScreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [slides.length, currentSlideIndex]);

  const activeSlide = slides[currentSlideIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/#tools" className="hover:text-primary-600 transition-colors">Tools</Link>
        <span>/</span>
        <span className="text-gray-800 dark:text-slate-200 font-medium">PowerPoint Viewer</span>
      </div>

      {/* Tool Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold mb-3 border border-red-200 dark:border-red-900/50">
          <span>📽️</span>
          <span>100% Private In-Browser Slideshow</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          Online PowerPoint Viewer &amp; Slideshow
        </h1>
        <p className="text-base text-gray-600 dark:text-slate-400 leading-relaxed">
          Open, present, and review Microsoft PowerPoint (.pptx) presentation slides directly in your browser. No Microsoft Office or PowerPoint install required.
        </p>
      </div>

      {/* File Upload / Actions Area */}
      {slides.length === 0 ? (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-800 p-10 text-center shadow-xs">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
            📽️
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Upload PowerPoint (.pptx) Presentation
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">
            Runs client-side in your browser. Presentations are never uploaded to any remote server.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <label className="cursor-pointer px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-xl shadow-md text-sm transition-transform active:scale-95 inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Select .pptx File</span>
              <input
                type="file"
                accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={loadSample}
              className="px-5 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <span>⚡</span>
              <span>Load Sample Slides</span>
            </button>
          </div>

          {isProcessing && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-semibold">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Decoding presentation slides...</span>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium">
              {errorMessage}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-950/60 rounded-lg text-lg">📽️</div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {fileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Slide {currentSlideIndex + 1} of {slides.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-40 text-gray-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors"
                title="Previous Slide (Left Arrow)"
              >
                ← Prev
              </button>

              <button
                onClick={nextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-40 text-gray-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors"
                title="Next Slide (Right Arrow)"
              >
                Next →
              </button>

              <button
                onClick={toggleFullScreen}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                title="Full-Screen Slideshow (F)"
              >
                <span>🖥️</span>
                <span>Slideshow</span>
              </button>

              <label className="cursor-pointer px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors">
                <span>Change File</span>
                <input
                  type="file"
                  accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Main Slide & Thumbnails View */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Thumbnails list */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 max-h-[600px] overflow-y-auto space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-2">Slides ({slides.length})</h3>
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                    idx === currentSlideIndex
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold'
                      : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-slate-300'
                  }`}
                >
                  <span className="w-6 h-6 rounded-md bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate text-xs">
                    {s.elements.find((el) => el.text)?.text || `Slide ${idx + 1}`}
                  </div>
                </button>
              ))}
            </div>

            {/* Slide Stage */}
            <div
              ref={containerRef}
              className={`lg:col-span-3 bg-slate-950 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[500px] relative ${
                isFullScreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : ''
              }`}
            >
              {activeSlide && (
                <div
                  className="relative bg-white text-slate-900 rounded-lg shadow-2xl overflow-hidden max-w-full max-h-full"
                  style={{
                    aspectRatio: `${slideWidth} / ${slideHeight}`,
                    width: '100%',
                    maxWidth: `${slideWidth}px`,
                  }}
                >
                  {activeSlide.elements.map((el, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: `${(el.x / slideWidth) * 100}%`,
                        top: `${(el.y / slideHeight) * 100}%`,
                        width: `${(el.w / slideWidth) * 100}%`,
                        height: `${(el.h / slideHeight) * 100}%`,
                        backgroundColor: el.fill || 'transparent',
                      }}
                      className="p-2 flex flex-col justify-center overflow-hidden rounded-xs leading-snug"
                    >
                      {el.type === 'image' && el.imgData && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={el.imgData} alt="Slide Graphic" className="w-full h-full object-contain" />
                      )}
                      {el.text && (
                        <p className="text-xs sm:text-sm md:text-base font-medium whitespace-pre-wrap break-words text-slate-800">
                          {el.text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Floating Fullscreen Controls */}
              {isFullScreen && (
                <div className="absolute bottom-6 bg-black/70 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 text-white flex items-center gap-4 text-xs font-semibold">
                  <button onClick={prevSlide} disabled={currentSlideIndex === 0} className="hover:text-red-400 disabled:opacity-40">
                    ◀ Prev
                  </button>
                  <span>{currentSlideIndex + 1} / {slides.length}</span>
                  <button onClick={nextSlide} disabled={currentSlideIndex === slides.length - 1} className="hover:text-red-400 disabled:opacity-40">
                    Next ▶
                  </button>
                  <span className="text-white/40">|</span>
                  <button onClick={toggleFullScreen} className="hover:text-red-400">
                    Exit (Esc)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ad Placement */}
      <AdSlot format="horizontal" className="my-8" />

      {/* SEO & Knowledge Guide Section */}
      <div className="mt-12 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 max-w-4xl mx-auto shadow-xs">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          How to Present PowerPoint Presentations Online Without Microsoft Office
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-sm text-gray-600 dark:text-slate-400">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <span className="w-7 h-7 rounded-full bg-red-600 text-white font-bold inline-flex items-center justify-center mb-2 text-xs">1</span>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Open PPTX File</h3>
            <p className="text-xs">Drag and drop any Microsoft PowerPoint (.pptx) file directly from your computer, phone, or tablet.</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <span className="w-7 h-7 rounded-full bg-red-600 text-white font-bold inline-flex items-center justify-center mb-2 text-xs">2</span>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Interactive Navigation</h3>
            <p className="text-xs">Browse slide thumbnails, click to jump to any section, or use arrow keys to step through each slide.</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <span className="w-7 h-7 rounded-full bg-red-600 text-white font-bold inline-flex items-center justify-center mb-2 text-xs">3</span>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Full-Screen Slideshow</h3>
            <p className="text-xs">Hit Slideshow to enter full-screen presentation mode for lectures, client meetings, or conferences.</p>
          </div>
        </div>

        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Frequently Asked Questions (FAQ)</h3>
        <div className="space-y-4 text-xs sm:text-sm text-gray-600 dark:text-slate-400">
          <div>
            <h4 className="font-bold text-gray-800 dark:text-slate-200">Is my presentation private?</h4>
            <p>Yes. ToolsVerse processes the presentation directly in your browser using client-side JavaScript. No slide data or images are ever uploaded to any server.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-slate-200">Do I need Microsoft PowerPoint installed?</h4>
            <p>No. This viewer works 100% inside any modern web browser on Windows, macOS, Linux, Android, and iOS.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
