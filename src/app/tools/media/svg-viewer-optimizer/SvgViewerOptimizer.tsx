'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function SvgViewerOptimizer() {
  const [svgCode, setSvgCode] = useState<string>('');
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSvgCode(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const minifySvg = () => {
    let minified = svgCode;
    // Remove comments
    minified = minified.replace(/<!--[\s\S]*?-->/g, '');
    // Remove DOCTYPE
    minified = minified.replace(/<!DOCTYPE[\s\S]*?>/i, '');
    // Remove XML declaration
    minified = minified.replace(/<\?xml[\s\S]*?\?>/i, '');
    // Remove metadata
    minified = minified.replace(/<metadata>[\s\S]*?<\/metadata>/gi, '');
    // Remove whitespace between tags
    minified = minified.replace(/>\s+</g, '><');
    // Remove extra whitespace
    minified = minified.replace(/\s+/g, ' ').trim();
    
    setSvgCode(minified);
  };

  const extractDimensions = () => {
    const matchViewBox = svgCode.match(/viewBox=["'](.*?)["']/);
    const matchWidth = svgCode.match(/width=["'](.*?)["']/);
    const matchHeight = svgCode.match(/height=["'](.*?)["']/);
    
    return {
      viewBox: matchViewBox ? matchViewBox[1] : 'N/A',
      width: matchWidth ? matchWidth[1] : 'N/A',
      height: matchHeight ? matchHeight[1] : 'N/A',
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadSvg = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDataUrl = () => {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgCode)}`;
  };

  const dims = extractDimensions();

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
              <span className="text-gray-500 dark:text-slate-400" aria-current="page">SVG Viewer & Optimizer</span>
            </li>
          </ol>
        </nav>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">SVG Viewer & Optimizer</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400">View, minify, and extract data from SVG files online.</p>
        </div>

        <AdSlot format="horizontal" />

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-xs mb-8">
          <div className="mb-6 flex gap-4 items-center">
            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-3 text-center hover:border-primary-500 cursor-pointer bg-gray-50/50 dark:bg-slate-950/40 group max-w-sm w-full">
              <input 
                type="file" 
                accept=".svg" 
                onChange={(e) => {
                  handleFileUpload(e);
                  e.target.value = '';
                }} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                title=""
              />
              <div className="pointer-events-none flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <span>⚡</span>
                <span className="font-semibold text-primary-600 group-hover:text-primary-700">Upload SVG File</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">SVG Preview</h3>
              <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-2xl border border-gray-300 dark:border-slate-700 flex items-center justify-center p-8 min-h-[400px]">
                {svgCode ? (
                  <div dangerouslySetInnerHTML={{ __html: svgCode }} className="max-w-full max-h-full [&>svg]:max-w-full [&>svg]:max-h-full" />
                ) : (
                  <p className="text-gray-500 dark:text-slate-400">No SVG loaded</p>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-slate-800/80 p-4 rounded-xl border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-300">
                <p><strong>Width:</strong> {dims.width}</p>
                <p><strong>Height:</strong> {dims.height}</p>
                <p><strong>viewBox:</strong> {dims.viewBox}</p>
                <p><strong>Size:</strong> {new Blob([svgCode]).size} bytes</p>
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">SVG Code</h3>
              <textarea 
                className="flex-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 font-mono text-sm bg-gray-50 dark:bg-slate-800/60 text-gray-900 dark:text-white min-h-[400px]"
                value={svgCode}
                onChange={(e) => setSvgCode(e.target.value)}
                placeholder="Paste SVG code here..."
              ></textarea>
              
              <div className="flex flex-wrap gap-4">
                <button onClick={minifySvg} className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-3 font-semibold">Minify SVG</button>
                <button onClick={() => copyToClipboard(svgCode)} className="bg-gray-800 hover:bg-gray-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl px-6 py-3 font-semibold">Copy Code</button>
                <button onClick={() => copyToClipboard(getDataUrl())} className="bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl px-6 py-3 font-semibold">Copy Data URL</button>
                <button onClick={downloadSvg} className="bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl px-6 py-3 font-semibold">Download .svg</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-xs mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-slate-300">
            <li>Paste your SVG code directly into the text area or upload an .svg file.</li>
            <li>View the rendered SVG in the preview panel and check its dimensions.</li>
            <li>Click "Minify SVG" to automatically remove unnecessary metadata, comments, and whitespace, reducing the file size.</li>
            <li>Copy the optimized SVG code, generate a Data URL for inline CSS use, or download the optimized .svg file.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
