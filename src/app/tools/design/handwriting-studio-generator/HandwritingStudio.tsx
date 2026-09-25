'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import {
  StudioOptions,
  DEFAULT_OPTIONS,
  TEMPLATES,
  SAMPLES,
  renderFullDocumentHTML,
} from './handwritingEngine';

type ViewMode = 'split' | 'side' | 'editor' | 'preview';

export default function HandwritingStudio() {
  const [options, setOptions] = useState<StudioOptions>(DEFAULT_OPTIONS);
  const [content, setContent] = useState<string>(SAMPLES.historical.content);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [activeTemplate, setActiveTemplate] = useState<string>('pw_historical');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [syncStatus, setSyncStatus] = useState<string>('Synced');
  const [selectedSample, setSelectedSample] = useState<string>('historical');

  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from localStorage or default
  useEffect(() => {
    try {
      const savedContent = localStorage.getItem('toolsverse_handwriting_content');
      const savedOpts = localStorage.getItem('toolsverse_handwriting_options');
      if (savedContent) setContent(savedContent);
      if (savedOpts) setOptions(JSON.parse(savedOpts));
    } catch (e) {
      console.warn('Storage read error', e);
    }
  }, []);

  // Update Preview whenever content or options change
  useEffect(() => {
    setSyncStatus('Updating...');
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      try {
        const fullHTML = renderFullDocumentHTML(content, options);
        if (previewFrameRef.current) {
          previewFrameRef.current.srcdoc = fullHTML;
        }
        setSyncStatus('Synced');
        // Auto-save
        localStorage.setItem('toolsverse_handwriting_content', content);
        localStorage.setItem('toolsverse_handwriting_options', JSON.stringify(options));
      } catch (err) {
        console.error('Render error', err);
        setSyncStatus('Error');
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [content, options]);

  // Apply a template preset
  const handleApplyTemplate = (tmplKey: string) => {
    setActiveTemplate(tmplKey);
    const tmpl = TEMPLATES[tmplKey];
    if (tmpl) {
      setOptions((prev) => ({ ...prev, ...tmpl }));
    }
  };

  // Load sample content
  const handleLoadSample = (sampleKey: 'historical' | 'cs' | 'structures') => {
    setSelectedSample(sampleKey);
    const s = SAMPLES[sampleKey];
    if (s) {
      setContent(s.content);
      setOptions((prev) => ({
        ...prev,
        subject: s.subject,
        lecture: s.lecture,
      }));
    }
  };

  // Insert markdown snippet at cursor
  const insertSnippet = (snippet: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart || 0;
    const end = ta.selectionEnd || 0;
    const before = content.substring(0, start);
    const after = content.substring(end);
    const updated = before + snippet + after;
    setContent(updated);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + snippet.length;
    }, 20);
  };

  // Handle uploaded text or PDF
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const text = await file.text();
      setContent(text);
      setOptions((prev) => ({
        ...prev,
        subject: file.name.replace(/\.[^/.]+$/, ''),
        lecture: 'Uploaded Document',
      }));
    } else if (file.name.endsWith('.pdf')) {
      // Load PDF.js dynamically from CDN for client-side text extraction
      setSyncStatus('Extracting PDF text...');
      try {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = async () => {
          try {
            const pdfjsLib = (window as any).pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc =
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = `# ${file.name.replace(/\.[^/.]+$/, '').toUpperCase()}\n\n`;

            for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ')
                .replace(/\s+/g, ' ');
              fullText += `## Section from Page ${i}\n\n${pageText}\n\n<!-- PAGE_BREAK -->\n\n`;
            }

            setContent(fullText);
            setOptions((prev) => ({
              ...prev,
              subject: file.name.replace(/\.[^/.]+$/, ''),
              lecture: 'Extracted Lecture Notes',
            }));
            setSyncStatus('Synced');
          } catch (pdfErr) {
            console.error('PDF parsing error', pdfErr);
            alert('Could not extract text from this PDF. Please upload a selectable text PDF or .txt file.');
            setSyncStatus('Ready');
          }
        };
        document.head.appendChild(script);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 1-Click Print & Vector PDF Export
  const handlePrintPDF = () => {
    if (!previewFrameRef.current) return;
    try {
      const frameWin = previewFrameRef.current.contentWindow;
      if (frameWin) {
        frameWin.focus();
        frameWin.print();
      }
    } catch (e) {
      console.error('Print trigger error', e);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-6">
      {/* Top Header & Breadcrumbs */}
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-4">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-700">/</span>
        <Link href="/tools/design/" className="hover:text-primary-600 transition-colors">Design</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-700">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Handwriting Studio Generator</span>
      </nav>

      {/* Main Studio Top Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white text-xl shadow-xs">
            ✍️
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              Handwriting Studio Generator
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                100% In-Browser &amp; Private
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 hidden sm:block">
              Convert PDFs and text into stylized handwritten lecture notes with custom fonts, diagrams &amp; ruled paper.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Layout Mode Selector */}
          <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-xl flex font-bold">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400'
              }`}
              title="Settings, Editor, and Preview"
            >
              3-Panels
            </button>
            <button
              onClick={() => setViewMode('side')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'side'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400'
              }`}
              title="Editor & Preview"
            >
              Editor + Notes
            </button>
            <button
              onClick={() => setViewMode('editor')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'editor'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400'
              }`}
              title="Full Editor"
            >
              Full Editor
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400'
              }`}
              title="Full Preview"
            >
              Full Preview
            </button>
          </div>

          {/* Preset Samples */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl font-bold">
            <button
              onClick={() => handleLoadSample('historical')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedSample === 'historical'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
              }`}
            >
              🏛️ History Sample
            </button>
            <button
              onClick={() => handleLoadSample('cs')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedSample === 'cs'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
              }`}
            >
              ⚡ CS Trees
            </button>
            <button
              onClick={() => handleLoadSample('structures')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedSample === 'structures'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
              }`}
            >
              📊 4-Structures
            </button>
          </div>

          {/* Download PDF Button */}
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black shadow-md flex items-center gap-2 transition-all active:scale-95"
            title="Download crisp vector PDF with standard A4 margins"
          >
            <span>📥</span>
            <span>Download Vector PDF</span>
          </button>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        {/* Panel 1: Settings Sidebar */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            className={`${
              viewMode === 'preview' ? 'hidden' : 'lg:col-span-3'
            } bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs space-y-5 text-xs`}
          >
            {/* Template Selector Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 rounded-2xl border border-indigo-700/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[13px] flex items-center gap-1.5 text-indigo-200">
                  <span>🎨</span> Layout Template
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                  1-Click
                </span>
              </div>
              <select
                value={activeTemplate}
                onChange={(e) => handleApplyTemplate(e.target.value)}
                className="w-full bg-slate-800 border border-indigo-500/50 rounded-xl px-2.5 py-2 text-xs font-bold text-white outline-none cursor-pointer"
              >
                <option value="pw_historical">🏛️ PW OnlyIAS Official (Historical)</option>
                <option value="royal_academic">🎓 Royal Academic / University</option>
                <option value="emerald_topper">🌲 Forest Emerald (Topper Notes)</option>
                <option value="cs_tech">⚡ Computer Science &amp; Tech Spec</option>
                <option value="vintage_cornell">📜 Vintage Sepia Cornell</option>
                <option value="minimalist">✨ Minimalist Clean Notebook</option>
              </select>
            </div>

            {/* Handwriting Font Selection */}
            <div>
              <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                Handwriting Typography
              </label>
              <select
                value={options.fontFamily}
                onChange={(e) => setOptions({ ...options, fontFamily: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="Coming Soon">Coming Soon (Authentic Casual)</option>
                <option value="Caveat">Caveat (Flowing Pen Style)</option>
                <option value="Patrick Hand">Patrick Hand (Class Notes)</option>
                <option value="Kalam">Kalam (Fountain Ink Pen)</option>
                <option value="Architects Daughter">Architects Daughter (Sketch Style)</option>
                <option value="Indie Flower">Indie Flower (Relaxed Cursive)</option>
                <option value="Gochi Hand">Gochi Hand (Marker Pen)</option>
                <option value="Comic Neue">Comic Neue (Clean Script)</option>
              </select>
            </div>

            {/* Paper Texture */}
            <div>
              <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                Paper Texture Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'plain', label: 'Plain White' },
                  { id: 'ruled', label: 'Ruled Lines' },
                  { id: 'grid', label: 'Graph Grid' },
                  { id: 'cream', label: 'Sepia Cream' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setOptions({ ...options, paperStyle: p.id as any })}
                    className={`py-2 px-2.5 rounded-xl border text-center font-bold transition-all ${
                      options.paperStyle === p.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rich Draft Mode */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
              <div>
                <span className="font-extrabold text-amber-900 dark:text-amber-300 block">
                  Dark Rich Ink (Draft)
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400">
                  Bolder stroke thickness for high contrast
                </span>
              </div>
              <input
                type="checkbox"
                checked={options.draftMode}
                onChange={(e) => setOptions({ ...options, draftMode: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {/* Document Header Settings */}
            <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-slate-800">
              <span className="font-extrabold text-gray-800 dark:text-white uppercase tracking-wider text-[11px] block">
                Header &amp; Branding
              </span>

              <div>
                <label className="block text-gray-500 dark:text-slate-400 font-semibold mb-1">
                  Subject Title
                </label>
                <input
                  type="text"
                  value={options.subject}
                  onChange={(e) => setOptions({ ...options, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-bold text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-500 dark:text-slate-400 font-semibold mb-1">
                  Lecture / Chapter Name
                </label>
                <input
                  type="text"
                  value={options.lecture}
                  onChange={(e) => setOptions({ ...options, lecture: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-bold text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-500 dark:text-slate-400 font-semibold mb-1">
                    Subject Color
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={options.subjectColor}
                      onChange={(e) => setOptions({ ...options, subjectColor: e.target.value })}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-gray-600 dark:text-slate-300">
                      {options.subjectColor}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 dark:text-slate-400 font-semibold mb-1">
                    Lecture Color
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={options.lectureColor}
                      onChange={(e) => setOptions({ ...options, lectureColor: e.target.value })}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-gray-600 dark:text-slate-300">
                      {options.lectureColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Notes Box Toggle */}
            <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-gray-800 dark:text-white block">
                    &quot;Space for Notes&quot; Sidebar
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">
                    Right margin box for revisions
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={options.showSidebar}
                  onChange={(e) => setOptions({ ...options, showSidebar: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {options.showSidebar && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-500 dark:text-slate-400 font-semibold mb-1">Sidebar Label</label>
                    <input
                      type="text"
                      value={options.sidebarText}
                      onChange={(e) => setOptions({ ...options, sidebarText: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-bold text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 dark:text-slate-400 font-semibold mb-1">Border Color</label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="color"
                        value={options.sidebarColor}
                        onChange={(e) => setOptions({ ...options, sidebarColor: e.target.value })}
                        className="w-6 h-6 rounded-md border-0 cursor-pointer"
                      />
                      <span className="text-[11px] font-mono text-gray-600 dark:text-slate-300">
                        {options.sidebarColor}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Panel 2: Notes Editor */}
        {(viewMode === 'split' || viewMode === 'side' || viewMode === 'editor') && (
          <div
            className={`${
              viewMode === 'editor'
                ? 'lg:col-span-12'
                : viewMode === 'side'
                ? 'lg:col-span-6'
                : 'lg:col-span-4'
            } bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs flex flex-col`}
          >
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => insertSnippet('\n# SECTION TITLE\n')}
                  className="px-2 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 font-bold rounded-lg text-gray-800 dark:text-white"
                  title="Section Title (H1)"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('\n## Subheading Topic\n')}
                  className="px-2 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 font-bold rounded-lg text-gray-800 dark:text-white"
                  title="Subheading Topic (H2)"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('\n- **Key Point:** Explanation goes here.\n')}
                  className="px-2 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 font-bold rounded-lg text-gray-800 dark:text-white"
                  title="Bullet Point"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      '\n| Feature | Average | Worst Case |\n| Search | O(log N) | O(N) |\n| Insert | O(log N) | O(N) |\n'
                    )
                  }
                  className="px-2 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 font-bold rounded-lg text-gray-800 dark:text-white"
                  title="Table"
                >
                  田 Table
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet('\n```tree\n50\n  30\n    20\n    40\n  70\n    60\n    80\n```\n')
                  }
                  className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg"
                  title="Binary Tree Diagram"
                >
                  🌲 Tree
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('\n```tree\nStep 1 -> Step 2 -> Step 3\n```\n')}
                  className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg"
                  title="Flowchart Arrow"
                >
                  ➡️ Flow
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('\n<!-- PAGE_BREAK -->\n')}
                  className="px-2 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold rounded-lg"
                  title="Force New A4 Page"
                >
                  📄 Break
                </button>
              </div>

              {/* PDF/Text Upload Button */}
              <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors">
                <span>📎 Upload PDF / Text</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Markdown Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your notes in Markdown or paste textbook text here..."
              className="w-full flex-1 min-h-[500px] lg:min-h-[750px] p-4 font-mono text-xs sm:text-sm bg-gray-50 dark:bg-slate-950/80 rounded-2xl border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 outline-none resize-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
        )}

        {/* Panel 3: Live Output A4 Preview */}
        {(viewMode === 'split' || viewMode === 'side' || viewMode === 'preview') && (
          <div
            className={`${
              viewMode === 'preview'
                ? 'lg:col-span-12'
                : viewMode === 'side'
                ? 'lg:col-span-6'
                : 'lg:col-span-5'
            } bg-slate-950 rounded-3xl border border-slate-800 shadow-xl flex flex-col overflow-hidden`}
          >
            {/* Preview Toolbar */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-white">Live A4 Page Preview</span>
                <span className="text-[11px] text-slate-400 ml-1">({syncStatus})</span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                    className="px-2 py-0.5 hover:text-white font-bold"
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <span className="px-1.5 text-[11px] font-mono text-slate-200">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                    className="px-2 py-0.5 hover:text-white font-bold"
                    title="Zoom In"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handlePrintPDF}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-1 transition-colors"
                >
                  <span>🖨️</span> Print / PDF
                </button>
              </div>
            </div>

            {/* Scaled Preview Frame */}
            <div className="flex-1 bg-slate-950 p-2 sm:p-4 overflow-auto flex justify-center items-start min-h-[500px] lg:min-h-[750px]">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="w-full flex justify-center"
              >
                <iframe
                  ref={previewFrameRef}
                  title="Handwritten Notes Preview"
                  className="w-[210mm] min-h-[297mm] h-[1200px] bg-white rounded-md shadow-2xl border-0"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
