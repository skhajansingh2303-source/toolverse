import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service - ToolsVerse App',
  description: 'Terms and conditions governing the use of ToolsVerse App and its 103+ in-browser productivity and file utilities.',
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm">
        
        <div className="border-b border-gray-100 dark:border-slate-800 pb-6 mb-8">
          <span className="text-xs uppercase font-extrabold text-red-600 dark:text-red-400 tracking-wider">
            Terms &amp; Conditions
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-1">
            Terms of Service
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
            Effective Date: September 2026 • ToolsVerse App (toolsverseapp.com)
          </p>
        </div>

        <div className="space-y-8 text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using ToolsVerse App (<strong className="text-gray-900 dark:text-white">https://toolsverseapp.com</strong>), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you should discontinue use of the website immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              2. Description of Service
            </h2>
            <p>
              ToolsVerse App provides an integrated suite of client-side document, image, PDF, code, and calculation utilities. These tools operate strictly within the user&apos;s browser environment. The services are provided completely free of charge for personal, academic, and commercial purposes without mandatory registration.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              3. User Responsibilities &amp; Intellectual Property
            </h2>
            <p>
              You retain 100% of all rights, title, and ownership over the documents, media, code, and files you process through ToolsVerse App. You agree not to use the services for any unlawful activities, malicious file injections, copyright infringement, or harassment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              4. Disclaimer of Warranties
            </h2>
            <p>
              ToolsVerse App and all utilities are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. While we employ high-precision libraries (such as pdf-lib and WebAssembly modules), ToolsVerse App makes no guarantee that file conversions will be 100% error-free or that corrupted files can always be recovered.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              5. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, ToolsVerse App, its developers, affiliates, and partners shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our browser utilities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              6. Changes to Terms
            </h2>
            <p>
              We reserve the right to revise or update these Terms of Service periodically. Any updates will be reflected directly on this page with an updated effective date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              7. Contact Us
            </h2>
            <p>
              For legal inquiries, copyright notices, or questions regarding these terms, reach us at:
            </p>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-mono">
              Email: <strong className="text-gray-900 dark:text-white">legal@toolsverseapp.com</strong>
            </div>
          </section>

        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-xs">
          <Link href="/" className="text-red-600 dark:text-red-400 font-bold hover:underline">
            ← Back to ToolsVerse App Home
          </Link>
          <Link href="/privacy" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
            View Privacy Policy →
          </Link>
        </div>

      </div>
    </div>
  );
}
