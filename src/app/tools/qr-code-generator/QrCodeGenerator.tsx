'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import AdSlot from '@/components/AdSlot';

export default function QrCodeGenerator() {
  const [tab, setTab] = useState<'url' | 'wifi' | 'text' | 'email'>('url');
  const [url, setUrl] = useState('https://toolsverse.com');
  const [text, setText] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');

  // Design controls
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(320);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute final QR payload based on active preset
  const getQrPayload = () => {
    switch (tab) {
      case 'url':
        return url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
      case 'wifi':
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};;`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`;
      case 'text':
      default:
        return text || 'ToolsVerse';
    }
  };

  useEffect(() => {
    const payload = getQrPayload();
    if (!canvasRef.current || !payload) return;

    QRCode.toCanvas(canvasRef.current, payload, {
      width: size,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: errorCorrection,
    }).catch((err) => {
      console.error(err);
    });
  }, [tab, url, text, wifiSsid, wifiPassword, wifiEncryption, emailTo, emailSubject, fgColor, bgColor, size, errorCorrection]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const pngUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = `qrcode_${tab}_toolsverse.png`;
    a.click();
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      // Fallback
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-medium text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-900 font-semibold">QR Code Generator</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              📱
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
              Professional QR Code Generator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
            Create high-resolution QR codes for websites, WiFi networks, emails, and text with custom color palettes.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          High-Res PNG Export
        </span>
      </div>

      <AdSlot format="horizontal" />

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left Side: Configuration Controls */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Preset Tabs */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              QR Code Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setTab('url')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  tab === 'url'
                    ? 'bg-gray-950 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Website URL
              </button>
              <button
                onClick={() => setTab('wifi')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  tab === 'wifi'
                    ? 'bg-gray-950 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                WiFi Network
              </button>
              <button
                onClick={() => setTab('email')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  tab === 'email'
                    ? 'bg-gray-950 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Email Mailto
              </button>
              <button
                onClick={() => setTab('text')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  tab === 'text'
                    ? 'bg-gray-950 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Plain Text
              </button>
            </div>
          </div>

          {/* Form Fields for Active Tab */}
          <div className="pt-2">
            {tab === 'url' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Target Website URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            )}

            {tab === 'wifi' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Network Name (SSID)
                  </label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="e.g. Home_WiFi_5G"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    WiFi Password
                  </label>
                  <input
                    type="text"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Security Type
                  </label>
                  <select
                    value={wifiEncryption}
                    onChange={(e) => setWifiEncryption(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                    <option value="WEP">WEP (Legacy)</option>
                    <option value="nopass">None (Open Network)</option>
                  </select>
                </div>
              </div>
            )}

            {tab === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Inquiry from QR Code"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}

            {tab === 'text' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Message Content
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter raw text here..."
                  className="w-full h-28 bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 outline-none resize-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            )}
          </div>

          {/* Color & Styling Controls */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">
              Styling &amp; Quality
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">Foreground Color</label>
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-xs font-mono text-gray-700">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">Background Color</label>
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-xs font-mono text-gray-700">{bgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">Error Correction</label>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs text-gray-900 outline-none"
                >
                  <option value="L">Low (7% recovery)</option>
                  <option value="M">Medium (15% recovery)</option>
                  <option value="Q">Quartile (25% recovery)</option>
                  <option value="H">High (30% recovery)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live QR Canvas & Export */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs flex flex-col items-center justify-between text-center">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Real-time Output Preview
            </h3>

            {/* QR Canvas */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 inline-block shadow-inner mb-6">
              <canvas ref={canvasRef} className="rounded-xl shadow-xs max-w-full h-auto" />
            </div>

            <p className="text-xs text-gray-400 max-w-xs mx-auto mb-6">
              Scan with any mobile camera or QR reader to test immediately.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2">
            <button
              onClick={handleDownload}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Download PNG Image
            </button>
            <button
              onClick={handleCopyImage}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors"
            >
              {copied ? '✓ Copied to Clipboard' : 'Copy Image to Clipboard'}
            </button>
          </div>
        </div>
      </div>

      {/* Instructional Guide */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 mb-2">How to Generate Custom QR Codes</h2>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-600">
          <li>Select your payload type: Website URL, WiFi automatic connection, Mailto, or raw text.</li>
          <li>Adjust the foreground and background colors to match your brand styling.</li>
          <li>For printed banners and menus, keep Error Correction on <strong>Medium</strong> or <strong>High</strong>.</li>
          <li>Download the crisp PNG file and embed it in your posters, business cards, or packaging.</li>
        </ul>
      </div>
    </div>
  );
}
