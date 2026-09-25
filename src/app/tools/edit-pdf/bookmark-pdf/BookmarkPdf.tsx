'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import FeedbackWidget from '@/components/FeedbackWidget';
import RelatedTools from '@/components/RelatedTools';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';
import {
  PDFDocument,
  PDFName,
  PDFDict,
  PDFArray,
  PDFHexString,
  PDFNumber,
  PDFRef,
} from 'pdf-lib';

interface BookmarkItem {
  id: string;
  title: string;
  pageNumber: number; // 1-indexed
  level: number; // 0 = main chapter, 1 = section, 2 = sub-section
}

interface OutlineTreeNode {
  title: string;
  pageNumber: number;
  children: OutlineTreeNode[];
}

export default function BookmarkPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPageNumber, setNewPageNumber] = useState<number>(1);
  const [newLevel, setNewLevel] = useState<number>(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [bookmarkedBlob, setBookmarkedBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);
    setDownloadUrl(null);
    setBookmarkedBlob(null);
    setErrorMsg(null);

    try {
      const buffer = await uploaded.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();
      setPageCount(count);
      setNewPageNumber(1);

      // Initialize with sample initial bookmark
      setBookmarks([
        {
          id: `bm_${Date.now()}_1`,
          title: 'Cover / Title Page',
          pageNumber: 1,
          level: 0,
        },
      ]);
    } catch {
      setPageCount(0);
      setBookmarks([]);
    }
  };

  const addBookmark = () => {
    if (!newTitle.trim()) return;

    const newItem: BookmarkItem = {
      id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: newTitle.trim(),
      pageNumber: Math.max(1, Math.min(pageCount || 1, newPageNumber)),
      level: Math.max(0, Math.min(4, newLevel)),
    };

    setBookmarks((prev) => [...prev, newItem]);
    setNewTitle('');
    // Advance suggested page number
    setNewPageNumber((p) => Math.min(pageCount || 1, p + 1));
  };

  const autoGeneratePageBookmarks = () => {
    if (pageCount <= 0) return;
    const generated: BookmarkItem[] = [];
    for (let i = 1; i <= pageCount; i++) {
      generated.push({
        id: `bm_${Date.now()}_${i}`,
        title: `Page ${i}`,
        pageNumber: i,
        level: 0,
      });
    }
    setBookmarks(generated);
  };

  const updateBookmark = (id: string, updates: Partial<BookmarkItem>) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const deleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBookmark = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === bookmarks.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...bookmarks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setBookmarks(updated);
  };

  const changeLevel = (id: string, delta: number) => {
    setBookmarks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const newLvl = Math.max(0, Math.min(4, b.level + delta));
        return { ...b, level: newLvl };
      })
    );
  };

  // Convert flat outline items into hierarchical outline tree
  const buildOutlineTree = (items: BookmarkItem[]): OutlineTreeNode[] => {
    const rootChildren: OutlineTreeNode[] = [];
    const stack: { node: OutlineTreeNode; level: number }[] = [];

    for (const item of items) {
      const node: OutlineTreeNode = {
        title: item.title,
        pageNumber: item.pageNumber,
        children: [],
      };

      while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
        stack.pop();
      }

      if (stack.length > 0) {
        stack[stack.length - 1].node.children.push(node);
      } else {
        rootChildren.push(node);
      }

      stack.push({ node, level: item.level });
    }

    return rootChildren;
  };

  const saveBookmarksToPdf = async () => {
    if (!file || bookmarks.length === 0) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const context = pdfDoc.context;
      const docPageCount = pdfDoc.getPageCount();

      const tree = buildOutlineTree(bookmarks);

      // Outlines root dictionary
      const outlinesDict = PDFDict.withContext(context);
      outlinesDict.set(PDFName.of('Type'), PDFName.of('Outlines'));
      const outlinesRef = context.register(outlinesDict);

      // Recursive tree builder function
      const processLevel = (nodes: OutlineTreeNode[], parentRef: PDFRef) => {
        if (nodes.length === 0) return { firstRef: null, lastRef: null, count: 0 };

        const itemRefs: PDFRef[] = [];
        const itemDicts: PDFDict[] = [];

        for (const node of nodes) {
          const itemDict = PDFDict.withContext(context);
          itemDict.set(PDFName.of('Title'), PDFHexString.fromText(node.title));
          itemDict.set(PDFName.of('Parent'), parentRef);

          const targetPageIdx = Math.max(0, Math.min(docPageCount - 1, node.pageNumber - 1));
          const page = pdfDoc.getPage(targetPageIdx);
          const dest = PDFArray.withContext(context);
          dest.push(page.ref);
          dest.push(PDFName.of('Fit'));
          itemDict.set(PDFName.of('Dest'), dest);

          const itemRef = context.register(itemDict);
          itemRefs.push(itemRef);
          itemDicts.push(itemDict);
        }

        let totalCount = nodes.length;

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const dict = itemDicts[i];
          const ref = itemRefs[i];

          if (i > 0) dict.set(PDFName.of('Prev'), itemRefs[i - 1]);
          if (i < nodes.length - 1) dict.set(PDFName.of('Next'), itemRefs[i + 1]);

          if (node.children && node.children.length > 0) {
            const childRes = processLevel(node.children, ref);
            if (childRes.firstRef && childRes.lastRef) {
              dict.set(PDFName.of('First'), childRes.firstRef);
              dict.set(PDFName.of('Last'), childRes.lastRef);
              dict.set(PDFName.of('Count'), PDFNumber.of(childRes.count));
              totalCount += childRes.count;
            }
          }
        }

        return {
          firstRef: itemRefs[0],
          lastRef: itemRefs[itemRefs.length - 1],
          count: totalCount,
        };
      };

      const rootRes = processLevel(tree, outlinesRef);
      if (rootRes.firstRef && rootRes.lastRef) {
        outlinesDict.set(PDFName.of('First'), rootRes.firstRef);
        outlinesDict.set(PDFName.of('Last'), rootRes.lastRef);
        outlinesDict.set(PDFName.of('Count'), PDFNumber.of(rootRes.count));
        pdfDoc.catalog.set(PDFName.of('Outlines'), outlinesRef);
      }

      // Configure viewer to display bookmarks / outlines panel open by default
      pdfDoc.catalog.set(PDFName.of('PageMode'), PDFName.of('UseOutlines'));

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      setBookmarkedBlob(blob);

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `🔖 Added ${bookmarks.length} Bookmarks & Outlines Successfully!` },
        })
      );
    } catch (err: any) {
      console.error('Bookmark error:', err);
      setErrorMsg(err.message || 'Failed to apply bookmarks to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Bookmark PDF</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white text-xl shadow-sm">
            🔖
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Bookmark PDF &amp; Table of Contents
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Create, organize, and nest hierarchical bookmarks and outline navigation trees for effortless browsing across Acrobat, Preview, and browsers.
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
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-3xl mb-3 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                🔖
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Upload PDF to Add Bookmarks
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                Drag &amp; drop PDF file here, or click to browse
              </p>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/60">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl shrink-0 font-bold">
                  📄
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {pageCount} Total Pages • {bookmarks.length} Bookmarks Configured
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={autoGeneratePageBookmarks}
                  className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 text-gray-700 dark:text-slate-200 rounded-lg font-semibold transition-colors"
                >
                  ⚡ Auto-Add All Pages
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setBookmarks([]);
                    setDownloadUrl(null);
                    setBookmarkedBlob(null);
                  }}
                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors font-medium"
                >
                  Choose Different PDF
                </button>
              </div>
            </div>

            {/* Add Bookmark Input Bar */}
            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
                Add New Outline Entry
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="e.g. Chapter 1: Introduction or Section 2.3"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBookmark()}
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                      Page:
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={pageCount || 1}
                      value={newPageNumber}
                      onChange={(e) => setNewPageNumber(parseInt(e.target.value) || 1)}
                      className="w-16 text-xs px-2.5 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-center"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                      Level:
                    </span>
                    <select
                      value={newLevel}
                      onChange={(e) => setNewLevel(parseInt(e.target.value) || 0)}
                      className="text-xs px-2.5 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    >
                      <option value={0}>Main (0)</option>
                      <option value={1}>Sub (1)</option>
                      <option value={2}>Sub-sub (2)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={addBookmark}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* Bookmarks Tree List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Document Outlines &amp; Hierarchy ({bookmarks.length})
                </h3>
                {bookmarks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setBookmarks([])}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {bookmarks.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 dark:text-slate-500 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                  No bookmarks created yet. Type a title above or click "Auto-Add All Pages" to begin.
                </div>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto p-1">
                  {bookmarks.map((bm, index) => (
                    <div
                      key={bm.id}
                      className="p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      style={{
                        marginLeft: `${bm.level * 24}px`,
                      }}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="text-xs text-gray-400 dark:text-slate-400 font-mono">
                          {bm.level > 0 ? '↳ ' : '• '}
                        </span>
                        <input
                          type="text"
                          value={bm.title}
                          onChange={(e) => updateBookmark(bm.id, { title: e.target.value })}
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-950 font-medium text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                          <span>Page:</span>
                          <input
                            type="number"
                            min={1}
                            max={pageCount || 1}
                            value={bm.pageNumber}
                            onChange={(e) =>
                              updateBookmark(bm.id, {
                                pageNumber: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-14 text-center px-1.5 py-1 rounded border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white"
                          />
                        </div>

                        {/* Indent / Outdent buttons */}
                        <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            title="Outdent (Move left in hierarchy)"
                            disabled={bm.level <= 0}
                            onClick={() => changeLevel(bm.id, -1)}
                            className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-30"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            title="Indent (Nest as sub-chapter)"
                            disabled={bm.level >= 4}
                            onClick={() => changeLevel(bm.id, 1)}
                            className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-30 border-l border-gray-200 dark:border-slate-700"
                          >
                            →
                          </button>
                        </div>

                        {/* Move Up / Down */}
                        <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            title="Move Up"
                            disabled={index === 0}
                            onClick={() => moveBookmark(index, 'up')}
                            className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            title="Move Down"
                            disabled={index === bookmarks.length - 1}
                            onClick={() => moveBookmark(index, 'down')}
                            className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-30 border-l border-gray-200 dark:border-slate-700"
                          >
                            ↓
                          </button>
                        </div>

                        {/* Delete */}
                        <button
                          type="button"
                          title="Delete bookmark"
                          onClick={() => deleteBookmark(bm.id)}
                          className="p-1 text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                onClick={saveBookmarksToPdf}
                disabled={isProcessing || bookmarks.length === 0}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-rose-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Writing PDF Outlines...</span>
                  </>
                ) : (
                  <>
                    <span>Apply Bookmarks &amp; Download PDF</span>
                    <span>→</span>
                  </>
                )}
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={`bookmarked-${file.name}`}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  <span>Download Bookmarked PDF ↓</span>
                </a>
              )}
            </div>

            {/* Live Document Preview */}
            {bookmarkedBlob && (
              <div className="pt-4">
                <DocumentLiveViewer
                  file={bookmarkedBlob}
                  fileName={`bookmarked-${file.name}`}
                  title="Bookmarked PDF Preview"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <FeedbackWidget toolName="Bookmark PDF" />
      <RelatedTools currentSlug="bookmark-pdf" />

      {/* How to Use Section */}
      <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          How to Add Bookmarks to a PDF
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-primary-600 text-sm">1. Select Document</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Upload E-Book or Report</p>
            <p className="mt-0.5">
              Upload textbooks, research theses, annual reports, or manuals requiring structured navigation.
            </p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">2. Build Bookmark Hierarchy</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Indent &amp; Organize</p>
            <p className="mt-0.5">
              Add chapter headings, specify target page numbers, and click the arrow keys to nest sub-sections.
            </p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">3. Download Outlined PDF</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Native Reader Outlines</p>
            <p className="mt-0.5">
              Your bookmarks appear in the navigation sidebar of Adobe Acrobat, Preview, Chrome, and PDF reader apps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
