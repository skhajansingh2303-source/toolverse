'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  const ageData = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const target = new Date(targetDate);

    if (isNaN(birth.getTime()) || isNaN(target.getTime()) || birth > target) {
      return null;
    }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Totals
    const diffMs = target.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;

    // Next birthday
    let nextBdayYear = target.getFullYear();
    let nextBday = new Date(nextBdayYear, birth.getMonth(), birth.getDate());
    if (nextBday < target) {
      nextBdayYear += 1;
      nextBday = new Date(nextBdayYear, birth.getMonth(), birth.getDate());
    }

    const diffToNextBday = nextBday.getTime() - target.getTime();
    const daysToNextBday = Math.ceil(diffToNextBday / (1000 * 60 * 60 * 24));
    const nextBdayDayOfWeek = nextBday.toLocaleDateString('en-US', { weekday: 'long' });

    // Zodiac sign
    const m = birth.getMonth() + 1;
    const d = birth.getDate();
    let zodiac = '';
    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) zodiac = '♈ Aries';
    else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) zodiac = '♉ Taurus';
    else if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) zodiac = '♊ Gemini';
    else if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) zodiac = '♋ Cancer';
    else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) zodiac = '♌ Leo';
    else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) zodiac = '♍ Virgo';
    else if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) zodiac = '♎ Libra';
    else if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) zodiac = '♏ Scorpio';
    else if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) zodiac = '♐ Sagittarius';
    else if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) zodiac = '♑ Capricorn';
    else if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) zodiac = '♒ Aquarius';
    else zodiac = '♓ Pisces';

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      totalSeconds,
      daysToNextBday,
      nextBdayDayOfWeek,
      zodiac,
    };
  }, [birthDate, targetDate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center text-xs font-medium text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-900 font-semibold">Age Calculator</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              🎂
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              Exact Age Calculator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
            Calculate your exact age in years, months, days, and seconds with next birthday countdown and milestone stats.
          </p>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Date Pickers Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-2xl p-3.5 text-sm font-semibold text-gray-900 outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Calculate Age on Date (Default: Today)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-2xl p-3.5 text-sm font-semibold text-gray-900 outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Results View */}
      {ageData ? (
        <div className="space-y-8 mb-8">
          {/* Main Big Age Banner */}
          <div className="bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 border border-amber-200/70 rounded-3xl p-6 sm:p-10 text-center shadow-xs">
            <span className="text-xs uppercase font-bold text-amber-800 tracking-wider block mb-2">
              Your Current Age
            </span>
            <div className="flex flex-wrap items-baseline justify-center gap-2 sm:gap-4 text-gray-900">
              <span className="text-4xl sm:text-6xl font-black text-rose-600">{ageData.years}</span>
              <span className="text-sm sm:text-lg font-bold text-gray-700">Years</span>
              <span className="text-4xl sm:text-6xl font-black text-amber-600">{ageData.months}</span>
              <span className="text-sm sm:text-lg font-bold text-gray-700">Months</span>
              <span className="text-4xl sm:text-6xl font-black text-orange-600">{ageData.days}</span>
              <span className="text-sm sm:text-lg font-bold text-gray-700">Days</span>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs font-semibold text-gray-600">
              <span className="bg-white/80 px-3 py-1 rounded-full border border-gray-200">
                Zodiac: {ageData.zodiac}
              </span>
              <span className="bg-white/80 px-3 py-1 rounded-full border border-gray-200">
                Next Birthday: {ageData.daysToNextBday} days left ({ageData.nextBdayDayOfWeek})
              </span>
            </div>
          </div>

          {/* Breakdown Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Total Weeks
              </span>
              <span className="text-xl font-black text-gray-900">{ageData.totalWeeks.toLocaleString()}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Total Days
              </span>
              <span className="text-xl font-black text-gray-900">{ageData.totalDays.toLocaleString()}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Total Hours
              </span>
              <span className="text-xl font-black text-gray-900">{ageData.totalHours.toLocaleString()}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Total Minutes
              </span>
              <span className="text-xl font-black text-gray-900">{ageData.totalMinutes.toLocaleString()}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Total Seconds
              </span>
              <span className="text-xl font-black text-rose-600">{ageData.totalSeconds.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-red-50 text-red-700 rounded-2xl text-xs border border-red-200 mb-8">
          Please select a valid date of birth earlier than the target date.
        </div>
      )}
    </div>
  );
}
