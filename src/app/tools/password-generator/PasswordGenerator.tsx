"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);

  const generatePassword = useCallback(() => {
    let charset = '';
    if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (charset === '') {
      setPassword('');
      return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
  }, [length, useUpper, useLower, useNumbers, useSymbols]);

  const generateBulk = () => {
    let charset = '';
    if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (charset === '') return;

    const newBulk = [];
    for (let j = 0; j < 5; j++) {
      let pwd = '';
      for (let i = 0; i < length; i++) {
        pwd += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      newBulk.push(pwd);
    }
    setBulkPasswords(newBulk);
  };

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const getStrength = () => {
    let score = 0;
    if (length > 8) score++;
    if (length > 12) score++;
    if (useUpper) score++;
    if (useLower) score++;
    if (useNumbers) score++;
    if (useSymbols) score++;

    if (score < 3) return { label: 'Weak', color: 'bg-red-500', w: 'w-1/4' };
    if (score < 5) return { label: 'Medium', color: 'bg-yellow-500', w: 'w-2/4' };
    if (score < 6) return { label: 'Strong', color: 'bg-green-500', w: 'w-3/4' };
    return { label: 'Very Strong', color: 'bg-green-600', w: 'w-full' };
  };

  const strength = getStrength();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-primary-600 hover:underline">Home</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">Password Generator</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Generator</h1>
        <p className="text-gray-600">Create strong, secure passwords instantly.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="relative mb-6">
          <div className="flex justify-between items-center bg-gray-50 border border-gray-300 rounded-xl p-4">
            <span className="font-mono text-xl text-gray-800 break-all">{password || 'Select options...'}</span>
            <div className="flex gap-2 ml-4 flex-shrink-0">
              <button onClick={generatePassword} className="p-2 text-gray-500 hover:text-primary-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors" aria-label="Regenerate">
                🔄
              </button>
              <button onClick={() => copyToClipboard(password)} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 font-medium">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">Strength: {strength.label}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`${strength.color} ${strength.w} h-2 rounded-full transition-all duration-300`}></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Password Length</label>
              <span className="text-primary-600 font-bold">{length}</span>
            </div>
            <input
              type="range"
              min="4"
              max="128"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
              <span className="text-gray-700">Uppercase (A-Z)</span>
            </label>
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
              <span className="text-gray-700">Lowercase (a-z)</span>
            </label>
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
              <span className="text-gray-700">Numbers (0-9)</span>
            </label>
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
              <span className="text-gray-700">Symbols (!@#$...)</span>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button onClick={generateBulk} className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl px-6 py-3 font-semibold w-full mb-4">
              Bulk Generate (5 Passwords)
            </button>
            {bulkPasswords.length > 0 && (
              <div className="space-y-2">
                {bulkPasswords.map((pwd, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="font-mono text-sm text-gray-800 break-all mr-2">{pwd}</span>
                    <button onClick={() => copyToClipboard(pwd)} className="text-primary-600 hover:text-primary-700 text-sm font-medium whitespace-nowrap">
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Use the slider to choose your desired password length.</li>
          <li>Check or uncheck the character types you want to include.</li>
          <li>Click the copy button or the refresh button to generate a new password.</li>
          <li>Use the Bulk Generate button if you need multiple passwords at once.</li>
        </ol>
      </div>
    </div>
  );
}
