'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function GstCalculator() {
  const [currency, setCurrency] = useState('₹');
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [amount, setAmount] = useState('10000');
  const [gstRate, setGstRate] = useState('18');
  const [isInterstate, setIsInterstate] = useState(false);

  const results = useMemo(() => {
    const inputVal = parseFloat(amount) || 0;
    const rate = parseFloat(gstRate) || 0;

    if (inputVal <= 0 || rate < 0) {
      return {
        netAmount: 0,
        gstAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        grossAmount: 0,
      };
    }

    let net = 0;
    let tax = 0;
    let gross = 0;

    if (mode === 'add') {
      // Adding GST: Input is Net
      net = inputVal;
      tax = (net * rate) / 100;
      gross = net + tax;
    } else {
      // Removing GST: Input is Gross (Inclusive)
      gross = inputVal;
      net = (gross * 100) / (100 + rate);
      tax = gross - net;
    }

    const halfTax = tax / 2;

    return {
      netAmount: Math.round(net * 100) / 100,
      gstAmount: Math.round(tax * 100) / 100,
      cgst: Math.round(halfTax * 100) / 100,
      sgst: Math.round(halfTax * 100) / 100,
      igst: Math.round(tax * 100) / 100,
      grossAmount: Math.round(gross * 100) / 100,
    };
  }, [amount, gstRate, mode]);

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  const PRESET_RATES = ['3', '5', '12', '18', '28'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-700">/</span>
        <Link href="/tools/calculators/" className="hover:text-primary-600 transition-colors">Calculators</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-700">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">GST Calculator</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl shadow-sm">
              🧾
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              GST &amp; Sales Tax Calculator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Quickly add or remove Goods and Services Tax (GST). Calculate CGST, SGST, IGST splits and net vs gross invoices in real time.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
          >
            <option value="₹">₹ (INR)</option>
            <option value="$">$ (USD)</option>
            <option value="€">€ (EUR)</option>
            <option value="£">£ (GBP)</option>
          </select>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
        {/* Left Inputs */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Add vs Remove Mode */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">
              Calculation Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('add')}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'add'
                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                + Add GST (Exclusive)
              </button>
              <button
                type="button"
                onClick={() => setMode('remove')}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'remove'
                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                - Remove GST (Inclusive)
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                {mode === 'add' ? 'Base Amount (Excluding Tax)' : 'Total Amount (Including Tax)'}
              </label>
              <div className="flex items-center text-xs font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-lg">
                <span>{currency}</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-28 ml-1 bg-transparent text-right font-black outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="100"
              max="200000"
              step="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full accent-primary-600 h-2 bg-gray-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* GST Slabs */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                GST Rate Slabs
              </label>
              <div className="flex items-center text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg">
                <input
                  type="number"
                  step="0.5"
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  className="w-12 text-right font-black outline-none bg-transparent"
                />
                <span className="ml-1">%</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-2">
              {PRESET_RATES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setGstRate(r)}
                  className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                    gstRate === r
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-xs'
                      : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40 text-gray-600 dark:text-slate-400 hover:border-gray-300'
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {/* Tax Jurisdiction Toggle */}
          <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Inter-State Transaction (IGST)
              </span>
              <input
                type="checkbox"
                checked={isInterstate}
                onChange={(e) => setIsInterstate(e.target.checked)}
                className="w-4 h-4 rounded-sm text-primary-600 focus:ring-primary-500 accent-primary-600"
              />
            </label>
            <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-1">
              {isInterstate ? 'Integrated GST (100% IGST)' : 'Intra-State split: 50% CGST + 50% SGST'}
            </p>
          </div>
        </div>

        {/* Right Output Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 text-white border border-amber-800/40 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
                Total Invoice Gross Amount
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                GST Rate: {gstRate}%
              </span>
            </div>

            <div className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6">
              {currency}{formatNumber(results.grossAmount)}
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Net (Base Amount)</span>
                <span className="text-lg sm:text-xl font-bold text-slate-200">
                  {currency}{formatNumber(results.netAmount)}
                </span>
              </div>
              <div>
                <span className="text-xs text-amber-400 block mb-1">Total GST Tax</span>
                <span className="text-lg sm:text-xl font-bold text-amber-400">
                  +{currency}{formatNumber(results.gstAmount)}
                </span>
              </div>
            </div>

            {/* CGST / SGST breakdown */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-xs font-semibold">
              {isInterstate ? (
                <div className="col-span-2 flex justify-between">
                  <span className="text-slate-400">IGST ({gstRate}%):</span>
                  <span className="text-amber-300 font-bold">{currency}{formatNumber(results.igst)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CGST ({(parseFloat(gstRate) / 2).toFixed(1)}%):</span>
                    <span className="text-amber-300 font-bold">{currency}{formatNumber(results.cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SGST ({(parseFloat(gstRate) / 2).toFixed(1)}%):</span>
                    <span className="text-amber-300 font-bold">{currency}{formatNumber(results.sgst)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Invoice Summary Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-3 font-mono text-xs">
            <h4 className="font-bold text-xs uppercase text-gray-400 dark:text-slate-400 tracking-wider font-sans mb-3">
              Tax Invoice Breakdown
            </h4>

            <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
              <span className="text-gray-500 dark:text-slate-400">Base Price (Taxable Value):</span>
              <span className="font-bold text-gray-900 dark:text-white">{currency}{formatNumber(results.netAmount)}</span>
            </div>

            {isInterstate ? (
              <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                <span className="text-gray-500 dark:text-slate-400">Integrated GST ({gstRate}%):</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">+{currency}{formatNumber(results.igst)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between pb-1">
                  <span className="text-gray-500 dark:text-slate-400">Central GST (CGST {(parseFloat(gstRate) / 2).toFixed(1)}%):</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">+{currency}{formatNumber(results.cgst)}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-gray-500 dark:text-slate-400">State GST (SGST {(parseFloat(gstRate) / 2).toFixed(1)}%):</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">+{currency}{formatNumber(results.sgst)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between pt-1 text-sm font-black font-sans text-gray-900 dark:text-white">
              <span>Final Payable Amount:</span>
              <span className="text-primary-600 dark:text-primary-400">{currency}{formatNumber(results.grossAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
