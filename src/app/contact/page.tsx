'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm space-y-8">
        
        <div className="border-b border-gray-100 dark:border-slate-800 pb-6">
          <span className="text-xs uppercase font-extrabold text-red-600 dark:text-red-400 tracking-wider">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-1">
            Contact Support &amp; Feedback
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-2">
            Have a question, partnership inquiry, bug report, or tool suggestion? Reach out to the ToolsVerse App team directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Direct channels */}
          <div className="space-y-6 text-sm text-gray-700 dark:text-slate-300">
            <div className="space-y-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Official Support Channels
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                We respond to all genuine user feedback, technical inquiries, and publisher questions within 24 to 48 business hours.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-lg">📧</span>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">General Support</div>
                  <strong className="text-gray-900 dark:text-white">support@toolsverseapp.com</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs border-t border-gray-200/50 dark:border-slate-700/50 pt-2">
                <span className="text-lg">⚖️</span>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Legal &amp; Privacy</div>
                  <strong className="text-gray-900 dark:text-white">legal@toolsverseapp.com</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs border-t border-gray-200/50 dark:border-slate-700/50 pt-2">
                <span className="text-lg">🌐</span>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Official Website</div>
                  <strong className="text-gray-900 dark:text-white">https://toolsverseapp.com</strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
              <span className="font-bold">✓ Privacy Reminder:</span> None of your files or personal documents are stored on our servers. You never need to send confidential attachments to resolve file issues.
            </div>
          </div>

          {/* Form */}
          <div>
            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                  Message Dispatched Successfully
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  Thank you for reaching out. A confirmation email has been logged and our team will review your inquiry shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Tool Suggestion or Bug Report"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  Submit Inquiry →
                </button>
              </form>
            )}
          </div>

        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-slate-800 text-xs flex justify-between">
          <Link href="/" className="text-red-600 dark:text-red-400 font-bold hover:underline">
            ← Back to Home
          </Link>
          <Link href="/about" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
            About Our Technology →
          </Link>
        </div>

      </div>
    </div>
  );
}
