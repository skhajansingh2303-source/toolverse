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

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-8 pb-4 border-b border-gray-100 dark:border-slate-800">
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
      </nav>

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
