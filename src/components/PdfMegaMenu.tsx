'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { tools, getToolUrl } from '@/lib/tools';

interface MegaMenuSection {
  title: string;
  tools: {
    name: string;
    slug?: string;
    action?: string;
    badge?: string;
    icon: React.ReactNode;
  }[];
}

const SECTIONS: MegaMenuSection[] = [
  {
    title: 'ORGANIZE PDF',
    tools: [
      {
        name: 'Merge PDF',
        slug: 'merge-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L11 13.17V7h2v6.17l2.59-2.58L17 12l-5 5z"/>
            </svg>
          </div>
        ),
      },
      {
        name: 'Split PDF',
        slug: 'split-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v10m8-10v10M3 12h18" />
            </svg>
          </div>
        ),
      },
      {
        name: 'Remove pages',
        slug: 'remove-pdf-pages',
        icon: (
          <div className="w-5 h-5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        ),
      },
      {
        name: 'Extract pages',
        slug: 'extract-pdf-pages',
        icon: (
          <div className="w-5 h-5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        ),
      },
      {
        name: 'Organize PDF',
        slug: 'rearrange-pdf-pages',
        icon: (
          <div className="w-5 h-5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
        ),
      },
      {
        name: 'Scan to PDF',
        slug: 'scan-to-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </div>
        ),
      },
    ],
  },
  {
    title: 'OPTIMIZE PDF',
    tools: [
      {
        name: 'Compress PDF',
        slug: 'compress-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        ),
      },
      {
        name: 'Repair PDF',
        slug: 'repair-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        ),
      },
      {
        name: 'OCR PDF',
        slug: 'pdf-ocr',
        icon: (
          <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-black tracking-tighter uppercase">OCR</span>
          </div>
        ),
      },
      {
        name: 'Web Optimize',
        slug: 'optimize-pdf-web',
        icon: (
          <div className="w-5 h-5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        ),
      },
    ],
  },
  {
    title: 'CONVERT TO PDF',
    tools: [
      {
        name: 'JPG to PDF',
        slug: 'image-to-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        ),
      },
      {
        name: 'WORD to PDF',
        slug: 'word-to-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black">W</span>
          </div>
        ),
      },
      {
        name: 'POWERPOINT to PDF',
        slug: 'powerpoint-to-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black">P</span>
          </div>
        ),
      },
      {
        name: 'EXCEL to PDF',
        slug: 'excel-to-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black">X</span>
          </div>
        ),
      },
      {
        name: 'HTML to PDF',
        slug: 'webpage-to-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
        ),
      },
    ],
  },
  {
    title: 'CONVERT FROM PDF',
    tools: [
      {
        name: 'PDF to JPG',
        slug: 'pdf-to-jpg',
        icon: (
          <div className="w-5 h-5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        ),
      },
      {
        name: 'PDF to WORD',
        slug: 'pdf-to-word',
        icon: (
          <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black">W</span>
          </div>
        ),
      },
      {
        name: 'PDF to POWERPOINT',
        slug: 'pdf-to-powerpoint',
        icon: (
          <div className="w-5 h-5 rounded-md bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black">P</span>
          </div>
        ),
      },
      {
        name: 'PDF to EXCEL',
        slug: 'pdf-to-excel',
        icon: (
          <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black">X</span>
          </div>
        ),
      },
      {
        name: 'PDF to PDF/A',
        slug: 'pdf-to-pdfa',
        icon: (
          <div className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-black">/A</span>
          </div>
        ),
      },
    ],
  },
  {
    title: 'EDIT PDF',
    tools: [
      {
        name: 'Rotate PDF',
        slug: 'rotate-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        ),
      },
      {
        name: 'Add page numbers',
        slug: 'number-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-black">123</span>
          </div>
        ),
      },
      {
        name: 'Add watermark',
        slug: 'watermark-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
        ),
      },
      {
        name: 'Crop PDF',
        slug: 'crop-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 2v15a2 2 0 002 2h13M2 7h15a2 2 0 012 2v13" />
            </svg>
          </div>
        ),
      },
      {
        name: 'Edit PDF',
        slug: 'edit-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        ),
      },
      {
        name: 'PDF Forms',
        slug: 'fill-pdf-form',
        icon: (
          <div className="w-5 h-5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        ),
      },
    ],
  },
  {
    title: 'PDF SECURITY',
    tools: [
      {
        name: 'Unlock PDF',
        slug: 'unlock-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
        ),
      },
      {
        name: 'Protect PDF',
        slug: 'protect-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        ),
      },
      {
        name: 'Sign PDF',
        slug: 'sign-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
        ),
      },
      {
        name: 'Redact PDF',
        slug: 'redact-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/>
            </svg>
          </div>
        ),
      },
      {
        name: 'Compare PDF',
        slug: 'compare-pdf',
        icon: (
          <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
        ),
      },
    ],
  },
  {
    title: 'PDF INTELLIGENCE',
    tools: [
      {
        name: 'AI Summarizer / Text',
        slug: 'pdf-to-text',
        icon: (
          <div className="w-5 h-5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        ),
      },
      {
        name: 'Translate PDF',
        action: 'translate',
        icon: (
          <div className="w-5 h-5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <span className="text-xs">🌐</span>
          </div>
        ),
      },
      {
        name: 'PDF to Markdown',
        slug: 'pdf-to-markdown',
        icon: (
          <div className="w-5 h-5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-black">M↓</span>
          </div>
        ),
      },
      {
        name: 'PDF Reader',
        slug: 'pdf-reader',
        icon: (
          <div className="w-5 h-5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        ),
      },
    ],
  },
];

interface PdfMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  filterConvertOnly?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function PdfMegaMenu({
  isOpen,
  onClose,
  filterConvertOnly = false,
  onMouseEnter,
  onMouseLeave,
}: PdfMegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displaySections = filterConvertOnly
    ? SECTIONS.filter((s) => s.title.includes('CONVERT'))
    : SECTIONS;

  return (
    <div
      ref={menuRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-0 right-0 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`grid gap-x-8 gap-y-6 ${
            filterConvertOnly
              ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7'
          }`}
        >
          {displaySections.map((section, idx) => (
            <div key={idx} className="flex flex-col space-y-2.5">
              <div className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 pb-1 border-b border-gray-100 dark:border-slate-800/80">
                {section.title}
              </div>
              <ul className="space-y-1">
                {section.tools.map((tool, tIdx) => {
                  if (tool.action === 'translate') {
                    return (
                      <li key={tIdx}>
                        <button
                          onClick={() => {
                            onClose();
                            const trigger = document.querySelector('[data-lang-trigger="true"]') as HTMLButtonElement | null;
                            if (trigger) trigger.click();
                          }}
                          className="w-full flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60 transition-colors text-left"
                        >
                          {tool.icon}
                          <span className="truncate">{tool.name}</span>
                        </button>
                      </li>
                    );
                  }

                  const matchedTool = tool.slug ? tools.find((t) => t.slug === tool.slug) : null;
                  const toolHref = matchedTool ? getToolUrl(matchedTool) : (tool.slug ? `/tools/${tool.slug}` : '#');

                  return (
                    <li key={tIdx}>
                      <Link
                        href={toolHref}
                        onClick={onClose}
                        className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        {tool.icon}
                        <span className="truncate">{tool.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom banner matching iLovePDF promo / all tools link */}
        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>100% In-Browser Execution — Zero Server Uploads &amp; Complete Privacy</span>
          </div>
          <Link
            href="/#tools"
            onClick={onClose}
            className="font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
          >
            <span>Explore all 103 Tools &amp; Utilities</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
