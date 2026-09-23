import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_POSTS, BlogPost } from '@/lib/blogData';
import AdSlot from '@/components/AdSlot';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) {
    return {
      title: 'Guide Not Found | ToolsVerse',
    };
  }

  const canonicalUrl = `https://toolsverseapp.com/blog/${post.slug}/`;

  return {
    title: `${post.seoTitle || post.title}`,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      siteName: 'ToolsVerse App',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  // Schema.org structured data
  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: 'ToolsVerse Editorial Team',
      url: 'https://toolsverseapp.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ToolsVerse App',
      logo: {
        '@type': 'ImageObject',
        url: 'https://toolsverseapp.com/icon.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://toolsverseapp.com/blog/${post.slug}/`,
    },
  };

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.content.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article className="min-h-screen bg-gray-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-gray-500 dark:text-slate-400 flex items-center space-x-2">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Blog &amp; Guides
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-semibold truncate max-w-xs sm:max-w-md">
            {post.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="space-y-4 pb-6 border-b border-gray-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
              {post.category}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold">
              ⏱️ {post.readTime}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400">
              Published on {post.publishedAt} • Last updated {post.updatedAt}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-3 pt-2 text-xs text-gray-500 dark:text-slate-400">
            <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              TV
            </span>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{post.author}</p>
              <p className="text-[11px]">Browser Productivity &amp; Document Security Specialist</p>
            </div>
          </div>
        </header>

        {/* Primary Interactive Tool CTA Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-primary-600 via-rose-600 to-indigo-600 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-lg font-black flex items-center justify-center sm:justify-start gap-2">
              <span>⚡</span>
              <span>Try {post.targetToolName} 100% Free</span>
            </h2>
            <p className="text-xs text-white/90">
              Process unlimited documents directly inside your browser with complete privacy.
            </p>
          </div>
          <Link
            href={post.targetToolUrl}
            className="px-6 py-3 bg-white text-primary-600 hover:bg-gray-100 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
          >
            Launch {post.targetToolName} Now →
          </Link>
        </div>

        <AdSlot format="horizontal" />

        {/* Table of Contents Box */}
        {post.tableOfContents && post.tableOfContents.length > 0 && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              📑 Table of Contents
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm font-semibold">
              {post.tableOfContents.map((item, idx) => (
                <li key={idx}>
                  <a
                    href={`#${item.id}`}
                    className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-2"
                  >
                    <span className="text-gray-400">{idx + 1}.</span>
                    <span>{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Article Body */}
        <div className="prose dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-slate-300">
          
          {/* Section: Intro */}
          <section id="why-compress" className="space-y-4">
            {post.content.introduction.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </section>

          {/* Section: Why Problem Exists */}
          {post.content.whyProblemExists && (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-2">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <span>💡</span>
                <span>The Core Challenge</span>
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed">
                {post.content.whyProblemExists}
              </p>
            </div>
          )}

          {/* Section: Step-by-Step Guide */}
          <section id="step-by-step" className="space-y-6 pt-4">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-2">
              Step-by-Step Guide
            </h2>

            <div className="space-y-4">
              {post.content.stepByStepGuide.map((stepItem) => (
                <div
                  key={stepItem.step}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {stepItem.step}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {stepItem.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm pl-11 text-gray-600 dark:text-slate-300">
                    {stepItem.description}
                  </p>
                  {stepItem.tip && (
                    <div className="ml-11 mt-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium">
                      💡 <strong>Pro Tip:</strong> {stepItem.tip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section: Head-to-Head Comparison Table */}
          {post.content.comparison && post.content.comparison.length > 0 && (
            <section id="comparison-table" className="space-y-4 pt-4">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-2">
                ToolsVerse vs iLovePDF vs Adobe Acrobat
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                See how ToolsVerse compares against commercial paid competitors in terms of features, limits, and privacy:
              </p>

              <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-3.5">Feature</th>
                      <th className="p-3.5 bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                        ⚡ ToolsVerse
                      </th>
                      <th className="p-3.5">iLovePDF</th>
                      <th className="p-3.5">Adobe Acrobat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                    {post.content.comparison.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-900/60">
                        <td className="p-3.5 font-bold text-gray-900 dark:text-white">{row.feature}</td>
                        <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 bg-primary-50/30 dark:bg-primary-950/20">
                          {row.toolsverse}
                        </td>
                        <td className="p-3.5 text-gray-600 dark:text-slate-400">{row.ilovepdf}</td>
                        <td className="p-3.5 text-gray-600 dark:text-slate-400">{row.adobe}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Section: Pro Tips */}
          {post.content.proTips && post.content.proTips.length > 0 && (
            <section id="pro-tips" className="space-y-4 pt-4">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-2">
                Expert Tips &amp; Best Practices
              </h2>
              <ul className="space-y-3">
                {post.content.proTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Section: FAQs */}
          {post.content.faqs && post.content.faqs.length > 0 && (
            <section id="frequently-asked-questions" className="space-y-4 pt-4">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-2">
                Frequently Asked Questions
              </h2>

              <div className="space-y-3">
                {post.content.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-2 shadow-2xs"
                  >
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                      {faq.question}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Bottom Tool CTA */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-primary-500/30 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center text-3xl mx-auto">
            🚀
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            Ready to Try {post.targetToolName}?
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto">
            Open the tool directly in your browser. No registration, no watermarks, and completely free.
          </p>
          <div>
            <Link
              href={post.targetToolUrl}
              className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 inline-block"
            >
              Open {post.targetToolName} Now →
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        {otherPosts.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Related Productivity Guides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherPosts.map((op) => (
                <Link
                  key={op.slug}
                  href={`/blog/${op.slug}/`}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-primary-500 transition-colors space-y-2 block group"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                    {op.category}
                  </span>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-primary-600 line-clamp-2">
                    {op.title}
                  </h4>
                  <span className="text-[11px] text-gray-400 block">
                    {op.readTime}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </article>
  );
}
