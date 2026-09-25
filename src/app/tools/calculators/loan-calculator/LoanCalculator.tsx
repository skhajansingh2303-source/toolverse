'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState('250000');
  const [interestRate, setInterestRate] = useState('6.5');
  const [years, setYears] = useState('30');

  const loanResults = useMemo(() => {
    const P = parseFloat(principal);
    const annualRate = parseFloat(interestRate);
    const totalYears = parseFloat(years);

    if (isNaN(P) || isNaN(annualRate) || isNaN(totalYears) || P <= 0 || totalYears <= 0) {
      return {
        monthlyPayment: '0',
        totalPayment: '0',
        totalInterest: '0',
        schedule: [],
      };
    }

    const r = annualRate / 100 / 12;
    const n = totalYears * 12;

    let emi = 0;
    if (annualRate === 0) {
      emi = P / n;
    } else {
      emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPay = emi * n;
    const totalInt = totalPay - P;

    // Build yearly breakdown
    const schedule: { year: number; principalPaid: number; interestPaid: number; balance: number }[] = [];
    let balance = P;

    for (let yr = 1; yr <= Math.min(totalYears, 30); yr++) {
      let yrPrincipal = 0;
      let yrInterest = 0;
      for (let m = 0; m < 12; m++) {
        const monthlyInt = balance * r;
        const monthlyPrinc = emi - monthlyInt;
        yrInterest += monthlyInt;
        yrPrincipal += monthlyPrinc;
        balance -= monthlyPrinc;
        if (balance < 0) balance = 0;
      }
      schedule.push({
        year: yr,
        principalPaid: Math.round(yrPrincipal),
        interestPaid: Math.round(yrInterest),
        balance: Math.round(balance),
      });
    }

    return {
      monthlyPayment: emi.toFixed(2),
      totalPayment: totalPay.toFixed(2),
      totalInterest: totalInt.toFixed(2),
      schedule,
    };
  }, [principal, interestRate, years]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-600">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Loan &amp; Mortgage Calculator</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              🏦
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              Loan &amp; Mortgage EMI Calculator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Calculate your monthly repayment, total interest cost, and visual annual amortization schedule.
          </p>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Input Parameters & Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left Inputs */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Loan Principal Amount ($)
            </label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-2xl p-3 text-lg font-bold outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-slate-200 mb-2">
              <span className="uppercase tracking-wider">Annual Interest Rate</span>
              <span className="text-emerald-700 dark:text-emerald-300 font-mono bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                {interestRate}%
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Loan Term (Years)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['10', '15', '20', '30'].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setYears(yr)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    years === yr
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {yr} Yrs
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output Cards */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl text-center">
              <span className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                Monthly EMI
              </span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                ${loanResults.monthlyPayment}
              </span>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-2xl text-center">
              <span className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Total Interest
              </span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ${loanResults.totalInterest}
              </span>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-2xl text-center">
              <span className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Total Payment
              </span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ${loanResults.totalPayment}
              </span>
            </div>
          </div>

          {/* Yearly Amortization Table */}
          <div className="overflow-x-auto max-h-56 divide-y divide-gray-100 dark:divide-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800/60 text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400 sticky top-0">
                <tr>
                  <th className="p-2.5">Year</th>
                  <th className="p-2.5">Principal Paid</th>
                  <th className="p-2.5">Interest Paid</th>
                  <th className="p-2.5">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-200">
                {loanResults.schedule.map((row) => (
                  <tr key={row.year} className="hover:bg-gray-50">
                    <td className="p-2.5 font-bold">{row.year}</td>
                    <td className="p-2.5 text-emerald-600">${row.principalPaid.toLocaleString()}</td>
                    <td className="p-2.5 text-rose-600">${row.interestPaid.toLocaleString()}</td>
                    <td className="p-2.5 font-mono">${row.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
