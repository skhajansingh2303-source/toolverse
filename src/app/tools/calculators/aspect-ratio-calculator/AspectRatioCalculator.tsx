'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

const PRESETS = [
  { label: '16:9', desc: 'HD Video / YouTube', w: 16, h: 9 },
  { label: '4:3', desc: 'Classic TV / iPad', w: 4, h: 3 },
  { label: '1:1', desc: 'Square / Instagram', w: 1, h: 1 },
  { label: '9:16', desc: 'Stories / TikTok', w: 9, h: 16 },
  { label: '21:9', desc: 'Ultrawide', w: 21, h: 9 },
  { label: '3:2', desc: '35mm Photo / DSLR', w: 3, h: 2 },
];

export default function AspectRatioCalculator() {
  const [ratioW, setRatioW] = useState<number | string>(16);
  const [ratioH, setRatioH] = useState<number | string>(9);
  const [width, setWidth] = useState<number | string>(1920);
  const [height, setHeight] = useState<number | string>(1080);
  
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const handleWidthChange = (val: string) => {
    setWidth(val);
    const numW = parseFloat(val);
    const numRw = parseFloat(String(ratioW));
    const numRh = parseFloat(String(ratioH));
    if (!isNaN(numW) && !isNaN(numRw) && !isNaN(numRh) && numRw > 0) {
      setHeight(Math.round((numW / numRw) * numRh));
    }
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    const numH = parseFloat(val);
    const numRw = parseFloat(String(ratioW));
    const numRh = parseFloat(String(ratioH));
    if (!isNaN(numH) && !isNaN(numRw) && !isNaN(numRh) && numRh > 0) {
      setWidth(Math.round((numH / numRh) * numRw));
    }
  };

  const applyPreset = (w: number, h: number) => {
    setRatioW(w);
    setRatioH(h);
    const numW = parseFloat(String(width));
    if (!isNaN(numW) && w > 0) {
      setHeight(Math.round((numW / w) * h));
    }
  };

  const calculateRatioFromDimensions = () => {
    const numW = parseFloat(String(width));
    const numH = parseFloat(String(height));
    if (!isNaN(numW) && !isNaN(numH) && numW > 0 && numH > 0) {
      const divisor = gcd(numW, numH);
      setRatioW(numW / divisor);
      setRatioH(numH / divisor);
    }
  };

  const rw = parseFloat(String(ratioW)) || 1;
  const rh = parseFloat(String(ratioH)) || 1;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm mb-8" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link href="/" className="text-primary-600 hover:text-primary-700">Home</Link>
              <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
            </li>
            <li>
              <span className="text-gray-500 dark:text-slate-400" aria-current="page">Aspect Ratio Calculator</span>
            </li>
          </ol>
        </nav>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Aspect Ratio Calculator</h1>
          <p className="text-lg text-gray-600 dark:text-slate-300">Calculate dimensions and ratios for video, images, and screens.</p>
        </div>

        <AdSlot format="horizontal" />

        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-6">Calculator</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Ratio Width (W)</label>
                  <input type="number" value={ratioW} onChange={(e) => { setRatioW(e.target.value); handleWidthChange(String(width)); }} className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 text-lg font-semibold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Ratio Height (H)</label>
                  <input type="number" value={ratioH} onChange={(e) => { setRatioH(e.target.value); handleWidthChange(String(width)); }} className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 text-lg font-semibold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Width (px)</label>
                  <input type="number" value={width} onChange={(e) => handleWidthChange(e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 text-lg font-semibold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Height (px)</label>
                  <input type="number" value={height} onChange={(e) => handleHeightChange(e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 text-lg font-semibold" />
                </div>
              </div>
              
              <button onClick={calculateRatioFromDimensions} className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl px-6 py-3 font-semibold transition-colors">
                Calculate Ratio from Width/Height
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-4">Common Presets</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {PRESETS.map((preset, idx) => (
                  <button 
                    key={idx}
                    onClick={() => applyPreset(preset.w, preset.h)}
                    className="p-4 border border-gray-200 dark:border-slate-800 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-slate-800 text-gray-900 dark:text-white rounded-2xl flex flex-col items-center justify-center transition-all text-center"
                  >
                    <span className="font-bold text-lg">{preset.label}</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{preset.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-xs flex-1 flex flex-col items-center justify-center min-h-[400px]">
              <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-6 self-start w-full">Visual Preview</h3>
              
              <div className="w-full max-w-sm aspect-square bg-gray-50 dark:bg-slate-950 flex items-center justify-center border border-dashed border-gray-300 dark:border-slate-800 rounded-xl p-4">
                <div 
                  className="bg-primary-100 border-2 border-primary-500 rounded-lg flex items-center justify-center shadow-inner transition-all duration-300"
                  style={{
                    width: rw >= rh ? '100%' : `${(rw / rh) * 100}%`,
                    height: rh >= rw ? '100%' : `${(rh / rw) * 100}%`,
                  }}
                >
                  <span className="font-bold text-primary-700 text-lg sm:text-2xl">{ratioW}:{ratioH}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-xs mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-slate-300">
            <li><strong>Resize Dimensions:</strong> Enter a known width or height in the bottom inputs. As long as the ratio is set, the other dimension will calculate automatically.</li>
            <li><strong>Find an Aspect Ratio:</strong> Enter your exact pixel Width and Height, then click "Calculate Ratio from Width/Height" to find its simplified aspect ratio.</li>
            <li><strong>Use Presets:</strong> Click on any of the common presets (like 16:9 or 1:1) to quickly set the ratio and re-calculate your dimensions based on your current width.</li>
            <li>The visual preview area shows a scaled representation of the current aspect ratio box.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
