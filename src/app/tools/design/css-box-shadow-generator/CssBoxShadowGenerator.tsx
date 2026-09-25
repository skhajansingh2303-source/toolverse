'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function CssBoxShadowGenerator() {
  const [hOffset, setHOffset] = useState(0);
  const [vOffset, setVOffset] = useState(10);
  const [blur, setBlur] = useState(15);
  const [spread, setSpread] = useState(-3);
  const [color, setColor] = useState('#000000');
  const [opacity, setOpacity] = useState(0.1);
  const [inset, setInset] = useState(false);
  const [glassmorphism, setGlassmorphism] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');
  
  const presets = [
    { name: 'Subtle', h: 0, v: 2, b: 4, s: -1, c: '#000000', o: 0.1, i: false },
    { name: 'Layered', h: 0, v: 10, b: 15, s: -3, c: '#000000', o: 0.1, i: false },
    { name: 'Elevated', h: 0, v: 20, b: 25, s: -5, c: '#000000', o: 0.15, i: false },
    { name: 'Floating', h: 0, v: 30, b: 60, s: -12, c: '#000000', o: 0.25, i: false },
    { name: 'Sharp', h: 5, v: 5, b: 0, s: 0, c: '#000000', o: 0.2, i: false },
    { name: 'Glow', h: 0, v: 0, b: 20, s: 5, c: '#4f46e5', o: 0.5, i: false },
    { name: 'Neumorphism', h: 20, v: 20, b: 60, s: 0, c: '#bebebe', o: 0.5, i: false },
    { name: 'Inner Card', h: 0, v: 2, b: 4, s: 0, c: '#000000', o: 0.1, i: true },
  ];

  const applyPreset = (p: any) => {
    setHOffset(p.h);
    setVOffset(p.v);
    setBlur(p.b);
    setSpread(p.s);
    setColor(p.c);
    setOpacity(p.o);
    setInset(p.i);
    setGlassmorphism(false);
  };

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  const boxShadow = `${inset ? 'inset ' : ''}${hOffset}px ${vOffset}px ${blur}px ${spread}px rgba(${hexToRgb(color)}, ${opacity})`;
  
  const cssCode = glassmorphism 
    ? `background: rgba(255, 255, 255, 0.2);\nborder-radius: 16px;\nbox-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);\nbackdrop-filter: blur(5px);\n-webkit-backdrop-filter: blur(5px);\nborder: 1px solid rgba(255, 255, 255, 0.3);`
    : `box-shadow: ${boxShadow};\n-webkit-box-shadow: ${boxShadow};\n-moz-box-shadow: ${boxShadow};`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode);
    alert('CSS copied to clipboard!');
  };

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
              <span className="text-gray-500 dark:text-slate-400" aria-current="page">CSS Box Shadow Generator</span>
            </li>
          </ol>
        </nav>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">CSS Box Shadow Generator</h1>
          <p className="text-lg text-gray-600 dark:text-slate-300">Design beautiful shadows and glassmorphism effects for your UI.</p>
        </div>

        <AdSlot format="horizontal" />

        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-semibold text-xl mb-6">Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Horizontal Offset</label>
                    <span className="text-sm text-gray-500 dark:text-slate-400">{hOffset}px</span>
                  </div>
                  <input type="range" min="-50" max="50" value={hOffset} onChange={(e) => setHOffset(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Vertical Offset</label>
                    <span className="text-sm text-gray-500 dark:text-slate-400">{vOffset}px</span>
                  </div>
                  <input type="range" min="-50" max="50" value={vOffset} onChange={(e) => setVOffset(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Blur Radius</label>
                    <span className="text-sm text-gray-500 dark:text-slate-400">{blur}px</span>
                  </div>
                  <input type="range" min="0" max="100" value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Spread Radius</label>
                    <span className="text-sm text-gray-500 dark:text-slate-400">{spread}px</span>
                  </div>
                  <input type="range" min="-50" max="50" value={spread} onChange={(e) => setSpread(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium block mb-2">Shadow Color</label>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Opacity</label>
                      <span className="text-sm text-gray-500 dark:text-slate-400">{opacity}</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-3" />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} className="w-5 h-5 text-primary-600 rounded" />
                    <span className="text-sm font-medium">Inset Shadow</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={glassmorphism} onChange={(e) => setGlassmorphism(e.target.checked)} className="w-5 h-5 text-primary-600 rounded" />
                    <span className="text-sm font-medium">Glassmorphism Mode</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-semibold text-xl mb-4">Presets</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {presets.map((preset, idx) => (
                  <button 
                    key={idx}
                    onClick={() => applyPreset(preset)}
                    className="py-2 px-3 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl font-medium transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-xs flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-xl">Preview</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-slate-400">Bg Color:</span>
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
                </div>
              </div>
              
              <div 
                className={`flex-1 rounded-2xl flex items-center justify-center relative overflow-hidden ${glassmorphism ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' : ''}`}
                style={{ backgroundColor: glassmorphism ? 'transparent' : bgColor, minHeight: '300px' }}
              >
                {glassmorphism && (
                  <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                )}
                
                <div 
                  className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center transition-all duration-300"
                  style={glassmorphism ? {
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  } : {
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: boxShadow
                  }}
                >
                  <span className={`font-semibold ${glassmorphism ? 'text-white drop-shadow-md' : 'text-gray-400'}`}>Preview Box</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-3xl p-8 text-gray-100 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">CSS Code</h3>
                <button onClick={copyToClipboard} className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-2 font-semibold text-sm">Copy CSS</button>
              </div>
              <pre className="overflow-x-auto text-sm font-mono text-gray-300 whitespace-pre-wrap">
                <code>{cssCode}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-xs mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-slate-300">
            <li>Use the sliders to adjust the horizontal offset, vertical offset, blur radius, and spread radius of your shadow.</li>
            <li>Select a shadow color and adjust the opacity for the desired intensity.</li>
            <li>Toggle "Inset Shadow" to make the shadow appear inside the element instead of outside.</li>
            <li>Toggle "Glassmorphism Mode" to generate modern frosted glass effects.</li>
            <li>You can also click on the "Presets" to quickly apply popular shadow designs.</li>
            <li>Once you are happy with the preview, click "Copy CSS" to grab the code for your project.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
