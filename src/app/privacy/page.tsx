import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - ToolsVerse App',
  description: 'Learn how ToolsVerse App protects your privacy with 100% in-browser, client-side document processing. Zero server uploads, zero logs, complete data ownership.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm">
        
        <div className="border-b border-gray-100 dark:border-slate-800 pb-6 mb-8">
          <span className="text-xs uppercase font-extrabold text-red-600 dark:text-red-400 tracking-wider">
            Legal &amp; Transparency
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-1">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
            Last Updated: September 2026 • Effective Immediately for toolsverseapp.com
          </p>
        </div>

        <div className="space-y-8 text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              1. Our Core Privacy Guarantee: 100% Client-Side Processing
            </h2>
            <p>
              ToolsVerse App (accessible at <strong className="text-gray-900 dark:text-white">https://toolsverseapp.com</strong>) was engineered from the ground up with privacy as its primary foundation. Unlike traditional cloud-based utilities and converters, <strong>ToolsVerse App does NOT upload, store, transmit, or inspect your documents, PDFs, images, code, or personal files on any remote server</strong>.
            </p>
            <p>
              All file processing, conversions, compression, splits, merges, watermarking, redactions, and calculations execute entirely inside your local web browser using WebAssembly, HTML5 Canvas, and modern browser APIs. When you close your browser tab, all temporary data in your device memory is automatically destroyed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              2. Information We Do NOT Collect
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600 dark:text-slate-400">
              <li>We do <strong>not</strong> collect or store your uploaded files, PDFs, spreadsheets, or images.</li>
              <li>We do <strong>not</strong> collect personal identifying information (PII) such as your name, social security number, or home address without your consent.</li>
              <li>We do <strong>not</strong> require user registration, passwords, or login accounts to access our tools.</li>
              <li>We do <strong>not</strong> sell, rent, trade, or monetize your personal files with data brokers or third parties.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              3. Local Storage &amp; Cookies
            </h2>
            <p>
              ToolsVerse App uses standard browser <code className="text-xs bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">localStorage</code> to remember your local preferences, specifically:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-slate-400">
              <li>Your chosen color theme (Light mode or Dark mode).</li>
              <li>Your selected interface language.</li>
              <li>Your favorite or recently visited tools for quick access.</li>
            </ul>
            <p className="text-xs text-gray-500">
              This data stays strictly on your physical device and is never transmitted to our servers. You may clear your browser cache or cookies at any time to remove this stored information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              4. Analytics &amp; Advertising Compliance (Google AdSense &amp; Partners)
            </h2>
            <p>
              To keep ToolsVerse App 100% free and accessible to students, educators, and professionals worldwide, we may display third-party advertisements (such as Google AdSense).
            </p>
            <p>
              Third-party vendors, including Google, use cookies (such as the DoubleClick cookie) to serve ads based on prior visits to this website or other websites on the internet. You may opt out of personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 underline">aboutads.info</a> or <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 underline">Google Ads Settings</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              5. GDPR &amp; CCPA Compliance
            </h2>
            <p>
              Under the European Union General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), users are entitled to transparency regarding data handling. Because ToolsVerse App does not transmit or store personal data on central servers, your files remain completely under your own physical custody and legal control at all times.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              6. Contact Information
            </h2>
            <p>
              If you have any questions, inquiries, or privacy concerns regarding this Privacy Policy, you may contact our compliance team directly at:
            </p>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-mono">
              Email: <strong className="text-gray-900 dark:text-white">support@toolsverseapp.com</strong><br />
              Website: <strong className="text-gray-900 dark:text-white">https://toolsverseapp.com</strong>
            </div>
          </section>

        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-xs">
          <Link href="/" className="text-red-600 dark:text-red-400 font-bold hover:underline">
            ← Back to ToolsVerse App Home
          </Link>
          <Link href="/terms" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
            View Terms of Service →
          </Link>
        </div>

      </div>
    </div>
  );
}
