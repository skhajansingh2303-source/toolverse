'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

interface Color {
  hex: string;
  rgb: string;
  hsl: string;
}

export default function ImageColorPicker() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hoverColor, setHoverColor] = useState<Color | null>(null);
  const [pickedColor, setPickedColor] = useState<Color | null>(null);
  const [history, setHistory] = useState<Color[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
    }
  };

  const handlePasteUrl = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setImageSrc(url);
    }
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const getColorAtPixel = (x: number, y: number): Color | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    const hsl = rgbToHsl(pixel[0], pixel[1], pixel[2]);
    return { hex, rgb, hsl };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const color = getColorAtPixel(x, y);
    if (color) setHoverColor(color);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const color = getColorAtPixel(x, y);
    if (color) {
      setPickedColor(color);
      setHistory(prev => [color, ...prev].slice(0, 10));
    }
  };

  useEffect(() => {
    if (imageSrc && imageRef.current && canvasRef.current) {
      const img = imageRef.current;
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
        }
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied ${text}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm mb-8" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link href="/" className="text-primary-600 hover:text-primary-700">Home</Link>
              <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
            </li>
            <li>
              <span className="text-gray-500" aria-current="page">Image Color Picker</span>
            </li>
          </ol>
        </nav>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Image Color Picker</h1>
          <p className="text-lg text-gray-600">Extract colors easily from any image by clicking on it.</p>
        </div>

        <AdSlot format="horizontal" />

        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xs mb-8">
          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleImageUpload(e);
                  e.target.value = '';
                }}
                className="block w-full text-sm text-gray-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-950/50 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 cursor-pointer border border-gray-300 dark:border-slate-700 rounded-xl"
              />
              <button onClick={handlePasteUrl} className="bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl px-6 py-3 font-semibold whitespace-nowrap">Paste URL</button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 overflow-auto border border-gray-300 dark:border-slate-700 rounded-2xl relative bg-gray-100 dark:bg-slate-800/50 flex items-center justify-center min-h-[400px]">
                {imageSrc ? (
                  <>
                    <img ref={imageRef} alt="hidden" style={{ display: 'none' }} />
                    <canvas 
                      ref={canvasRef} 
                      onMouseMove={handleMouseMove}
                      onClick={handleClick}
                      onMouseLeave={() => setHoverColor(null)}
                      className="cursor-crosshair max-w-full h-auto object-contain" 
                    />
                  </>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-8 group cursor-pointer min-h-[350px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        handleImageUpload(e);
                        e.target.value = '';
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      title=""
                    />
                    <div className="pointer-events-none flex flex-col items-center text-center">
                      <span className="text-4xl mb-3">🎨</span>
                      <p className="text-base font-bold text-gray-900 dark:text-white mb-1">Click or drop an image to pick colors</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">JPG, PNG, WebP or SVG</p>
                      <span className="px-5 py-2 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                        Browse Files
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full md:w-80 flex flex-col gap-6">
                <div className="p-6 border border-gray-200 rounded-2xl">
                  <h3 className="font-semibold mb-4 text-lg">Hovered Color</h3>
                  {hoverColor ? (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl border border-gray-300 shadow-inner" style={{ backgroundColor: hoverColor.hex }}></div>
                      <div>
                        <p className="text-sm font-medium">{hoverColor.hex}</p>
                        <p className="text-xs text-gray-500">{hoverColor.rgb}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Hover over the image</p>
                  )}
                </div>

                <div className="p-6 border border-gray-200 rounded-2xl bg-gray-50">
                  <h3 className="font-semibold mb-4 text-lg">Picked Color</h3>
                  {pickedColor ? (
                    <div className="flex flex-col gap-4">
                      <div className="w-full h-24 rounded-xl border border-gray-300 shadow-inner mb-2" style={{ backgroundColor: pickedColor.hex }}></div>
                      
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200">
                        <span className="text-sm font-mono">{pickedColor.hex}</span>
                        <button onClick={() => copyToClipboard(pickedColor.hex)} className="text-primary-600 hover:text-primary-700 text-sm font-semibold">Copy HEX</button>
                      </div>
                      
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200">
                        <span className="text-sm font-mono">{pickedColor.rgb}</span>
                        <button onClick={() => copyToClipboard(pickedColor.rgb)} className="text-primary-600 hover:text-primary-700 text-sm font-semibold">Copy RGB</button>
                      </div>

                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200">
                        <span className="text-sm font-mono">{pickedColor.hsl}</span>
                        <button onClick={() => copyToClipboard(pickedColor.hsl)} className="text-primary-600 hover:text-primary-700 text-sm font-semibold">Copy HSL</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Click on the image to pick a color</p>
                  )}
                </div>

                {history.length > 0 && (
                  <div className="p-6 border border-gray-200 rounded-2xl">
                    <h3 className="font-semibold mb-4 text-lg">History</h3>
                    <div className="flex flex-wrap gap-2">
                      {history.map((color, idx) => (
                        <div 
                          key={idx} 
                          className="w-8 h-8 rounded-full border border-gray-300 shadow-sm cursor-pointer hover:scale-110 transition-transform" 
                          style={{ backgroundColor: color.hex }}
                          title={color.hex}
                          onClick={() => setPickedColor(color)}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xs mb-8">
          <h2 className="text-2xl font-bold mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Upload an image from your device or click "Paste URL" to use an online image.</li>
            <li>Hover over the image to see a live preview of the pixel color under your cursor.</li>
            <li>Click on any pixel to lock in the color and view its HEX, RGB, and HSL values.</li>
            <li>Click the "Copy" buttons to quickly copy the values to your clipboard.</li>
            <li>Recent colors will be saved in the History palette for easy access during your session.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
