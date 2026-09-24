'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

type TaxMode = 'new_regime' | 'old_regime' | 'global_standard';

export default function SalaryCalculator() {
  const [currency, setCurrency] = useState('₹');
  const [salaryInputMode, setSalaryInputMode] = useState<'annual' | 'monthly'>('annual');
  const [grossInput, setGrossInput] = useState('1200000');
  const [taxMode, setTaxMode] = useState<TaxMode>('new_regime');

  // Deductions for Old Regime / Custom
  const [deduction80C, setDeduction80C] = useState('150000'); // PPF, ELSS, EPF
  const [deduction80D, setDeduction80D] = useState('25000'); // Health insurance
  const [hraExemption, setHraExemption] = useState('50000'); // Rent allowance
  const [otherDeductions, setOtherDeductions] = useState('0'); // NPS, interest, etc.

  // Retirement / PF contribution
  const [includeEPF, setIncludeEPF] = useState(true);
  const [epfPercent, setEpfPercent] = useState('12'); // 12% of basic (usually ~40-50% of CTC)
  const [profTax, setProfTax] = useState('2400'); // Professional tax per year

  // Format currency numbers
  const formatNumber = (val: number) => {
    return new Intl.NumberFormat(currency === '₹' ? 'en-IN' : 'en-US', {
      maximumFractionDigits: 0,
    }).format(Math.round(val));
  };

  const results = useMemo(() => {
    const rawVal = parseFloat(grossInput) || 0;
    const annualGross = salaryInputMode === 'annual' ? rawVal : rawVal * 12;

    if (annualGross <= 0) {
      return {
        annualGross: 0,
        monthlyGross: 0,
        taxableIncome: 0,
        annualTax: 0,
        monthlyTax: 0,
        annualPF: 0,
        monthlyPF: 0,
        annualProfTax: 0,
        annualNetTakeHome: 0,
        monthlyNetInHand: 0,
        effectiveTaxRate: 0,
        deductionsTotal: 0,
      };
    }

    // EPF calculation (Basic is approx 40% to 50% of CTC)
    const annualBasic = annualGross * 0.45;
    const epfRate = includeEPF ? (parseFloat(epfPercent) || 0) / 100 : 0;
    // Statutory cap or percentage
    const annualPF = annualBasic * epfRate;
    const annualProfTaxVal = parseFloat(profTax) || 0;

    let taxableIncome = 0;
    let annualTax = 0;
    let deductionsTotal = 0;

    if (taxMode === 'new_regime') {
      // Latest New Tax Regime:
      // Standard deduction: 75,000
      const standardDeduction = 75000;
      deductionsTotal = standardDeduction;
      taxableIncome = Math.max(0, annualGross - standardDeduction);

      // Slabs:
      // 0 - 3,00,000 : Nil
      // 3,00,001 - 7,00,000 : 5%
      // 7,00,001 - 10,00,000 : 10%
      // 10,00,001 - 12,00,000 : 15%
      // 12,00,001 - 15,00,000 : 20%
      // > 15,00,000 : 30%
      let tax = 0;
      if (taxableIncome > 300000) {
        tax += Math.min(taxableIncome - 300000, 400000) * 0.05;
      }
      if (taxableIncome > 700000) {
        tax += Math.min(taxableIncome - 700000, 300000) * 0.10;
      }
      if (taxableIncome > 1000000) {
        tax += Math.min(taxableIncome - 1000000, 200000) * 0.15;
      }
      if (taxableIncome > 1200000) {
        tax += Math.min(taxableIncome - 1200000, 300000) * 0.20;
      }
      if (taxableIncome > 1500000) {
        tax += (taxableIncome - 1500000) * 0.30;
      }

      // Sec 87A rebate in new regime (if taxable income <= 7,00,000 tax is 0; with marginal relief up to 7,75,000 gross)
      if (annualGross <= 775000) {
        tax = 0;
      }

      // 4% Health & Education cess
      annualTax = tax > 0 ? tax * 1.04 : 0;
    } else if (taxMode === 'old_regime') {
      // Old Tax Regime:
      // Standard deduction: 50,000
      const standardDeduction = 50000;
      const d80C = Math.min(parseFloat(deduction80C) || 0, 150000);
      const d80D = Math.min(parseFloat(deduction80D) || 0, 50000);
      const dHra = parseFloat(hraExemption) || 0;
      const dOther = parseFloat(otherDeductions) || 0;

      deductionsTotal = standardDeduction + d80C + d80D + dHra + dOther;
      taxableIncome = Math.max(0, annualGross - deductionsTotal);

      // Old Slabs:
      // 0 - 2,50,000 : Nil
      // 2,50,001 - 5,00,000 : 5%
      // 5,00,001 - 10,00,000 : 20%
      // > 10,00,000 : 30%
      let tax = 0;
      if (taxableIncome > 250000) {
        tax += Math.min(taxableIncome - 250000, 250000) * 0.05;
      }
      if (taxableIncome > 500000) {
        tax += Math.min(taxableIncome - 500000, 500000) * 0.20;
      }
      if (taxableIncome > 1000000) {
        tax += (taxableIncome - 1000000) * 0.30;
      }

      // Sec 87A rebate: if taxable income <= 5,00,000, full rebate
      if (taxableIncome <= 500000) {
        tax = 0;
      }

      annualTax = tax > 0 ? tax * 1.04 : 0;
    } else {
      // Global Standard Bracket (US Federal / Universal equivalent)
      const stdDeduction = annualGross > 15000 ? 14600 : 0;
      deductionsTotal = stdDeduction;
      taxableIncome = Math.max(0, annualGross - stdDeduction);

      let tax = 0;
      if (taxableIncome > 0) tax += Math.min(taxableIncome, 11600) * 0.10;
      if (taxableIncome > 11600) tax += Math.min(taxableIncome - 11600, 35550) * 0.12;
      if (taxableIncome > 47150) tax += Math.min(taxableIncome - 47150, 53375) * 0.22;
      if (taxableIncome > 100525) tax += Math.min(taxableIncome - 100525, 91375) * 0.24;
      if (taxableIncome > 191900) tax += Math.min(taxableIncome - 191900, 51750) * 0.32;
      if (taxableIncome > 243725) tax += (taxableIncome - 243725) * 0.35;

      annualTax = tax;
    }

    const totalEmployeeDeductions = annualTax + annualPF + annualProfTaxVal;
    const annualNetTakeHome = Math.max(0, annualGross - totalEmployeeDeductions);
    const monthlyNetInHand = annualNetTakeHome / 12;
    const monthlyGross = annualGross / 12;
    const monthlyTax = annualTax / 12;
    const monthlyPF = annualPF / 12;
    const effectiveTaxRate = annualGross > 0 ? (annualTax / annualGross) * 100 : 0;

    return {
      annualGross,
      monthlyGross,
      taxableIncome,
      annualTax,
      monthlyTax,
      annualPF,
      monthlyPF,
      annualProfTax: annualProfTaxVal,
      annualNetTakeHome,
      monthlyNetInHand,
      effectiveTaxRate,
      deductionsTotal,
    };
  }, [grossInput, salaryInputMode, taxMode, deduction80C, deduction80D, hraExemption, otherDeductions, includeEPF, epfPercent, profTax]);

  // Breakdown percentages for visual progress bar
  const inHandPct = results.annualGross > 0 ? Math.round((results.annualNetTakeHome / results.annualGross) * 100) : 0;
  const taxPct = results.annualGross > 0 ? Math.round((results.annualTax / results.annualGross) * 100) : 0;
  const pfPct = results.annualGross > 0 ? Math.round((results.annualPF / results.annualGross) * 100) : 0;
  const otherPct = Math.max(0, 100 - inHandPct - taxPct - pfPct);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-700">/</span>
        <Link href="/tools/calculators/" className="hover:text-primary-600 transition-colors">Calculators</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-700">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Salary &amp; Income Tax Calculator</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white text-xl shadow-sm">
              💵
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Income Tax &amp; In-Hand Salary Calculator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Calculate your monthly take-home salary, income tax (New vs Old Regime), EPF deductions, and net in-hand pay in real time.
          </p>
        </div>

        {/* Currency & Frequency Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-xl flex text-xs font-bold">
            <button
              onClick={() => {
                if (salaryInputMode === 'monthly') {
                  setGrossInput(String((parseFloat(grossInput) || 0) * 12));
                }
                setSalaryInputMode('annual');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                salaryInputMode === 'annual'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Annual CTC
            </button>
            <button
              onClick={() => {
                if (salaryInputMode === 'annual') {
                  setGrossInput(String(Math.round((parseFloat(grossInput) || 0) / 12)));
                }
                setSalaryInputMode('monthly');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                salaryInputMode === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly CTC
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
          {/* Gross Salary Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                {salaryInputMode === 'annual' ? 'Total Annual Gross CTC' : 'Monthly Gross CTC'}
              </label>
              <div className="flex items-center text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                <span>{currency}</span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={grossInput}
                  onChange={(e) => setGrossInput(e.target.value)}
                  className="w-24 text-right bg-transparent outline-none ml-1 font-bold text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <input
              type="range"
              min={salaryInputMode === 'annual' ? 200000 : 20000}
              max={salaryInputMode === 'annual' ? 6000000 : 500000}
              step={salaryInputMode === 'annual' ? 50000 : 5000}
              value={grossInput}
              onChange={(e) => setGrossInput(e.target.value)}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[11px] text-gray-400 mt-1">
              <span>{currency}{salaryInputMode === 'annual' ? '2 L' : '20 K'}</span>
              <span>{currency}{salaryInputMode === 'annual' ? '30 L' : '2.5 L'}</span>
              <span>{currency}{salaryInputMode === 'annual' ? '60 L' : '5 L'}</span>
            </div>
          </div>

          {/* Tax Regime Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">
              Tax Regime / Calculation Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTaxMode('new_regime')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                  taxMode === 'new_regime'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-300'
                }`}
              >
                <div className="font-extrabold">New Regime</div>
                <div className="text-[10px] font-normal opacity-80 mt-0.5">FY 2024-25 / 26 (Default)</div>
              </button>

              <button
                type="button"
                onClick={() => setTaxMode('old_regime')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                  taxMode === 'old_regime'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-300'
                }`}
              >
                <div className="font-extrabold">Old Regime</div>
                <div className="text-[10px] font-normal opacity-80 mt-0.5">With 80C &amp; HRA Claims</div>
              </button>

              <button
                type="button"
                onClick={() => setTaxMode('global_standard')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                  taxMode === 'global_standard'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-300'
                }`}
              >
                <div className="font-extrabold">Global / US</div>
                <div className="text-[10px] font-normal opacity-80 mt-0.5">Standard Brackets</div>
              </button>
            </div>
          </div>

          {/* Conditional Deductions if Old Regime is selected */}
          {taxMode === 'old_regime' && (
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
              <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Exemptions &amp; Deductions (Old Regime)
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-semibold text-gray-700 dark:text-slate-300">
                  <span>Section 80C (PPF, ELSS, EPF, Life Ins.)</span>
                  <span className="text-gray-400 text-[11px]">Max 1.5 Lakh</span>
                </div>
                <div className="flex items-center px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
                  <span className="text-gray-400 mr-1 text-xs">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    max="150000"
                    value={deduction80C}
                    onChange={(e) => setDeduction80C(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-semibold text-gray-700 dark:text-slate-300">
                  <span>Section 80D (Health Insurance Premium)</span>
                  <span className="text-gray-400 text-[11px]">Up to 25k/50k</span>
                </div>
                <div className="flex items-center px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
                  <span className="text-gray-400 mr-1 text-xs">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    value={deduction80D}
                    onChange={(e) => setDeduction80D(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-semibold text-gray-700 dark:text-slate-300">
                  <span>HRA Exemption (House Rent Allowance)</span>
                  <span className="text-gray-400 text-[11px]">Annual rent relief</span>
                </div>
                <div className="flex items-center px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
                  <span className="text-gray-400 mr-1 text-xs">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    value={hraExemption}
                    onChange={(e) => setHraExemption(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Provident Fund & Salary Deductions Toggle */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-800 dark:text-white">
                  Employee Provident Fund (EPF / 401k)
                </div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400">
                  Deducted from monthly pay into retirement corpus
                </div>
              </div>
              <input
                type="checkbox"
                checked={includeEPF}
                onChange={(e) => setIncludeEPF(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {includeEPF && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-500 font-semibold block mb-1">
                    PF Rate (% of Basic)
                  </label>
                  <div className="flex items-center px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={epfPercent}
                      onChange={(e) => setEpfPercent(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none"
                    />
                    <span className="text-gray-400 ml-1 text-xs">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-gray-500 font-semibold block mb-1">
                    Professional Tax / State Tax (Annual)
                  </label>
                  <div className="flex items-center px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
                    <span className="text-gray-400 mr-1 text-xs">{currency}</span>
                    <input
                      type="number"
                      min="0"
                      value={profTax}
                      onChange={(e) => setProfTax(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Output Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          {/* Highlight Card: In-Hand Monthly Salary */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="inline-block text-xs uppercase tracking-wider font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-emerald-50 mb-2">
                  Monthly Take-Home Pay
                </span>
                <div className="text-3xl sm:text-5xl font-black tracking-tight">
                  {currency}{formatNumber(results.monthlyNetInHand)}
                  <span className="text-sm sm:text-base font-normal text-emerald-100 ml-1.5">/ month</span>
                </div>
                <div className="text-xs sm:text-sm text-emerald-100 mt-1">
                  Annual Take-Home: <span className="font-bold text-white">{currency}{formatNumber(results.annualNetTakeHome)}</span>
                </div>
              </div>

              <div className="sm:text-right bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
                <div className="text-xs text-emerald-100 font-medium">Effective Tax Rate</div>
                <div className="text-2xl font-black">{results.effectiveTaxRate.toFixed(1)}%</div>
                <div className="text-[11px] text-emerald-100/80">of total gross income</div>
              </div>
            </div>

            {/* Visual Salary Breakdown Bar */}
            <div className="relative z-10 mt-6 pt-6 border-t border-white/20">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Income Distribution Breakdown</span>
                <span>{inHandPct}% In-Hand</span>
              </div>
              <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${inHandPct}%` }}
                  className="bg-emerald-300 transition-all duration-500"
                  title={`In-Hand Pay: ${inHandPct}%`}
                />
                <div
                  style={{ width: `${taxPct}%` }}
                  className="bg-rose-400 transition-all duration-500"
                  title={`Taxes: ${taxPct}%`}
                />
                <div
                  style={{ width: `${pfPct}%` }}
                  className="bg-amber-300 transition-all duration-500"
                  title={`Retirement/PF: ${pfPct}%`}
                />
              </div>
              <div className="flex flex-wrap gap-4 text-[11px] mt-2 text-emerald-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 inline-block" />
                  In-Hand ({inHandPct}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                  Income Tax ({taxPct}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block" />
                  Retirement / PF ({pfPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 block mb-1">
                Income Tax (TDS)
              </span>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400">
                {currency}{formatNumber(results.annualTax)}
              </div>
              <span className="text-[11px] text-gray-400 block mt-0.5">
                {currency}{formatNumber(results.monthlyTax)} / month
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 block mb-1">
                Total EPF / 401k Savings
              </span>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                {currency}{formatNumber(results.annualPF)}
              </div>
              <span className="text-[11px] text-gray-400 block mt-0.5">
                {currency}{formatNumber(results.monthlyPF)} / month
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 block mb-1">
                Taxable Income Base
              </span>
              <div className="text-xl font-black text-gray-900 dark:text-white">
                {currency}{formatNumber(results.taxableIncome)}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                {currency}{formatNumber(results.deductionsTotal)} Deductions
              </span>
            </div>
          </div>

          {/* Itemized Pay Slip Comparison Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center justify-between">
              <span>Itemized Salary &amp; Deductions Statement</span>
              <span className="text-xs font-semibold text-gray-400">Annual vs Monthly</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 font-bold">
                    <th className="pb-2.5">Salary Component</th>
                    <th className="pb-2.5 text-right">Monthly</th>
                    <th className="pb-2.5 text-right">Annual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 font-medium">
                  <tr>
                    <td className="py-2.5 text-gray-800 dark:text-slate-200 font-bold">Gross CTC / Salary</td>
                    <td className="py-2.5 text-right text-gray-900 dark:text-white font-bold">{currency}{formatNumber(results.monthlyGross)}</td>
                    <td className="py-2.5 text-right text-gray-900 dark:text-white font-bold">{currency}{formatNumber(results.annualGross)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <span>— Income Tax (TDS)</span>
                    </td>
                    <td className="py-2.5 text-right text-rose-600 dark:text-rose-400">-{currency}{formatNumber(results.monthlyTax)}</td>
                    <td className="py-2.5 text-right text-rose-600 dark:text-rose-400">-{currency}{formatNumber(results.annualTax)}</td>
                  </tr>
                  {includeEPF && (
                    <tr>
                      <td className="py-2.5 text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <span>— Employee Provident Fund (EPF)</span>
                      </td>
                      <td className="py-2.5 text-right text-amber-600 dark:text-amber-400">-{currency}{formatNumber(results.monthlyPF)}</td>
                      <td className="py-2.5 text-right text-amber-600 dark:text-amber-400">-{currency}{formatNumber(results.annualPF)}</td>
                    </tr>
                  )}
                  {results.annualProfTax > 0 && (
                    <tr>
                      <td className="py-2.5 text-gray-600 dark:text-slate-400 flex items-center gap-1.5">
                        <span>— Professional Tax</span>
                      </td>
                      <td className="py-2.5 text-right text-gray-600 dark:text-slate-400">-{currency}{formatNumber(results.annualProfTax / 12)}</td>
                      <td className="py-2.5 text-right text-gray-600 dark:text-slate-400">-{currency}{formatNumber(results.annualProfTax)}</td>
                    </tr>
                  )}
                  <tr className="bg-emerald-50/50 dark:bg-emerald-950/20 font-bold">
                    <td className="py-3 px-2 text-emerald-800 dark:text-emerald-300 font-black rounded-l-xl">
                      Net Take-Home Salary (In-Hand)
                    </td>
                    <td className="py-3 text-right text-emerald-700 dark:text-emerald-300 font-black text-sm">
                      {currency}{formatNumber(results.monthlyNetInHand)}
                    </td>
                    <td className="py-3 pr-2 text-right text-emerald-700 dark:text-emerald-300 font-black text-sm rounded-r-xl">
                      {currency}{formatNumber(results.annualNetTakeHome)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
