import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { tools } from '@/lib/tools';

export const metadata: Metadata = {
  title: 'About Us - ToolsVerse App',
  description: 'Learn about ToolsVerse App, the mission to provide 103+ private, fast, in-browser utilities for students, teachers, developers, and professionals worldwide.',
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-extrabold text-red-600 dark:text-red-400 tracking-wider">
            Our Mission &amp; Technology
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
            About ToolsVerse App
          </h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
            Free, instantaneous, and private utilities designed to replace clunky, paywalled cloud converters with 100% in-browser edge computing.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center text-xl font-bold">
              🔒
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Complete Privacy</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              Every document you merge, compress, sign, or convert never leaves your browser. Zero server uploads guarantee 100% data confidentiality.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
              ⚡
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Instant Performance</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              Eliminate upload and download waiting times. WebAssembly and HTML5 canvas process documents using your own device&apos;s raw processing power.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
              💯
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">100% Free Forever</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              No daily file limits, no countdown timers, no forced account signups, and zero subscription paywalls across all {tools.length}+ tools.
            </p>
          </div>
        </div>

        {/* Detailed Story */}
        <div className="space-y-4 text-sm text-gray-700 dark:text-slate-300 leading-relaxed border-t border-gray-100 dark:border-slate-800 pt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Why We Built ToolsVerse App
          </h2>
          <p>
            Millions of students, remote workers, accountants, and software engineers need to perform routine tasks every day: compress a PDF for a university portal, merge contracts, convert spreadsheet tables to JSON, or format code snippets.
          </p>
          <p>
            Unfortunately, most traditional web tools upload these confidential files to remote servers, impose artificial limits (e.g. &quot;2 files per hour unless you pay $12/month&quot;), or inject intrusive trackers. ToolsVerse App was engineered as the open, universal alternative: a complete multi-tool suite that runs directly inside your modern web browser.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold">Have questions, feedback, or tool suggestions?</h3>
            <p className="text-xs text-red-100 mt-0.5">We love hearing from students, educators, and developers worldwide.</p>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 bg-white text-gray-900 font-bold text-xs rounded-xl shadow-md hover:bg-gray-100 transition-all shrink-0"
          >
            Contact Our Team →
          </Link>
        </div>

      </div>
    </div>
  );
}
