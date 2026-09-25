'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RegexTester() {
    const [pattern, setPattern] = useState('');
    const [flags, setFlags] = useState({g: true, i: false, m: false, s: false});
    const [testString, setTestString] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [matches, setMatches] = useState<RegExpMatchArray[]>([]);

    useEffect(() => {
        try {
            if (!pattern) {
                setMatches([]);
                setError(null);
                return;
            }
            const flagStr = Object.entries(flags).filter(([_, v]) => v).map(([k]) => k).join('');
            if (flagStr.includes('g')) {
                const regex = new RegExp(pattern, flagStr);
                const foundMatches = Array.from(testString.matchAll(regex));
                setMatches(foundMatches);
            } else {
                const regex = new RegExp(pattern, flagStr);
                const singleMatch = testString.match(regex);
                setMatches(singleMatch ? [singleMatch] : []);
            }
            setError(null);
        } catch (e: any) {
            setError(e.message);
            setMatches([]);
        }
    }, [pattern, flags, testString]);

    const handleFlagChange = (f: keyof typeof flags) => {
        setFlags(prev => ({...prev, [f]: !prev[f]}));
    };

    const insertPattern = (pat: string) => {
        setPattern(pat);
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <nav className="text-sm mb-8">
                <Link href="/" className="text-primary-600 hover:underline">Home</Link>
                <span className="text-gray-500 mx-2">/</span>
                <span className="text-gray-900">Regex Tester</span>
            </nav>
            <h1 className="text-3xl font-bold mb-2">Regex Tester</h1>
            <p className="text-gray-600 mb-8">Test your regular expressions in real-time with syntax highlighting and match extraction.</p>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 mb-8">
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">Regular Expression</label>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
                            <span className="bg-gray-100 text-gray-500 px-4 py-3 border-r border-gray-300 font-mono">/</span>
                            <input
                                type="text"
                                value={pattern}
                                onChange={(e) => setPattern(e.target.value)}
                                className="flex-1 px-4 py-3 focus:outline-none font-mono"
                                placeholder="[a-zA-Z0-9]+"
                            />
                            <span className="bg-gray-100 text-gray-500 px-4 py-3 border-l border-gray-300 font-mono">/</span>
                        </div>
                        <div className="flex gap-4 items-center bg-gray-50 px-4 rounded-xl border border-gray-300">
                            {(['g', 'i', 'm', 's'] as const).map(f => (
                                <label key={f} className="flex items-center gap-1 cursor-pointer" title={`Flag: ${f}`}>
                                    <input type="checkbox" checked={flags[f]} onChange={() => handleFlagChange(f)} />
                                    <span className="font-mono font-bold text-gray-700">{f}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-2">Quick Patterns</h3>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => insertPattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-sm rounded border border-gray-300">Email</button>
                        <button onClick={() => insertPattern('https?://[^\\s]+')} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-sm rounded border border-gray-300">URL</button>
                        <button onClick={() => insertPattern('\\d{3}[-.\\s]?\\d{3}[-.\\s]?\\d{4}')} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-sm rounded border border-gray-300">Phone</button>
                        <button onClick={() => insertPattern('\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}')} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-sm rounded border border-gray-300">IPv4</button>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">Test String</label>
                    <textarea
                        value={testString}
                        onChange={(e) => setTestString(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 p-4 font-mono"
                        rows={6}
                        placeholder="Enter text to test your regex against..."
                    />
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-bold mb-4">Results <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded ml-2">{matches.length} matches</span></h3>
                    {matches.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-4">
                            {matches.map((m, i) => (
                                <div key={i} className="mb-2 p-2 bg-white rounded border border-gray-200">
                                    <div className="font-bold text-sm text-gray-700 mb-1">Match {i + 1} (Index: {m.index})</div>
                                    <div className="font-mono text-sm bg-yellow-100 p-1 rounded inline-block mb-1">{m[0]}</div>
                                    {m.length > 1 && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Groups: {m.slice(1).map((g, gi) => <span key={gi} className="ml-2 bg-gray-200 px-1 rounded">Group {gi+1}: {g}</span>)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 italic">No matches found.</div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-slate-300">
                    <li>Enter your regular expression in the top input box (without the surrounding slashes).</li>
                    <li>Toggle regex flags like 'g' (global) and 'i' (case insensitive) as needed.</li>
                    <li>Enter a test string in the text area below.</li>
                    <li>View the extracted matches and capture groups in real-time in the Results panel.</li>
                </ol>
            </div>
        </div>
    );
}
