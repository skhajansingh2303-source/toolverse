'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function CronGenerator() {
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [dayOfMonth, setDayOfMonth] = useState('*');
  const [month, setMonth] = useState('*');
  const [dayOfWeek, setDayOfWeek] = useState('*');
  
  const [cronString, setCronString] = useState('* * * * *');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCronString(`${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`);
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  const loadPreset = (preset: string) => {
    const parts = preset.split(' ');
    setMinute(parts[0]);
    setHour(parts[1]);
    setDayOfMonth(parts[2]);
    setMonth(parts[3]);
    setDayOfWeek(parts[4]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cronString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHumanReadable = () => {
    let desc = "Runs ";
    
    if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return "Runs every minute";
    }

    if (minute.startsWith('*/')) {
      desc += `every ${minute.replace('*/', '')} minutes`;
    } else if (minute === '0') {
      desc += `at the top of the hour`;
    } else if (minute !== '*') {
      desc += `at minute ${minute}`;
    } else {
      desc += `every minute`;
    }

    if (hour.startsWith('*/')) {
      desc += `, every ${hour.replace('*/', '')} hours`;
    } else if (hour !== '*') {
      desc += `, past hour ${hour}`;
    }

    if (dayOfWeek !== '*') {
      if (dayOfWeek === '1-5') desc += `, on weekdays`;
      else if (dayOfWeek === '0,6') desc += `, on weekends`;
      else desc += `, on day ${dayOfWeek} of the week`;
    } else if (dayOfMonth !== '*') {
      desc += `, on day ${dayOfMonth} of the month`;
    } else {
      desc += `, every day`;
    }

    if (month !== '*') {
      desc += `, in month ${month}`;
    }

    return desc;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800 bg-gray-50 min-h-screen">
      <nav className="text-sm mb-6 text-gray-500">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Cron Generator</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cron Expression Generator</h1>
        <p className="text-gray-600">Visually build and translate cron expressions for your scheduled tasks.</p>
      </header>

      <AdSlot format="horizontal" />

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-8 mt-6">
        <div className="mb-8 p-6 bg-primary-50 rounded-2xl border border-primary-100 text-center">
          <div className="font-mono text-4xl font-bold text-primary-700 tracking-wider mb-2">
            {cronString}
          </div>
          <p className="text-primary-900 font-medium">{getHumanReadable()}</p>
          <button 
            onClick={handleCopy}
            className="mt-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-2 font-semibold transition-colors text-sm"
          >
            {copied ? 'Copied!' : 'Copy Expression'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Minute</label>
            <select value={minute} onChange={(e) => setMinute(e.target.value)} className="w-full rounded-xl border border-gray-300 p-3">
              <option value="*">Every minute (*)</option>
              <option value="*/2">Every 2 minutes (*/2)</option>
              <option value="*/5">Every 5 minutes (*/5)</option>
              <option value="*/15">Every 15 minutes (*/15)</option>
              <option value="*/30">Every 30 minutes (*/30)</option>
              <option value="0">At minute 0 (0)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hour</label>
            <select value={hour} onChange={(e) => setHour(e.target.value)} className="w-full rounded-xl border border-gray-300 p-3">
              <option value="*">Every hour (*)</option>
              <option value="*/2">Every 2 hours (*/2)</option>
              <option value="*/4">Every 4 hours (*/4)</option>
              <option value="*/12">Every 12 hours (*/12)</option>
              <option value="0">At midnight (0)</option>
              <option value="12">At noon (12)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Day of Month</label>
            <select value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} className="w-full rounded-xl border border-gray-300 p-3">
              <option value="*">Every day (*)</option>
              <option value="1">1st of month (1)</option>
              <option value="15">15th of month (15)</option>
              <option value="*/2">Every even day (*/2)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full rounded-xl border border-gray-300 p-3">
              <option value="*">Every month (*)</option>
              <option value="1">January (1)</option>
              <option value="6">June (6)</option>
              <option value="12">December (12)</option>
              <option value="*/3">Every quarter (*/3)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Day of Week</label>
            <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="w-full rounded-xl border border-gray-300 p-3">
              <option value="*">Every day (*)</option>
              <option value="1-5">Weekdays (1-5)</option>
              <option value="0,6">Weekends (0,6)</option>
              <option value="1">Monday (1)</option>
              <option value="5">Friday (5)</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Common Presets</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => loadPreset('*/5 * * * *')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg">Every 5 minutes</button>
            <button onClick={() => loadPreset('0 * * * *')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg">Every hour</button>
            <button onClick={() => loadPreset('0 0 * * *')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg">Every day at midnight</button>
            <button onClick={() => loadPreset('0 9 * * 1')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg">Every Monday 9 AM</button>
            <button onClick={() => loadPreset('0 0 1 * *')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg">First of every month</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use the Cron Generator</h2>
        <ol className="list-decimal pl-5 space-y-3 text-gray-700">
          <li>Select the desired schedule parameters using the dropdowns for <strong>Minute</strong>, <strong>Hour</strong>, <strong>Day of Month</strong>, <strong>Month</strong>, and <strong>Day of Week</strong>.</li>
          <li>As you make selections, the cron expression at the top will update automatically.</li>
          <li>A human-readable description is generated below the cron expression to verify your intent.</li>
          <li>You can also click on the <strong>Common Presets</strong> to quickly load standard schedules.</li>
          <li>Click <strong>Copy Expression</strong> to copy the generated cron string to your clipboard.</li>
        </ol>
      </div>
    </div>
  );
}
