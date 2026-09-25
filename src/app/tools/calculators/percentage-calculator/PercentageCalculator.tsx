'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function PercentageCalculator() {
  // Card 1: What is P% of X?
  const [c1P, setC1P] = useState('15');
  const [c1X, setC1X] = useState('200');

  // Card 2: X is what % of Y?
  const [c2X, setC2X] = useState('25');
  const [c2Y, setC2Y] = useState('100');

  // Card 3: % Increase / Decrease from X to Y
  const [c3X, setC3X] = useState('50');
  const [c3Y, setC3Y] = useState('75');

  // Card 4: Price after discount
  const [c4Price, setC4Price] = useState('120');
  const [c4Discount, setC4Discount] = useState('20');

  // Calculations
  const r1 = (() => {
    const p = parseFloat(c1P);
    const x = parseFloat(c1X);
    if (isNaN(p) || isNaN(x)) return '0';
    return ((p / 100) * x).toFixed(2);
  })();

  const r2 = (() => {
    const x = parseFloat(c2X);
    const y = parseFloat(c2Y);
    if (isNaN(x) || isNaN(y) || y === 0) return '0%';
    return ((x / y) * 100).toFixed(2) + '%';
  })();

  const r3 = (() => {
    const x = parseFloat(c3X);
    const y = parseFloat(c3Y);
    if (isNaN(x) || isNaN(y) || x === 0) return '0%';
    const diff = ((y - x) / x) * 100;
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toFixed(2)}%`;
  })();

  const r4 = (() => {
    const price = parseFloat(c4Price);
    const disc = parseFloat(c4Discount);
    if (isNaN(price) || isNaN(disc)) return { final: '0', saved: '0' };
    const saved = (disc / 100) * price;
    const final = price - saved;
    return { final: final.toFixed(2), saved: saved.toFixed(2) };
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-600">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Percentage Calculator</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              %
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              Percentage Calculator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Instant calculation for percentages, markups, discounts, and percentage difference.
          </p>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Grid of 4 common calculators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-purple-600 tracking-wider block mb-2">
              Percentage of a Value
            </span>
            <h3 className="text-base font-bold text-gray-900 mb-4">
              What is P% of X?
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span>What is</span>
              <input
                type="number"
                value={c1P}
                onChange={(e) => setC1P(e.target.value)}
                className="w-20 bg-gray-50 border border-gray-200 rounded-xl p-2 font-bold text-gray-900 text-center outline-none"
              />
              <span>% of</span>
              <input
                type="number"
                value={c1X}
                onChange={(e) => setC1X(e.target.value)}
                className="w-24 bg-gray-50 border border-gray-200 rounded-xl p-2 font-bold text-gray-900 text-center outline-none"
              />
              <span>?</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Result:</span>
            <span className="text-2xl font-black text-purple-600">{r1}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-purple-600 tracking-wider block mb-2">
              Proportion Fraction
            </span>
            <h3 className="text-base font-bold text-gray-900 mb-4">
              X is what percent of Y?
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="number"
                value={c2X}
                onChange={(e) => setC2X(e.target.value)}
                className="w-24 bg-gray-50 border border-gray-200 rounded-xl p-2 font-bold text-gray-900 text-center outline-none"
              />
              <span>is what % of</span>
              <input
                type="number"
                value={c2Y}
                onChange={(e) => setC2Y(e.target.value)}
                className="w-24 bg-gray-50 border border-gray-200 rounded-xl p-2 font-bold text-gray-900 text-center outline-none"
              />
              <span>?</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Result:</span>
            <span className="text-2xl font-black text-purple-600">{r2}</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-purple-600 tracking-wider block mb-2">
              Growth &amp; Reduction
            </span>
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Percentage Change from X to Y
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span>From</span>
              <input
                type="number"
                value={c3X}
                onChange={(e) => setC3X(e.target.value)}
                className="w-24 bg-gray-50 border border-gray-200 rounded-xl p-2 font-bold text-gray-900 text-center outline-none"
              />
              <span>to</span>
              <input
                type="number"
                value={c3Y}
                onChange={(e) => setC3Y(e.target.value)}
                className="w-24 bg-gray-50 border border-gray-200 rounded-xl p-2 font-bold text-gray-900 text-center outline-none"
              />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Difference:</span>
            <span className={`text-2xl font-black ${r3.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
              {r3}
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-purple-600 tracking-wider block mb-2">
              Shopping &amp; Retail
            </span>
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Price after Discount
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span>Price $</span>
              <input
                type="number"
                value={c4Price}
                onChange={(e) => setC4Price(e.target.value)}
                className="w-24 bg-gray-50 border border-gray-200 rounded-xl p-2 font-bold text-gray-900 text-center outline-none"
              />
              <span>with</span>
              <input
                type="number"
                value={c4Discount}
                onChange={(e) => setC4Discount(e.target.value)}
                className="w-20 bg-gray-50 border border-gray-200 rounded-xl p-2 font-bold text-gray-900 text-center outline-none"
              />
              <span>% off</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">You save ${r4.saved}</span>
            <span className="text-2xl font-black text-purple-600">${r4.final}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
