'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function TimestampConverter() {
  const [currentEpoch, setCurrentEpoch] = useState(Math.floor(Date.now() / 1000));
  const [inputTimestamp, setInputTimestamp] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live ticking epoch
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyVal = async (val: string, key: string) => {
    if (!val) return;
    await navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Parse input timestamp
  const dateObj = (() => {
    const num = Number(inputTimestamp);
    if (isNaN(num) || num <= 0) return null;
    // Auto-detect seconds vs milliseconds (> 100 billion is ms)
    const ms = num > 100000000000 ? num : num * 1000;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  })();

  const formatRelativeTime = (d: Date) => {
    const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
    const diffMin = Math.round(diffSec / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
    const diffHours = Math.round(diffMin / 60);
    if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
    const diffDays = Math.round(diffHours / 24);
    return rtf.format(diffDays, 'day');
  };

  const quickSet = (action: string) => {
    const now = new Date();
    switch (action) {
      case 'now':
        setInputTimestamp(Math.floor(now.getTime() / 1000).toString());
        break;
      case 'startOfDay':
        now.setHours(0, 0, 0, 0);
        setInputTimestamp(Math.floor(now.getTime() / 1000).toString());
        break;
      case 'startOfYear':
        now.setMonth(0, 1);
        now.setHours(0, 0, 0, 0);
        setInputTimestamp(Math.floor(now.getTime() / 1000).toString());
        break;
      case '+1h':
        now.setHours(now.getHours() + 1);
        setInputTimestamp(Math.floor(now.getTime() / 1000).toString());
        break;
      case '+1d':
        now.setDate(now.getDate() + 1);
        setInputTimestamp(Math.floor(now.getTime() / 1000).toString());
        break;
      case '+1w':
        now.setDate(now.getDate() + 7);
        setInputTimestamp(Math.floor(now.getTime() / 1000).toString());
        break;
    }
  };

  const timezones = [
    { label: 'UTC (Coordinated Universal Time)', tz: 'UTC' },
    { label: 'EST / EDT (New York, US Eastern)', tz: 'America/New_York' },
    { label: 'PST / PDT (San Francisco, US Pacific)', tz: 'America/Los_Angeles' },
    { label: 'GMT / BST (London, UK)', tz: 'Europe/London' },
    { label: 'CET / CEST (Berlin, Paris)', tz: 'Europe/Berlin' },
    { label: 'IST (India Standard Time)', tz: 'Asia/Kolkata' },
    { label: 'JST (Tokyo, Japan)', tz: 'Asia/Tokyo' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-medium text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-900 font-semibold">Unix Timestamp Converter</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              ⏱️
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
              Unix Timestamp Converter
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
            Convert epoch timestamps to human-readable dates across international timezones with millisecond detection.
          </p>
        </div>

        {/* Live Clock Badge */}
        <div className="bg-gray-900 text-white px-4 py-2 rounded-2xl flex items-center gap-2.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium">Current Unix Epoch</span>
            <span className="font-mono text-sm font-bold">{currentEpoch}</span>
          </div>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Input Box */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 mb-8">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Enter Epoch Timestamp (Seconds or Milliseconds)
        </label>
        
        <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-4">
          <input
            type="text"
            value={inputTimestamp}
            onChange={(e) => setInputTimestamp(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="e.g. 1726034400"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-base font-mono text-gray-900 outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            onClick={() => quickSet('now')}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-2xl transition-all shadow-xs shrink-0"
          >
            Set Current Time
          </button>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          <span className="text-gray-400 font-medium">Quick jump:</span>
          {[
            { id: 'startOfDay', label: 'Start of Today' },
            { id: 'startOfYear', label: 'Start of Year' },
            { id: '+1h', label: '+1 Hour' },
            { id: '+1d', label: '+1 Day' },
            { id: '+1w', label: '+1 Week' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => quickSet(item.id)}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversion Formats Output */}
      {dateObj ? (
        <div className="space-y-6 mb-8">
          {/* Main Key Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                Relative Time
              </span>
              <span className="text-base font-bold text-primary-600 block mb-2">
                {formatRelativeTime(dateObj)}
              </span>
              <span className="text-xs text-gray-400">Calculated from right now</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                ISO 8601 (UTC)
              </span>
              <span className="text-xs font-mono font-bold text-gray-900 block truncate mb-2">
                {dateObj.toISOString()}
              </span>
              <button
                onClick={() => copyVal(dateObj.toISOString(), 'iso')}
                className="text-xs text-primary-600 hover:underline font-semibold"
              >
                {copiedKey === 'iso' ? '✓ Copied' : 'Copy ISO'}
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                Local Device Time
              </span>
              <span className="text-xs font-semibold text-gray-900 block truncate mb-2">
                {dateObj.toLocaleString()}
              </span>
              <button
                onClick={() => copyVal(dateObj.toLocaleString(), 'local')}
                className="text-xs text-primary-600 hover:underline font-semibold"
              >
                {copiedKey === 'local' ? '✓ Copied' : 'Copy Local'}
              </button>
            </div>
          </div>

          {/* International Timezone Breakdown */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs font-bold text-gray-700">
              <span>Timezone Breakdown</span>
              <span className="text-gray-400 font-normal">Click any row to copy formatted date</span>
            </div>

            <div className="divide-y divide-gray-100">
              {timezones.map((tz) => {
                const formatted = dateObj.toLocaleString('en-US', {
                  timeZone: tz.tz,
                  dateStyle: 'full',
                  timeStyle: 'long',
                });
                const isCopied = copiedKey === tz.tz;

                return (
                  <div
                    key={tz.tz}
                    onClick={() => copyVal(formatted, tz.tz)}
                    className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-primary-50/40 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{tz.label}</p>
                      <p className="font-mono text-xs text-gray-600 mt-0.5">{formatted}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-primary-600 self-end sm:self-center">
                      {isCopied ? '✓ Copied' : 'Copy'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs">
          Please enter a valid numeric Unix timestamp.
        </div>
      )}
    </div>
  );
}
