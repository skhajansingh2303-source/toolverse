'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function CalorieBmrCalculator() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('25');
  const [weightKg, setWeightKg] = useState('70');
  const [heightCm, setHeightCm] = useState('175');
  const [activity, setActivity] = useState<string>('1.375');

  // Mifflin-St Jeor Formula
  const results = useMemo(() => {
    const a = parseFloat(age);
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm);
    const act = parseFloat(activity);

    if (isNaN(a) || isNaN(w) || isNaN(h) || isNaN(act) || a <= 0 || w <= 0 || h <= 0) {
      return null;
    }

    // BMR:
    // Men: 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
    // Women: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
    const base = 10 * w + 6.25 * h - 5 * a;
    const bmr = gender === 'male' ? base + 5 : base - 161;
    const maintenance = Math.round(bmr * act);

    return {
      bmr: Math.round(bmr),
      maintenance,
      mildLoss: maintenance - 250, // 0.25 kg/week
      weightLoss: maintenance - 500, // 0.5 kg/week
      extremeLoss: maintenance - 1000, // 1 kg/week
      weightGain: maintenance + 500, // 0.5 kg/week
    };
  }, [gender, age, weightKg, heightCm, activity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-600">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Calorie &amp; BMR Calculator</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              🔥
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              Calorie &amp; BMR Calculator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Calculate Basal Metabolic Rate (BMR) and daily maintenance calories for weight loss, maintenance, or muscle gain.
          </p>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left Form */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Biological Gender
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  gender === 'male' ? 'bg-gray-950 text-white shadow-xs' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  gender === 'female' ? 'bg-gray-950 text-white shadow-xs' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-2xl p-3 text-sm font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-2xl p-3 text-sm font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Height (cm)
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-2xl p-3 text-sm font-bold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Daily Activity Level
            </label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl p-3 text-xs outline-none"
            >
              <option value="1.2">Sedentary (Little or no exercise, desk job)</option>
              <option value="1.375">Lightly Active (Light exercise 1-3 days/week)</option>
              <option value="1.55">Moderately Active (Moderate exercise 3-5 days/week)</option>
              <option value="1.725">Very Active (Hard exercise 6-7 days/week)</option>
              <option value="1.9">Extra Active (Very heavy physical job or athlete)</option>
            </select>
          </div>
        </div>

        {/* Right Output Results */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          {results ? (
            <div className="space-y-4">
              <div className="p-6 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/50 rounded-2xl text-center">
                <span className="text-xs uppercase font-bold text-orange-800 dark:text-orange-300 tracking-wider block mb-1">
                  Daily Maintenance Calories
                </span>
                <span className="text-4xl font-black text-orange-600 dark:text-orange-400">
                  {results.maintenance.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-gray-600 dark:text-slate-400 block mt-1">
                  Calories / day to stay at current weight
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl text-xs">
                  <span className="text-gray-600 dark:text-slate-400 font-medium">Basal Metabolic Rate (BMR resting)</span>
                  <span className="font-bold text-gray-900 dark:text-white">{results.bmr} kcal</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 rounded-xl text-xs border border-emerald-100 dark:border-emerald-900/40">
                  <span className="font-medium">Mild Weight Loss (-0.25 kg/wk)</span>
                  <span className="font-bold">{results.mildLoss} kcal</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-300 rounded-xl text-xs border border-emerald-200 dark:border-emerald-800/50">
                  <span className="font-medium">Standard Weight Loss (-0.5 kg/wk)</span>
                  <span className="font-bold">{results.weightLoss} kcal</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 rounded-xl text-xs border border-blue-100 dark:border-blue-900/40">
                  <span className="font-medium">Muscle / Weight Gain (+0.5 kg/wk)</span>
                  <span className="font-bold">{results.weightGain} kcal</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-400 dark:text-slate-400">
              Enter age, weight, and height to compute calorie targets.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
