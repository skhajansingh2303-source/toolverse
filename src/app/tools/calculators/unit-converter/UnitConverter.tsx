'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

type UnitCategory = 'length' | 'weight' | 'temp' | 'data' | 'speed';

export default function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromVal, setFromVal] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState('meters');
  const [toUnit, setToUnit] = useState('feet');

  const unitDefinitions = useMemo(() => {
    return {
      length: {
        units: [
          { id: 'meters', name: 'Meters (m)', factor: 1 },
          { id: 'kilometers', name: 'Kilometers (km)', factor: 1000 },
          { id: 'centimeters', name: 'Centimeters (cm)', factor: 0.01 },
          { id: 'millimeters', name: 'Millimeters (mm)', factor: 0.001 },
          { id: 'miles', name: 'Miles (mi)', factor: 1609.344 },
          { id: 'yards', name: 'Yards (yd)', factor: 0.9144 },
          { id: 'feet', name: 'Feet (ft)', factor: 0.3048 },
          { id: 'inches', name: 'Inches (in)', factor: 0.0254 },
        ],
      },
      weight: {
        units: [
          { id: 'kilograms', name: 'Kilograms (kg)', factor: 1 },
          { id: 'grams', name: 'Grams (g)', factor: 0.001 },
          { id: 'milligrams', name: 'Milligrams (mg)', factor: 0.000001 },
          { id: 'pounds', name: 'Pounds (lbs)', factor: 0.45359237 },
          { id: 'ounces', name: 'Ounces (oz)', factor: 0.02834952 },
          { id: 'metricTons', name: 'Metric Tons (t)', factor: 1000 },
        ],
      },
      temp: {
        units: [
          { id: 'celsius', name: 'Celsius (°C)' },
          { id: 'fahrenheit', name: 'Fahrenheit (°F)' },
          { id: 'kelvin', name: 'Kelvin (K)' },
        ],
      },
      data: {
        units: [
          { id: 'bytes', name: 'Bytes (B)', factor: 1 },
          { id: 'kilobytes', name: 'Kilobytes (KB)', factor: 1024 },
          { id: 'megabytes', name: 'Megabytes (MB)', factor: 1024 * 1024 },
          { id: 'gigabytes', name: 'Gigabytes (GB)', factor: 1024 * 1024 * 1024 },
          { id: 'terabytes', name: 'Terabytes (TB)', factor: 1024 * 1024 * 1024 * 1024 },
        ],
      },
      speed: {
        units: [
          { id: 'kmh', name: 'Kilometers per hour (km/h)', factor: 1 },
          { id: 'mph', name: 'Miles per hour (mph)', factor: 1.609344 },
          { id: 'ms', name: 'Meters per second (m/s)', factor: 3.6 },
          { id: 'knots', name: 'Knots', factor: 1.852 },
        ],
      },
    };
  }, []);

  const switchCategory = (cat: UnitCategory) => {
    setCategory(cat);
    if (cat === 'length') { setFromUnit('meters'); setToUnit('feet'); }
    else if (cat === 'weight') { setFromUnit('kilograms'); setToUnit('pounds'); }
    else if (cat === 'temp') { setFromUnit('celsius'); setToUnit('fahrenheit'); }
    else if (cat === 'data') { setFromUnit('gigabytes'); setToUnit('megabytes'); }
    else if (cat === 'speed') { setFromUnit('kmh'); setToUnit('mph'); }
  };

  const calculatedResult = useMemo(() => {
    const val = parseFloat(fromVal);
    if (isNaN(val)) return '0';

    if (category === 'temp') {
      if (fromUnit === toUnit) return val.toString();
      let celsius = val;
      if (fromUnit === 'fahrenheit') celsius = (val - 32) * (5 / 9);
      if (fromUnit === 'kelvin') celsius = val - 273.15;

      let result = celsius;
      if (toUnit === 'fahrenheit') result = (celsius * 9) / 5 + 32;
      if (toUnit === 'kelvin') result = celsius + 273.15;
      return result.toFixed(2);
    }

    const catUnits = (unitDefinitions[category] as any).units;
    const fromFactor = catUnits.find((u: any) => u.id === fromUnit)?.factor || 1;
    const toFactor = catUnits.find((u: any) => u.id === toUnit)?.factor || 1;

    const baseVal = val * fromFactor;
    const finalVal = baseVal / toFactor;

    if (finalVal === 0) return '0';
    if (Math.abs(finalVal) < 0.0001 || Math.abs(finalVal) > 1000000) {
      return finalVal.toExponential(4);
    }
    return Number(finalVal.toFixed(4)).toString();
  }, [fromVal, fromUnit, toUnit, category, unitDefinitions]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-600">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Universal Unit Converter</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              ⚖️
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              Universal Unit Converter
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Real-time conversion across length, mass, temperature, data bytes, and speed.
          </p>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'length', label: '📏 Length' },
          { id: 'weight', label: '⚖️ Weight' },
          { id: 'temp', label: '🌡️ Temperature' },
          { id: 'data', label: '💾 Digital Data' },
          { id: 'speed', label: '🚀 Speed' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => switchCategory(item.id as UnitCategory)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              category === item.id
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Converter Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* From Column */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              From
            </label>
            <input
              type="number"
              value={fromVal}
              onChange={(e) => setFromVal(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-2xl p-4 text-xl font-bold outline-none focus:ring-1 focus:ring-primary-500"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 outline-none"
            >
              {(unitDefinitions[category] as any).units.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                const temp = fromUnit;
                setFromUnit(toUnit);
                setToUnit(temp);
              }}
              className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-2xl text-base font-bold transition-transform hover:scale-105"
            >
              ⇄
            </button>
          </div>

          {/* To Column */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              To (Result)
            </label>
            <div className="w-full bg-primary-50/40 border border-primary-100 rounded-2xl p-4 text-xl font-black text-primary-700 select-all truncate">
              {calculatedResult}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 outline-none"
            >
              {(unitDefinitions[category] as any).units.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
