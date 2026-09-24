'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function FdCalculator() {
  const [depositType, setDepositType] = useState<'fd' | 'rd'>('fd');
  const [currency, setCurrency] = useState('₹');
  const [amount, setAmount] = useState('100000');
  const [rate, setRate] = useState('7.25');
  const [years, setYears] = useState('5');
  const [months, setMonths] = useState('0');
  const [compounding, setCompounding] = useState<'quarterly' | 'monthly' | 'half_yearly' | 'annually'>('quarterly');
  const [isSeniorCitizen, setIsSeniorCitizen] = useState(false);

  // Effective interest rate including senior citizen bonus (+0.50%)
  const effectiveRate = useMemo(() => {
    const base = parseFloat(rate) || 0;
    return isSeniorCitizen ? base + 0.5 : base;
  }, [rate, isSeniorCitizen]);

  const calculation = useMemo(() => {
    const P = parseFloat(amount) || 0;
    const r = effectiveRate / 100;
    const yr = parseFloat(years) || 0;
    const mo = parseFloat(months) || 0;
    const totalYears = yr + mo / 12;
    const totalMonths = Math.round(totalYears * 12);

    if (P <= 0 || r <= 0 || totalYears <= 0) {
      return {
        totalInvested: 0,
        totalInterest: 0,
        maturityAmount: 0,
        effectiveYield: 0,
        schedule: [],
      };
    }

    let n = 4; // Quarterly standard
    if (compounding === 'monthly') n = 12;
    if (compounding === 'half_yearly') n = 2;
    if (compounding === 'annually') n = 1;

    let invested = 0;
    let maturity = 0;
    const schedule: { period: string; invested: number; interest: number; balance: number }[] = [];

    if (depositType === 'fd') {
      invested = P;
      // Formula: A = P * (1 + r/n)^(n*t)
      maturity = P * Math.pow(1 + r / n, n * totalYears);

      // Yearly progression table
      const fullYears = Math.ceil(totalYears);
      for (let t = 1; t <= fullYears; t++) {
        const timeFraction = Math.min(t, totalYears);
        const bal = P * Math.pow(1 + r / n, n * timeFraction);
        const intEarned = bal - P;
        schedule.push({
          period: `Year ${t}${t > totalYears ? ' (Maturity)' : ''}`,
          invested: P,
          interest: intEarned,
          balance: bal,
        });
      }
    } else {
      // Recurring Deposit (RD)
      // Standard Banking RD Formula (Indian & Global):
      // Monthly installment P deposited each month compounding quarterly
      invested = P * totalMonths;

      // RD compound interest calculation
      // Maturity = sum of M_i for each month i: P * (1 + r/n)^(n * (totalMonths - i + 1) / 12)
      let currentBalance = 0;
      for (let m = 1; m <= totalMonths; m++) {
        const remainingMonths = totalMonths - m + 1;
        const maturityOfInstallment = P * Math.pow(1 + r / n, n * (remainingMonths / 12));
        maturity += maturityOfInstallment;
      }

      // Yearly progression table for RD
      const fullYears = Math.ceil(totalYears);
      for (let y = 1; y <= fullYears; y++) {
        const monthsCompleted = Math.min(y * 12, totalMonths);
        const invSoFar = P * monthsCompleted;
        let balSoFar = 0;
        for (let m = 1; m <= monthsCompleted; m++) {
          const rem = monthsCompleted - m + 1;
          balSoFar += P * Math.pow(1 + r / n, n * (rem / 12));
        }
        schedule.push({
          period: `Year ${y}`,
          invested: invSoFar,
          interest: balSoFar - invSoFar,
          balance: balSoFar,
        });
      }
    }

    const totalInterest = maturity - invested;
    const effectiveYield = totalYears > 0 ? (totalInterest / invested / totalYears) * 100 : 0;

    return {
      totalInvested: Math.round(invested),
      totalInterest: Math.round(totalInterest),
      maturityAmount: Math.round(maturity),
      effectiveYield,
      schedule,
    };
  }, [depositType, amount, effectiveRate, years, months, compounding]);

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(val));
  };

  const investedPercent = calculation.maturityAmount > 0
    ? Math.round((calculation.totalInvested / calculation.maturityAmount) * 100)
    : 70;
  const interestPercent = 100 - investedPercent;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-700">/</span>
        <Link href="/tools/calculators/" className="hover:text-primary-600 transition-colors">Calculators</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-700">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">FD &amp; RD Calculator</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl shadow-sm">
              🏦
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Fixed Deposit (FD) &amp; RD Calculator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Calculate your Bank Fixed Deposit (FD) and Recurring Deposit (RD) maturity amount, interest income, and compounding yield.
          </p>
        </div>

        {/* Deposit Type Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-xl flex text-xs font-bold">
            <button
              onClick={() => {
                if (depositType === 'rd') setAmount('100000');
                setDepositType('fd');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                depositType === 'fd'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Fixed Deposit (FD)
            </button>
            <button
              onClick={() => {
                if (depositType === 'fd') setAmount('5000');
                setDepositType('rd');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                depositType === 'rd'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Recurring Deposit (RD)
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
            <option value="AED">AED</option>
          </select>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
        {/* Left Inputs */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Deposit Amount */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                {depositType === 'fd' ? 'Total FD Deposit Amount' : 'Monthly RD Installment'}
              </label>
              <div className="flex items-center text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg">
                <span>{currency}</span>
                <input
                  type="number"
                  min="500"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-24 text-right bg-transparent outline-none ml-1 font-bold text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <input
              type="range"
              min={depositType === 'fd' ? 10000 : 500}
              max={depositType === 'fd' ? 2000000 : 100000}
              step={depositType === 'fd' ? 10000 : 500}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-gray-400 mt-1">
              <span>{currency}{depositType === 'fd' ? '10 K' : '500'}</span>
              <span>{currency}{depositType === 'fd' ? '10 L' : '50 K'}</span>
              <span>{currency}{depositType === 'fd' ? '20 L' : '1 L'}</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Annual Interest Rate
              </label>
              <div className="flex items-center text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg">
                <input
                  type="number"
                  min="1"
                  max="15"
                  step="0.05"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-14 text-right bg-transparent outline-none mr-1 font-bold text-gray-900 dark:text-white"
                />
                <span>% p.a.</span>
              </div>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-gray-400 mt-1">
              <span>3%</span>
              <span>7.5%</span>
              <span>12%</span>
            </div>
          </div>

          {/* Senior Citizen Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
            <div>
              <div className="text-xs font-bold text-blue-900 dark:text-blue-300">
                Senior Citizen (+0.50% Extra)
              </div>
              <div className="text-[11px] text-blue-700/80 dark:text-blue-400">
                Effective rate becomes <span className="font-bold">{effectiveRate.toFixed(2)}%</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isSeniorCitizen}
              onChange={(e) => setIsSeniorCitizen(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Tenure (Years & Months) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                Tenure (Years)
              </label>
              <input
                type="number"
                min="0"
                max="25"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                Tenure (Months)
              </label>
              <input
                type="number"
                min="0"
                max="11"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Compounding Frequency */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">
              Compounding Frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Quarterly (Standard)', val: 'quarterly' },
                { label: 'Monthly', val: 'monthly' },
                { label: 'Half-Yearly', val: 'half_yearly' },
                { label: 'Annually', val: 'annually' },
              ].map((c) => (
                <button
                  key={c.val}
                  type="button"
                  onClick={() => setCompounding(c.val as any)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all ${
                    compounding === c.val
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Hero Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="inline-block text-xs uppercase tracking-wider font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-blue-100 mb-2">
                  Total Maturity Value
                </span>
                <div className="text-3xl sm:text-5xl font-black tracking-tight">
                  {currency}{formatNumber(calculation.maturityAmount)}
                </div>
                <div className="text-xs sm:text-sm text-blue-100 mt-1">
                  At {effectiveRate.toFixed(2)}% per annum
                </div>
              </div>

              <div className="sm:text-right bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
                <div className="text-xs text-blue-100 font-medium">Effective Annual Yield</div>
                <div className="text-2xl font-black">{calculation.effectiveYield.toFixed(2)}%</div>
                <div className="text-[11px] text-blue-100/80">Simple return equivalent</div>
              </div>
            </div>

            {/* Visual Balance Bar */}
            <div className="relative z-10 mt-6 pt-6 border-t border-white/20">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Principal vs Interest Gains</span>
                <span>{interestPercent}% Interest</span>
              </div>
              <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${investedPercent}%` }}
                  className="bg-blue-300 transition-all duration-500"
                  title={`Principal: ${investedPercent}%`}
                />
                <div
                  style={{ width: `${interestPercent}%` }}
                  className="bg-emerald-400 transition-all duration-500"
                  title={`Interest: ${interestPercent}%`}
                />
              </div>
              <div className="flex gap-6 text-[11px] mt-2 text-blue-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-300 inline-block" />
                  Principal Invested ({investedPercent}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                  Total Interest Earned ({interestPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 block mb-1">
                Total Principal Invested
              </span>
              <div className="text-2xl font-black text-gray-900 dark:text-white">
                {currency}{formatNumber(calculation.totalInvested)}
              </div>
              <span className="text-[11px] text-gray-400 block mt-0.5">
                {depositType === 'fd' ? 'One-time lump sum' : `Monthly installments`}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 block mb-1">
                Total Interest Earned
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                +{currency}{formatNumber(calculation.totalInterest)}
              </div>
              <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 block mt-0.5">
                Guaranteed bank interest
              </span>
            </div>
          </div>

          {/* Progression Table */}
          {calculation.schedule.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs">
              <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Annual Growth &amp; Compounding Schedule</span>
                <span className="text-xs font-semibold text-gray-400">Yearly Balance</span>
              </h3>

              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="sticky top-0 bg-white dark:bg-slate-900">
                    <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 font-bold">
                      <th className="pb-2.5">Period</th>
                      <th className="pb-2.5 text-right">Principal</th>
                      <th className="pb-2.5 text-right">Interest Gained</th>
                      <th className="pb-2.5 text-right">Maturity Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 font-medium">
                    {calculation.schedule.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 text-gray-800 dark:text-slate-200 font-bold">{row.period}</td>
                        <td className="py-2.5 text-right text-gray-600 dark:text-slate-400">{currency}{formatNumber(row.invested)}</td>
                        <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold">+{currency}{formatNumber(row.interest)}</td>
                        <td className="py-2.5 text-right text-gray-900 dark:text-white font-bold">{currency}{formatNumber(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
