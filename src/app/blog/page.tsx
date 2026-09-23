import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blogData';
import AdSlot from '@/components/AdSlot';

export const metadata: Metadata = {
  title: 'ToolsVerse Blog & Guides — PDF, Document & Productivity Tutorials',
  description:
    'Comprehensive step-by-step guides, productivity tips, and tutorials for PDF editing, document conversion, e-signatures, and data security. 100% free.',
  keywords: [
    'pdf guides',
    'how to compress pdf',
    'how to merge pdf',
    'pdf tutorials',
    'convert pdf to word guide',
    'free document guides',
    'ilovepdf alternative guide',
  ],
  alternates: {
    canonical: 'https://toolsverseapp.com/blog/',
  },
};

export default function BlogIndexPage() {
  const categories = ['All', 'PDF Guides', 'Conversion', 'Security & Privacy'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 dark:text-slate-400 flex items-center space-x-2">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-semibold">Blog &amp; Guides</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-xs font-bold text-primary-700 dark:text-primary-300">
            <span>📚</span>
            <span>Knowledge Base &amp; Productivity Guides</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Practical Guides &amp; Tutorials for <span className="bg-gradient-to-r from-primary-600 via-rose-600 to-indigo-600 bg-clip-text text-transparent">Smarter Workflows</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 leading-relaxed">
            Master document editing, file compression, digital signatures, and privacy with step-by-step guides. Zero paywalls, zero server uploads, 100% free.
          </p>
        </div>

        <AdSlot format="horizontal" />

        {/* Featured Hero Article */}
        {BLOG_POSTS.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-transparent border-2 border-indigo-500/20 rounded-3xl p-6 sm:p-10 shadow-sm transition-all hover:border-indigo-500/40">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white">
                    Featured Guide
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold">
                    {BLOG_POSTS[0].readTime} • Updated {BLOG_POSTS[0].updatedAt}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white hover:text-primary-600 transition-colors">
                  <Link href={`/blog/${BLOG_POSTS[0].slug}/`}>
                    {BLOG_POSTS[0].title}
                  </Link>
                </h2>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  {BLOG_POSTS[0].excerpt}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/blog/${BLOG_POSTS[0].slug}/`}
                    className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
                  >
                    <span>Read Full Guide</span>
                    <span>→</span>
                  </Link>
                  <Link
                    href={BLOG_POSTS[0].targetToolUrl}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>⚡ Launch Free Tool</span>
                  </Link>
                </div>
              </div>

              <div className="w-full lg:w-72 shrink-0 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center text-3xl mx-auto">
                  🗜️
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Compress PDF Tool
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Shrink files up to 90% right now in your browser.
                </p>
                <Link
                  href="/tools/optimize-pdf/compress-pdf"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all block"
                >
                  Compress PDF Free
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Guides Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📖</span>
              <span>All Tutorials &amp; Comparison Guides ({BLOG_POSTS.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.slug}
                className="flex flex-col justify-between bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
                      {post.category}
                    </span>
                    <span className="text-gray-400 dark:text-slate-500">
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                    <Link href={`/blog/${post.slug}/`}>
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">
                    {post.publishedAt}
                  </span>
                  <Link
                    href={`/blog/${post.slug}/`}
                    className="font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                  >
                    <span>Read Tutorial</span>
                    <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Comparison Callout vs iLovePDF */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <span>👑</span>
            <span>Why ToolsVerse Beats Traditional PDF Converters</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            100% Free, Unlimited &amp; Zero Server Uploads
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Unlike iLovePDF and Smallpdf which lock batch processing, OCR, and large files behind monthly subscriptions, ToolsVerse runs directly in your browser. No file queues, no signups, and your data stays 100% on your device.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="px-8 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 inline-block"
            >
              Explore All 103+ Free Tools →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
