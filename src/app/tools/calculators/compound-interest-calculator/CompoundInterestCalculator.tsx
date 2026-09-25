'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function CompoundInterestCalculator() {
  const [currency, setCurrency] = useState('$');
  const [principal, setPrincipal] = useState('10000');
  const [monthlyAddition, setMonthlyAddition] = useState('200');
  const [rate, setRate] = useState('8');
  const [years, setYears] = useState('10');
  const [compoundFrequency, setCompoundFrequency] = useState('12'); // 1, 2, 4, 12, 365

  const results = useMemo(() => {
    const P = parseFloat(principal) || 0;
    const PMT = parseFloat(monthlyAddition) || 0;
    const annualRate = (parseFloat(rate) || 0) / 100;
    const t = parseFloat(years) || 0;
    const n = parseFloat(compoundFrequency) || 12;

    if (P <= 0 || annualRate <= 0 || t <= 0) {
      return {
        futureValue: 0,
        totalDeposits: 0,
        totalInterest: 0,
        schedule: [],
      };
    }

    // Future Value of Initial Principal: P * (1 + r/n)^(n*t)
    // Future Value of Series of Monthly Contributions compounded n times per year
    let balance = P;
    let totalInvested = P;

    const schedule: { year: number; deposits: number; interest: number; balance: number }[] = [];

    for (let yr = 1; yr <= Math.min(t, 40); yr++) {
      let yrInterest = 0;
      for (let m = 1; m <= 12; m++) {
        // Add monthly contribution
        balance += PMT;
        totalInvested += PMT;

        // Apply compounding rate monthly equivalent
        const effectiveMonthlyRate = Math.pow(1 + annualRate / n, n / 12) - 1;
        const interestEarned = balance * effectiveMonthlyRate;
        balance += interestEarned;
        yrInterest += interestEarned;
      }

      schedule.push({
        year: yr,
        deposits: Math.round(totalInvested),
        interest: Math.round(balance - totalInvested),
        balance: Math.round(balance),
      });
    }

    const finalFutureValue = balance;
    const finalTotalInterest = finalFutureValue - totalInvested;

    return {
      futureValue: Math.round(finalFutureValue),
      totalDeposits: Math.round(totalInvested),
      totalInterest: Math.round(finalTotalInterest),
      schedule,
    };
  }, [principal, monthlyAddition, rate, years, compoundFrequency]);

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(val);
  };

  const depositPercent = results.futureValue > 0
    ? Math.round((results.totalDeposits / results.futureValue) * 100)
    : 50;
  const interestPercent = 100 - depositPercent;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-700">/</span>
        <Link href="/tools/calculators/" className="hover:text-primary-600 transition-colors">Calculators</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-700">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Compound Interest Calculator</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xl shadow-sm">
              💹
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Compound Interest Calculator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Simulate the exponential power of compounding interest with regular contributions and flexible compounding frequencies.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
          >
            <option value="$">$ (USD)</option>
            <option value="₹">₹ (INR)</option>
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
          {/* Initial Principal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Initial Principal Balance
              </label>
              <div className="flex items-center text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                <span>{currency}</span>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-24 ml-1 bg-transparent text-right font-black outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="1000"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="w-full accent-emerald-600 h-2 bg-gray-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Monthly Addition */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Monthly Contribution
              </label>
              <div className="flex items-center text-xs font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-lg">
                <span>{currency}</span>
                <input
                  type="number"
                  value={monthlyAddition}
                  onChange={(e) => setMonthlyAddition(e.target.value)}
                  className="w-20 ml-1 bg-transparent text-right font-black outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={monthlyAddition}
              onChange={(e) => setMonthlyAddition(e.target.value)}
              className="w-full accent-primary-600 h-2 bg-gray-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Annual Interest Rate
              </label>
              <div className="flex items-center text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg">
                <input
                  type="number"
                  step="0.1"
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
              max="25"
              step="0.25"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full accent-indigo-600 h-2 bg-gray-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Years */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Investment Duration
              </label>
              <div className="flex items-center text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg">
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-12 text-right font-black outline-none bg-transparent"
                />
                <span className="ml-1">Years</span>
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
          </div>

          {/* Compounding Frequency */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">
              Compounding Interval
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              {[
                { label: 'Annually', val: '1' },
                { label: 'Quarterly', val: '4' },
                { label: 'Monthly', val: '12' },
                { label: 'Daily', val: '365' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setCompoundFrequency(item.val)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    compoundFrequency === item.val
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
                      : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40 text-gray-600 dark:text-slate-400 hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Total Wealth Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-800/40 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">
                Future Investment Balance
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                {years} Years @ {rate}% p.a.
              </span>
            </div>

            <div className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6">
              {currency}{formatNumber(results.futureValue)}
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Total Principal &amp; Deposits</span>
                <span className="text-lg sm:text-xl font-bold text-slate-200">
                  {currency}{formatNumber(results.totalDeposits)}
                </span>
              </div>
              <div>
                <span className="text-xs text-emerald-400 block mb-1">Total Compound Interest</span>
                <span className="text-lg sm:text-xl font-bold text-emerald-400">
                  +{currency}{formatNumber(results.totalInterest)}
                </span>
              </div>
            </div>

            {/* Proportion Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Deposits: {depositPercent}%</span>
                <span className="text-emerald-300">Interest Earned: {interestPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${depositPercent}%` }}
                />
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${interestPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase block mb-1">Return on Investment</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {results.totalDeposits > 0 ? ((results.totalInterest / results.totalDeposits) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase block mb-1">Compounding Rate</span>
              <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                {compoundFrequency === '365' ? 'Daily' : compoundFrequency === '12' ? 'Monthly' : compoundFrequency === '4' ? 'Quarterly' : 'Annually'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase block mb-1">Total Multiplier</span>
              <span className="text-base font-black text-gray-900 dark:text-white">
                {(results.futureValue / (results.totalDeposits || 1)).toFixed(2)}x
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Schedule Table */}
      {results.schedule.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs my-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Amortization &amp; Accrual
              </span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                Annual Compounding Growth Schedule
              </h3>
            </div>
            <span className="text-xs text-gray-500 dark:text-slate-400">
              Yearly breakdown of interest reinvested
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-400 uppercase text-[10px] font-extrabold">
                  <th className="pb-3">Year</th>
                  <th className="pb-3">Total Deposited</th>
                  <th className="pb-3">Accumulated Interest</th>
                  <th className="pb-3 text-right">Ending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 font-mono">
                {results.schedule.map((row) => (
                  <tr key={row.year} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 font-bold text-gray-900 dark:text-white font-sans">Year {row.year}</td>
                    <td className="py-2.5 text-gray-600 dark:text-slate-400">{currency}{formatNumber(row.deposits)}</td>
                    <td className="py-2.5 text-emerald-600 dark:text-emerald-400">+{currency}{formatNumber(row.interest)}</td>
                    <td className="py-2.5 text-right font-black text-gray-900 dark:text-white">{currency}{formatNumber(row.balance)}</td>
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
