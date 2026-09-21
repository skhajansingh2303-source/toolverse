'use client';

import React from 'react';
import Link from 'next/link';
import { tools } from '@/lib/tools';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800/80">
          
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2.5 mb-4 group inline-flex">
              <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-black text-base tracking-tighter">TV</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white leading-none">
                  Tools<span className="text-primary-400">Verse</span>
                </span>
                <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mt-0.5">
                  {tools.length}-in-1 Suite
                </span>
              </div>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm mb-6">
              The all-in-one browser utility suite for students, teachers, developers, and professionals. Fast, free, and engineered with 100% in-browser client-side execution — your files and data never leave your device.
            </p>

            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Systems Operational</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 font-medium">
                <span>🔒</span>
                <span>Zero Server Uploads</span>
              </span>
            </div>
          </div>

          {/* Col 2: PDF Suite */}
          <div>
            <h3 className="text-xs uppercase font-extrabold text-white tracking-wider mb-4">
              PDF &amp; Documents
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/tools/merge-pdf" className="hover:text-primary-400 transition-colors">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/split-pdf" className="hover:text-primary-400 transition-colors">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/compress-pdf" className="hover:text-primary-400 transition-colors">
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/sign-pdf" className="hover:text-primary-400 transition-colors">
                  Sign PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/redact-pdf" className="hover:text-primary-400 transition-colors">
                  Redact PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/scan-to-pdf" className="hover:text-primary-400 transition-colors">
                  Scan to PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf-to-jpg" className="hover:text-primary-400 transition-colors">
                  PDF to JPG
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf-to-text" className="hover:text-primary-400 transition-colors">
                  PDF to Text
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Daily Life & Calculators */}
          <div>
            <h3 className="text-xs uppercase font-extrabold text-white tracking-wider mb-4">
              Calculators &amp; Daily Life
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/tools/age-calculator" className="hover:text-primary-400 transition-colors">
                  Age Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/bmi-calculator" className="hover:text-primary-400 transition-colors">
                  BMI Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/calorie-bmr-calculator" className="hover:text-primary-400 transition-colors">
                  Calorie &amp; BMR Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/gpa-calculator" className="hover:text-primary-400 transition-colors">
                  GPA Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/loan-calculator" className="hover:text-primary-400 transition-colors">
                  Loan EMI Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/percentage-calculator" className="hover:text-primary-400 transition-colors">
                  Percentage Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/unit-converter" className="hover:text-primary-400 transition-colors">
                  Unit Converter
                </Link>
              </li>
              <li>
                <Link href="/tools/resume-builder" className="hover:text-primary-400 transition-colors">
                  Resume Builder
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Developer & Media */}
          <div>
            <h3 className="text-xs uppercase font-extrabold text-white tracking-wider mb-4">
              Developer &amp; Design
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/tools/json-formatter" className="hover:text-primary-400 transition-colors">
                  JSON Formatter
                </Link>
              </li>
              <li>
                <Link href="/tools/qr-code-generator" className="hover:text-primary-400 transition-colors">
                  QR Code Generator
                </Link>
              </li>
              <li>
                <Link href="/tools/jwt-decoder" className="hover:text-primary-400 transition-colors">
                  JWT Decoder
                </Link>
              </li>
              <li>
                <Link href="/tools/image-compressor" className="hover:text-primary-400 transition-colors">
                  Image Compressor
                </Link>
              </li>
              <li>
                <Link href="/tools/image-color-picker" className="hover:text-primary-400 transition-colors">
                  Image Color Picker
                </Link>
              </li>
              <li>
                <Link href="/tools/color-palette-generator" className="hover:text-primary-400 transition-colors">
                  Color Palette Generator
                </Link>
              </li>
              <li>
                <Link href="/tools/hash-generator" className="hover:text-primary-400 transition-colors">
                  Hash Generator
                </Link>
              </li>
              <li>
                <Link href="/tools/word-counter" className="hover:text-primary-400 transition-colors">
                  Word Counter
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Guarantee Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} ToolsVerse App (toolsverseapp.com). All rights reserved. {tools.length} In-Browser Utilities.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/about" className="hover:text-red-400 transition-colors">
              About Us
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/contact" className="hover:text-red-400 transition-colors">
              Contact
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/privacy" className="hover:text-red-400 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/terms" className="hover:text-red-400 transition-colors">
              Terms of Service
            </Link>
            <span className="text-gray-700">•</span>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="hover:text-red-400 transition-colors font-semibold"
            >
              ↑ Back to Top
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
