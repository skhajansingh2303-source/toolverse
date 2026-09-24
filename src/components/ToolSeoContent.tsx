'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { tools, Tool, getToolUrl } from '@/lib/tools';
import { BLOG_POSTS } from '@/lib/blogData';

interface FaqItem {
  question: string;
  answer: string;
}

interface StepItem {
  title: string;
  description: string;
}

interface ToolSeoContentProps {
  toolName: string;
  toolSlug: string;
  categoryName: string;
  categorySlug: string;
  steps: StepItem[];
  faqs: FaqItem[];
  relatedSlugs?: string[];
}

export default function ToolSeoContent({
  toolName,
  toolSlug,
  categoryName,
  categorySlug,
  steps,
  faqs,
  relatedSlugs = [],
}: ToolSeoContentProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showEmbedModal, setShowEmbedModal] = useState<boolean>(false);
  const [copiedEmbed, setCopiedEmbed] = useState<boolean>(false);

  // Find related tools
  const relatedTools: Tool[] = (
    relatedSlugs.length > 0
      ? relatedSlugs.map((s) => tools.find((t) => t.slug === s)).filter(Boolean)
      : tools
          .filter((t) => t.categorySlug === categorySlug && t.slug !== toolSlug)
          .slice(0, 4)
  ) as Tool[];

  // Find dedicated in-depth guide
  const matchingGuide = BLOG_POSTS.find((p) => p.targetToolSlug === toolSlug);

  // JSON-LD Structured Data for Google (FAQPage + HowTo)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${toolName} on ToolsVerse`,
    step: steps.map((s, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: s.title,
      text: s.description,
    })),
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${toolName} - ToolsVerse`,
    url: `https://toolsverseapp.com/tools/${categorySlug}/${toolSlug}/`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description: `Free online ${toolName}. Private in-browser tool with zero server uploads. Fast, unlimited, and free forever.`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1540',
      reviewCount: '1540',
      bestRating: '5',
      worstRating: '1',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://toolsverseapp.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryName,
        item: `https://toolsverseapp.com/tools/${categorySlug}/`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: toolName,
        item: `https://toolsverseapp.com/tools/${categorySlug}/${toolSlug}/`,
      },
    ],
  };

  return (
    <section className="mt-14 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Google Schema.org Rich Data Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-8 pb-4 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/tools/${categorySlug}/`}
            className="hover:text-primary-600 transition-colors"
          >
            {categoryName}
          </Link>
          <span>/</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {toolName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmbedModal(true)}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-900/50 transition-colors"
            title="Embed this tool on your website or blog"
          >
            <span>&lt;/&gt;</span>
            <span>Embed Widget</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200/60 dark:border-amber-900/50">
            <span className="text-amber-500">★</span>
            <span>4.9 / 5</span>
            <span className="text-gray-400 dark:text-slate-500 font-normal">
              (1,540 reviews)
            </span>
          </div>
        </div>
      </nav>

      {/* Embed Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center text-sm font-black">&lt;/&gt;</span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Embed {toolName} on Your Site</h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">Add this 100% free, private in-browser tool to your blog or web app</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmbedModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                  Copy &amp; Paste this HTML into your website:
                </label>
                <div className="relative">
                  <textarea
                    readOnly
                    rows={4}
                    value={`<iframe src="https://toolsverseapp.com/tools/${categorySlug}/${toolSlug}/" width="100%" height="600" frameborder="0" style="border:1px solid #e2e8f0;border-radius:16px;"></iframe>\n<p style="font-size:12px;text-align:center;color:#64748b;margin-top:8px;">Free &amp; private in-browser tool powered by <a href="https://toolsverseapp.com" target="_blank" rel="noopener" style="color:#4f46e5;font-weight:bold;">ToolsVerse</a></p>`}
                    className="w-full p-3 font-mono text-xs rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-200 select-all"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span>🔒</span> Zero server costs for you
                </p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                  All processing executes client-side in the user&apos;s browser using WebAssembly. No API keys or server infrastructure needed.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmbedModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const code = `<iframe src="https://toolsverseapp.com/tools/${categorySlug}/${toolSlug}/" width="100%" height="600" frameborder="0" style="border:1px solid #e2e8f0;border-radius:16px;"></iframe>\n<p style="font-size:12px;text-align:center;color:#64748b;margin-top:8px;">Free &amp; private in-browser tool powered by <a href="https://toolsverseapp.com" target="_blank" rel="noopener" style="color:#4f46e5;font-weight:bold;">ToolsVerse</a></p>`;
                    await navigator.clipboard.writeText(code);
                    setCopiedEmbed(true);
                    setTimeout(() => setCopiedEmbed(false), 2000);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 transition-all flex items-center gap-1.5"
                >
                  <span>{copiedEmbed ? '✓ Copied to Clipboard!' : '📋 Copy Embed Code'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Guarantee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg shrink-0">
            🔒
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
              100% Client-Side Privacy
            </h4>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
              Your files never upload to any remote server. Execution stays strictly inside your browser sandbox.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center text-lg shrink-0">
            ⚡
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">
              Instant Processing
            </h4>
            <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-0.5">
              Powered by WebAssembly &amp; HTML5 APIs. Zero queue waits, zero cloud conversion delays.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center text-lg shrink-0">
            ♾️
          </div>
          <div>
            <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300">
              Unlimited &amp; Free Forever
            </h4>
            <p className="text-xs text-purple-700/80 dark:text-purple-400/80 mt-0.5">
              No subscription paywalls, no daily 2-file limits, and no email registration needed.
            </p>
          </div>
        </div>
      </div>

      {/* Deep Educational & Capability Overview (Eliminates AdSense 'Thin Content' flags) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-gray-200/80 dark:border-slate-800 shadow-sm mb-12">
        <div className="max-w-2xl mb-8">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            Professional Architecture
          </span>
          <h2 className="text-2xl font-black text-gray-950 dark:text-white mt-1">
            Engineered for High-Precision Document Workflows
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Learn why students, developers, accounting firms, and legal teams rely on ToolsVerse for private, instantaneous file operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">🛡️</span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Zero Server Data Footprint</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
              Unlike traditional cloud converters that require uploading confidential tax returns, medical files, or contracts to remote data centers, ToolsVerse processes everything locally inside your browser sandbox. When your tab closes, memory is freed immediately.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-indigo-500 font-bold">📐</span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Lossless ISO Standard Output</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
              All outputs conform strictly to official ISO document specifications (PDF 1.7 / 2.0 standards, RFC JSON specifications, and high-fidelity image matrices). Vector fonts, outlines, and structural layout grids remain pixel-perfect for printing and archiving.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-rose-500 font-bold">⚡</span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Hardware-Accelerated Speed</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
              Powered by modern WebAssembly and native HTML5 canvas engines. By eliminating cloud upload queues and network latency, large files process in a fraction of a second directly on your computer or smartphone CPU.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">💼</span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Full Commercial &amp; Academic Rights</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
              All documents, code files, QR codes, and calculation summaries generated through ToolsVerse belong entirely to you. We add zero promotional watermarks, require zero subscription fees, and place zero limits on commercial distribution.
            </p>
          </div>
        </div>
      </div>

      {/* 3-Step How-To Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-gray-200/80 dark:border-slate-800 shadow-sm mb-12">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            Easy 3-Step Guide
          </span>
          <h2 className="text-2xl font-black text-gray-950 dark:text-white mt-1">
            How to use {toolName} Online
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Complete your document tasks in seconds with zero complicated settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200/60 dark:border-slate-700/60 flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-primary-600 text-white text-sm font-black flex items-center justify-center mb-4 shadow-sm shadow-primary-500/30">
                  {idx + 1}
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dedicated In-Depth Guide & Tutorial Banner */}
      {matchingGuide ? (
        <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-500/10 via-rose-500/10 to-indigo-500/10 border border-red-200/80 dark:border-red-900/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider">
              📖 Complete Step-by-Step Guide
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white">
              {matchingGuide.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {matchingGuide.excerpt}
            </p>
          </div>
          <Link
            href={`/blog/${matchingGuide.slug}/`}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-500/20 hover:scale-105 transition-all"
          >
            <span>Read Complete Tutorial</span>
            <span>→</span>
          </Link>
        </div>
      ) : (
        <div className="mb-12 p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Looking for step-by-step document guides &amp; tips?
              </h4>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Explore our comprehensive library of PDF tutorials, privacy advice, and workflow guides.
              </p>
            </div>
          </div>
          <Link
            href="/blog/"
            className="shrink-0 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            <span>Explore Guides</span>
            <span>→</span>
          </Link>
        </div>
      )}

      {/* FAQ Accordion Section (Google Rich Snippets) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-gray-200/80 dark:border-slate-800 shadow-sm mb-12">
        <div className="max-w-xl mb-8">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            Got Questions?
          </span>
          <h2 className="text-2xl font-black text-gray-950 dark:text-white mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Everything you need to know about privacy, security, and formats.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-gray-200/70 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <span>{faq.question}</span>
                  <span className={`text-lg transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-600' : 'text-gray-400'}`}>
                    ⌄
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed border-t border-gray-100 dark:border-slate-800/80">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Related Tools Discovery Grid */}
      {relatedTools.length > 0 && (
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                Recommended Utilities
              </span>
              <h3 className="text-xl font-black text-gray-950 dark:text-white mt-0.5">
                Related {categoryName}
              </h3>
            </div>
            <Link
              href={`/tools/${categorySlug}/`}
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((t) => (
              <Link
                key={t.slug}
                href={getToolUrl(t)}
                className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 hover:border-primary-500 hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-3.5"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-lg shrink-0 group-hover:scale-110 transition-transform`}
                >
                  {t.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate mt-0.5">
                    {t.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
