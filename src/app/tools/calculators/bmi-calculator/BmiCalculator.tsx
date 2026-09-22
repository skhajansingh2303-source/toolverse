'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function BmiCalculator() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  // Metric values
  const [weightKg, setWeightKg] = useState('70');
  const [heightCm, setHeightCm] = useState('175');

  // Imperial values
  const [weightLbs, setWeightLbs] = useState('155');
  const [heightFeet, setHeightFeet] = useState('5');
  const [heightInches, setHeightInches] = useState('9');

  const bmiResult = useMemo(() => {
    let weight = 0;
    let heightM = 0;

    if (unit === 'metric') {
      const kg = parseFloat(weightKg);
      const cm = parseFloat(heightCm);
      if (isNaN(kg) || isNaN(cm) || kg <= 0 || cm <= 0) return null;
      weight = kg;
      heightM = cm / 100;
    } else {
      const lbs = parseFloat(weightLbs);
      const ft = parseFloat(heightFeet);
      const inc = parseFloat(heightInches);
      if (isNaN(lbs) || isNaN(ft) || isNaN(inc) || lbs <= 0) return null;
      const totalInches = ft * 12 + inc;
      if (totalInches <= 0) return null;
      weight = lbs * 0.453592;
      heightM = totalInches * 0.0254;
    }

    const bmi = weight / (heightM * heightM);

    let category = 'Normal weight';
    let color = 'text-emerald-600';
    let bg = 'bg-emerald-50 border-emerald-200';

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-sky-600';
      bg = 'bg-sky-50 border-sky-200';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      color = 'text-amber-600';
      bg = 'bg-amber-50 border-amber-200';
    } else if (bmi >= 30) {
      category = 'Obesity';
      color = 'text-rose-600';
      bg = 'bg-rose-50 border-rose-200';
    }

    // Ideal healthy weight (BMI 18.5 - 24.9)
    const minHealthyKg = 18.5 * (heightM * heightM);
    const maxHealthyKg = 24.9 * (heightM * heightM);

    const idealRange =
      unit === 'metric'
        ? `${minHealthyKg.toFixed(1)} kg – ${maxHealthyKg.toFixed(1)} kg`
        : `${(minHealthyKg * 2.20462).toFixed(1)} lbs – ${(maxHealthyKg * 2.20462).toFixed(1)} lbs`;

    return {
      bmi: bmi.toFixed(1),
      category,
      color,
      bg,
      idealRange,
      percentage: Math.min(100, Math.max(0, ((bmi - 15) / (40 - 15)) * 100)),
    };
  }, [unit, weightKg, heightCm, weightLbs, heightFeet, heightInches]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center text-xs font-medium text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-900 font-semibold">BMI Calculator</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              🏃
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
              Body Mass Index (BMI) Calculator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
            Calculate your BMI score, health classification category, and ideal healthy weight target.
          </p>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => setUnit('metric')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              unit === 'metric' ? 'bg-white text-gray-950 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Metric (kg, cm)
          </button>
          <button
            onClick={() => setUnit('imperial')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              unit === 'imperial' ? 'bg-white text-gray-950 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            US Units (lbs, feet)
          </button>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left Inputs */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          {unit === 'metric' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Weight (Kilograms)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-base font-bold text-gray-900 outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <span className="text-xs font-bold text-gray-500 px-2">kg</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Height (Centimeters)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-base font-bold text-gray-900 outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <span className="text-xs font-bold text-gray-500 px-2">cm</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Weight (Pounds)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-base font-bold text-gray-900 outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <span className="text-xs font-bold text-gray-500 px-2">lbs</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Height (Feet &amp; Inches)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-base font-bold text-gray-900 outline-none"
                    />
                    <span className="text-xs font-bold text-gray-500">ft</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={heightInches}
                      onChange={(e) => setHeightInches(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-base font-bold text-gray-900 outline-none"
                    />
                    <span className="text-xs font-bold text-gray-500">in</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Output */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          {bmiResult ? (
            <div>
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider block mb-2">
                Your BMI Result
              </span>

              <div className="flex items-baseline gap-4 mb-4">
                <span className={`text-5xl sm:text-6xl font-black ${bmiResult.color}`}>
                  {bmiResult.bmi}
                </span>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${bmiResult.bg} ${bmiResult.color}`}>
                  {bmiResult.category}
                </span>
              </div>

              {/* Visual Meter Bar */}
              <div className="mb-6">
                <div className="w-full h-3 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-rose-500 relative">
                  <div
                    className="w-4 h-4 bg-gray-950 border-2 border-white rounded-full absolute -top-0.5 -translate-x-1/2 shadow-md"
                    style={{ left: `${bmiResult.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
                  <span>18.5 Under</span>
                  <span>18.5 - 24.9 Normal</span>
                  <span>25 - 29.9 Over</span>
                  <span>30+ Obese</span>
                </div>
              </div>

              {/* Recommended Range */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">Healthy Weight Range for Your Height:</span>
                <span className="text-sm font-bold text-gray-900">{bmiResult.idealRange}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-xs">
              Enter valid weight and height above to view your BMI score.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
