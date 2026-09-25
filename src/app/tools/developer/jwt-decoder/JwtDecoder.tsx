'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MjYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoder() {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState<any>(null);
  const [payload, setPayload] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  useEffect(() => {
    decodeToken(token);
  }, [token]);

  const decodeToken = (jwt: string) => {
    if (!jwt.trim()) {
      setHeader(null);
      setPayload(null);
      setError(null);
      return;
    }

    const parts = jwt.split('.');
    if (parts.length !== 3) {
      setError('Invalid JWT structure. A JWT must consist of 3 parts separated by dots.');
      setHeader(null);
      setPayload(null);
      return;
    }

    try {
      const decodedHeader = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const decodedPayload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      setHeader(decodedHeader);
      setPayload(decodedPayload);
      setError(null);
    } catch (err) {
      setError('Failed to decode Base64Url or parse JSON. The token might be malformed.');
      setHeader(null);
      setPayload(null);
    }
  };

  const getStatus = () => {
    if (error) return { text: 'Invalid', color: 'bg-red-100 text-red-800' };
    if (!payload) return null;

    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (now > payload.exp) {
        return { text: 'Expired', color: 'bg-orange-100 text-orange-800' };
      }
      return { text: 'Valid', color: 'bg-green-100 text-green-800' };
    }
    return { text: 'Valid', color: 'bg-green-100 text-green-800' };
  };

  const handleCopy = (text: string, type: 'header' | 'payload') => {
    navigator.clipboard.writeText(text);
    if (type === 'header') {
      setCopiedHeader(true);
      setTimeout(() => setCopiedHeader(false), 2000);
    } else {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  const status = getStatus();

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800 dark:text-slate-100 bg-gray-50 dark:bg-slate-950 min-h-screen transition-colors">
      <nav className="text-sm mb-6 text-gray-500">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">JWT Decoder</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">JWT Decoder</h1>
        <p className="text-gray-600">Decode, inspect, and verify JSON Web Tokens securely in your browser.</p>
      </header>
      
      <AdSlot format="horizontal" />

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 mb-8 mt-6">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-semibold text-gray-700">Encoded JWT (Paste here)</label>
          <button 
            onClick={() => setToken(SAMPLE_JWT)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Load Sample
          </button>
        </div>
        
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full rounded-2xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 font-mono text-sm min-h-[150px] mb-4 break-all"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        />

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Header <span className="font-normal text-sm text-gray-500">ALGORITHM & TOKEN TYPE</span></h3>
              {header && (
                <button 
                  onClick={() => handleCopy(JSON.stringify(header, null, 2), 'header')}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {copiedHeader ? 'Copied!' : 'Copy Header'}
                </button>
              )}
            </div>
            <pre className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-sm min-h-[150px] overflow-auto text-pink-600">
              {header ? JSON.stringify(header, null, 2) : 'Awaiting input...'}
            </pre>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-700">Payload <span className="font-normal text-sm text-gray-500">DATA</span></h3>
                {status && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                    {status.text}
                  </span>
                )}
              </div>
              {payload && (
                <button 
                  onClick={() => handleCopy(JSON.stringify(payload, null, 2), 'payload')}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {copiedPayload ? 'Copied!' : 'Copy Payload'}
                </button>
              )}
            </div>
            <pre className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-sm min-h-[150px] overflow-auto text-blue-600">
              {payload ? JSON.stringify(payload, null, 2) : 'Awaiting input...'}
            </pre>
          </div>
        </div>

        {payload && (
          <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-4">Token Claims</h4>
            <div className="space-y-3 text-sm">
              {payload.exp && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Expiration (exp)</span>
                  <span className="font-medium">{new Date(payload.exp * 1000).toLocaleString()}</span>
                </div>
              )}
              {payload.iat && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Issued At (iat)</span>
                  <span className="font-medium">{new Date(payload.iat * 1000).toLocaleString()}</span>
                </div>
              )}
              {payload.nbf && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Not Before (nbf)</span>
                  <span className="font-medium">{new Date(payload.nbf * 1000).toLocaleString()}</span>
                </div>
              )}
              {payload.sub && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Subject (sub)</span>
                  <span className="font-medium">{payload.sub}</span>
                </div>
              )}
              {payload.iss && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Issuer (iss)</span>
                  <span className="font-medium">{payload.iss}</span>
                </div>
              )}
              {!payload.exp && !payload.iat && !payload.nbf && !payload.sub && !payload.iss && (
                <div className="text-gray-500 italic">No standard claims found in payload.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use the JWT Decoder</h2>
        <ol className="list-decimal pl-5 space-y-3 text-gray-700">
          <li>Paste your JSON Web Token string into the <strong>Encoded JWT</strong> field.</li>
          <li>The tool will automatically split the token into its Header, Payload, and Signature parts.</li>
          <li>It decodes the Base64Url encoded Header and Payload and displays them as formatted JSON.</li>
          <li>Check the <strong>Payload</strong> section to see standard claims like expiration time (<code className="bg-gray-100 px-1 rounded">exp</code>), subject (<code className="bg-gray-100 px-1 rounded">sub</code>), etc.</li>
          <li>The status badge will indicate if the token is valid or expired based on the <code className="bg-gray-100 px-1 rounded">exp</code> claim.</li>
          <li>Use the "Copy" buttons to easily copy the decoded JSON to your clipboard.</li>
        </ol>
        <p className="mt-4 text-sm text-gray-500 italic">Note: This tool decodes the token payload for inspection but does NOT cryptographically verify the signature, as the secret key is unknown. All decoding happens securely in your browser.</p>
      </div>
    </div>
  );
}
