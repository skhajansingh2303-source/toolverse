'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HashGenerator() {
    const [mode, setMode] = useState<'text' | 'file'>('text');
    const [inputText, setInputText] = useState('');
    const [hashes, setHashes] = useState({
        'SHA-1': '',
        'SHA-256': '',
        'SHA-384': '',
        'SHA-512': ''
    });
    const [fileInfo, setFileInfo] = useState<{name: string, size: number} | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const generateHashes = async (data: ArrayBuffer) => {
        const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
        const newHashes: any = {};
        for (const algo of algos) {
            try {
                const hashBuffer = await crypto.subtle.digest(algo, data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                newHashes[algo] = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (e) {
                newHashes[algo] = 'Error generating hash';
            }
        }
        setHashes(newHashes as any);
    };

    useEffect(() => {
        if (mode === 'text' && inputText) {
            const timeout = setTimeout(() => {
                const encoder = new TextEncoder();
                generateHashes(encoder.encode(inputText).buffer);
            }, 300);
            return () => clearTimeout(timeout);
        } else if (mode === 'text' && !inputText) {
            setHashes({'SHA-1': '', 'SHA-256': '', 'SHA-384': '', 'SHA-512': ''});
        }
    }, [inputText, mode]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileInfo({name: file.name, size: file.size});
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            const buf = event.target?.result as ArrayBuffer;
            if (buf) await generateHashes(buf);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleCopy = (hash: string, algo: string) => {
        navigator.clipboard.writeText(hash);
        setCopied(algo);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <nav className="text-sm mb-8">
                <Link href="/" className="text-primary-600 hover:underline">Home</Link>
                <span className="text-gray-500 dark:text-slate-400 mx-2">/</span>
                <span className="text-gray-900 dark:text-white">Hash Generator</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Hash Generator</h1>
            <p className="text-gray-600 dark:text-slate-300 mb-8">Generate cryptographic hashes (SHA-256, SHA-1, SHA-512) for text or files securely in your browser.</p>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
                <div className="flex border-b border-gray-200 dark:border-slate-800">
                    <button onClick={() => setMode('text')} className={`flex-1 py-4 font-semibold ${mode === 'text' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 bg-gray-50 dark:bg-slate-800' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}>Text Hash</button>
                    <button onClick={() => setMode('file')} className={`flex-1 py-4 font-semibold ${mode === 'file' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 bg-gray-50 dark:bg-slate-800' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}>File Hash</button>
                </div>
                <div className="p-6">
                    {mode === 'text' ? (
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 p-4 mb-4 font-mono"
                            rows={6}
                            placeholder="Type or paste text to hash..."
                        />
                    ) : (
                        <div className="mb-4">
                            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-gray-50 dark:bg-slate-950/40 hover:border-primary-500 hover:bg-gray-100/50 transition-all group cursor-pointer">
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        handleFileUpload(e);
                                        e.target.value = '';
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    title=""
                                />
                                <div className="pointer-events-none flex flex-col items-center">
                                    <span className="text-3xl mb-2">📁</span>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Click or drop any file to compute hashes</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-400 mb-3">Instant client-side SHA cryptographic hashes</p>
                                    <span className="px-5 py-2 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                                        Browse File
                                    </span>
                                </div>
                            </div>
                            {fileInfo && (
                                <div className="mt-4 text-sm text-gray-600 dark:text-slate-300 flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                                    <span><strong>File:</strong> {fileInfo.name}</span>
                                    <span className="text-xs text-gray-500 dark:text-slate-400">{Math.round(fileInfo.size / 1024)} KB</span>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="space-y-4 mt-6">
                        {Object.entries(hashes).map(([algo, hash]) => (
                            <div key={algo} className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-200 dark:border-slate-800 relative">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-gray-800 dark:text-slate-100">{algo} <span className="text-xs font-normal text-gray-500 dark:text-slate-400 ml-2">({hash ? hash.length * 4 : 0} bit)</span></h3>
                                    <button 
                                        onClick={() => handleCopy(hash, algo)} 
                                        disabled={!hash}
                                        className="text-sm bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/60 disabled:opacity-50"
                                    >
                                        {copied === algo ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <div className="font-mono text-sm text-gray-600 dark:text-slate-300 break-all bg-white dark:bg-slate-800 p-3 rounded border border-gray-200 dark:border-slate-700 min-h-[46px]">
                                    {hash || '...'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-slate-300">
                    <li>Select either "Text Hash" or "File Hash" mode.</li>
                    <li>Enter your text or upload a file.</li>
                    <li>The tool will automatically compute all hashes securely in your browser.</li>
                    <li>Click "Copy" next to any hash to copy it to your clipboard.</li>
                </ol>
            </div>
        </div>
    );
}
