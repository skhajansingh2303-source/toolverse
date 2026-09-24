'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function SipCalculator() {
  const [investmentType, setInvestmentType] = useState<'sip' | 'lumpsum'>('sip');
  const [currency, setCurrency] = useState('₹');
  const [amount, setAmount] = useState('5000');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('10');
  const [adjustInflation, setAdjustInflation] = useState(false);
  const [inflationRate, setInflationRate] = useState('6');

  const calculation = useMemo(() => {
    const P = parseFloat(amount) || 0;
    const annualRate = parseFloat(rate) || 0;
    const totalYears = parseFloat(years) || 0;
    const inf = adjustInflation ? parseFloat(inflationRate) || 0 : 0;

    if (P <= 0 || annualRate <= 0 || totalYears <= 0) {
      return {
        investedAmount: 0,
        estimatedReturns: 0,
        totalValue: 0,
        realValue: 0,
        yearlyBreakdown: [],
      };
    }

    const nMonths = totalYears * 12;
    const monthlyRate = annualRate / 100 / 12;

    let invested = 0;
    let maturity = 0;

    if (investmentType === 'sip') {
      invested = P * nMonths;
      // Formula: M = P * [((1 + i)^n - 1) / i] * (1 + i)
      maturity = P * ((Math.pow(1 + monthlyRate, nMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    } else {
      invested = P;
      // Lumpsum: M = P * (1 + r)^n
      maturity = P * Math.pow(1 + annualRate / 100, totalYears);
    }

    const returns = maturity - invested;
    // Inflation adjusted real purchasing power
    const realPurchasingPower = maturity / Math.pow(1 + inf / 100, totalYears);

    // Yearly schedule
    const yearlyBreakdown: {
      year: number;
      invested: number;
      value: number;
      gain: number;
    }[] = [];

    for (let yr = 1; yr <= Math.min(totalYears, 40); yr++) {
      let yrInvested = 0;
      let yrValue = 0;

      if (investmentType === 'sip') {
        const mCount = yr * 12;
        yrInvested = P * mCount;
        yrValue = P * ((Math.pow(1 + monthlyRate, mCount) - 1) / monthlyRate) * (1 + monthlyRate);
      } else {
        yrInvested = P;
        yrValue = P * Math.pow(1 + annualRate / 100, yr);
      }

      yearlyBreakdown.push({
        year: yr,
        invested: Math.round(yrInvested),
        value: Math.round(yrValue),
        gain: Math.round(yrValue - yrInvested),
      });
    }

    return {
      investedAmount: Math.round(invested),
      estimatedReturns: Math.round(returns),
      totalValue: Math.round(maturity),
      realValue: Math.round(realPurchasingPower),
      yearlyBreakdown,
    };
  }, [investmentType, amount, rate, years, adjustInflation, inflationRate]);

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val);
  };

  const investedPercent = calculation.totalValue > 0
    ? Math.round((calculation.investedAmount / calculation.totalValue) * 100)
    : 50;
  const returnPercent = 100 - investedPercent;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-700">/</span>
        <Link href="/tools/calculators/" className="hover:text-primary-600 transition-colors">Calculators</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-700">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">SIP Calculator</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-600 flex items-center justify-center text-white text-xl shadow-sm">
              📈
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              SIP &amp; Mutual Fund Calculator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Calculate your mutual fund returns, future wealth accumulation, and compound growth for monthly SIPs or lumpsum investments.
          </p>
        </div>

        {/* Currency & Type Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setInvestmentType('sip')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                investmentType === 'sip'
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly SIP
            </button>
            <button
              onClick={() => setInvestmentType('lumpsum')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                investmentType === 'lumpsum'
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Lumpsum
            </button>
          </div>

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
          >
            <option value="₹">₹ (INR)</option>
            <option value="$">$ (USD)</option>
            <option value="€">€ (EUR)</option>
            <option value="£">£ (GBP)</option>
            <option value="¥">¥ (JPY)</option>
          </select>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
        {/* Left Inputs */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Investment Amount */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                {investmentType === 'sip' ? 'Monthly Investment' : 'Total Investment'}
              </label>
              <div className="flex items-center text-xs font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-lg">
                <span>{currency}</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-24 ml-1 bg-transparent text-right font-black outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min={investmentType === 'sip' ? 500 : 5000}
              max={investmentType === 'sip' ? 100000 : 2000000}
              step={investmentType === 'sip' ? 500 : 5000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full accent-primary-600 h-2 bg-gray-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>{currency}{investmentType === 'sip' ? '500' : '5,000'}</span>
              <span>{currency}{investmentType === 'sip' ? '1,00,000' : '20,00,000'}</span>
            </div>
          </div>

          {/* Expected Return Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Expected Annual Return Rate (p.a)
              </label>
              <div className="flex items-center text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                <input
                  type="number"
                  step="0.5"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-14 text-right font-black outline-none bg-transparent"
                />
                <span className="ml-1">%</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full accent-emerald-600 h-2 bg-gray-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>1% (Conservative)</span>
              <span>12% (Equity MF)</span>
              <span>30% (Aggressive)</span>
            </div>
          </div>

          {/* Time Period */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Time Horizon
              </label>
              <div className="flex items-center text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg">
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-12 text-right font-black outline-none bg-transparent"
                />
                <span className="ml-1">Yr</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full accent-purple-600 h-2 bg-gray-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>1 Year</span>
              <span>20 Years</span>
              <span>40 Years</span>
            </div>
          </div>

          {/* Inflation Adjuster Toggle */}
          <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Adjust for Inflation (Real Value)
              </span>
              <input
                type="checkbox"
                checked={adjustInflation}
                onChange={(e) => setAdjustInflation(e.target.checked)}
                className="w-4 h-4 rounded-sm text-primary-600 focus:ring-primary-500 accent-primary-600"
              />
            </label>
            {adjustInflation && (
              <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
                <span className="text-xs text-gray-500 dark:text-slate-400">Assumed Annual Inflation:</span>
                <div className="flex items-center text-xs font-bold text-gray-900 dark:text-white">
                  <input
                    type="number"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(e.target.value)}
                    className="w-12 text-right font-bold outline-none bg-transparent"
                  />
                  <span>%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Output Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Total Wealth Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">
                Projected Total Wealth
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                {years} Years Horizon
              </span>
            </div>

            <div className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6">
              {currency}{formatNumber(calculation.totalValue)}
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Total Invested</span>
                <span className="text-lg sm:text-xl font-bold text-slate-200">
                  {currency}{formatNumber(calculation.investedAmount)}
                </span>
              </div>
              <div>
                <span className="text-xs text-emerald-400 block mb-1">Est. Wealth Gain</span>
                <span className="text-lg sm:text-xl font-bold text-emerald-400">
                  +{currency}{formatNumber(calculation.estimatedReturns)}
                </span>
              </div>
            </div>

            {adjustInflation && (
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Inflation-Adjusted Purchasing Power:</span>
                <span className="font-bold text-amber-300">{currency}{formatNumber(calculation.realValue)}</span>
              </div>
            )}

            {/* Proportion Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-indigo-200">Invested: {investedPercent}%</span>
                <span className="text-emerald-300">Gains: {returnPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${investedPercent}%` }}
                />
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${returnPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Insights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Growth Multiplier</span>
              <span className="text-base font-black text-gray-900 dark:text-white">
                {(calculation.totalValue / (calculation.investedAmount || 1)).toFixed(2)}x
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Monthly Gain Rate</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {(parseFloat(rate) / 12).toFixed(2)}% / mo
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Compounding Magic</span>
              <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                {returnPercent > 50 ? 'Gains exceed Capital' : 'Accumulation Phase'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Schedule Table */}
      {calculation.yearlyBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs my-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                Compounding Schedule
              </span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                Year-by-Year Growth Table
              </h3>
            </div>
            <span className="text-xs text-gray-500 dark:text-slate-400">
              Shows capital vs accumulated interest
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase text-[10px] font-extrabold">
                  <th className="pb-3">Year</th>
                  <th className="pb-3">Invested Capital</th>
                  <th className="pb-3">Accumulated Gains</th>
                  <th className="pb-3 text-right">Future Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 font-mono">
                {calculation.yearlyBreakdown.map((row) => (
                  <tr key={row.year} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 font-bold text-gray-900 dark:text-white font-sans">Year {row.year}</td>
                    <td className="py-2.5 text-gray-600 dark:text-slate-400">{currency}{formatNumber(row.invested)}</td>
                    <td className="py-2.5 text-emerald-600 dark:text-emerald-400">+{currency}{formatNumber(row.gain)}</td>
                    <td className="py-2.5 text-right font-black text-gray-900 dark:text-white">{currency}{formatNumber(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
