'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function WordCounter() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  // High precision text diagnostics
  const stats = useMemo(() => {
    const raw = text.trim();
    if (!raw) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTimeMinutes: 0,
        speakingTimeMinutes: 0,
        syllables: 0,
        readingEase: 100,
        readingLevel: 'N/A',
        topKeywords: [],
      };
    }

    const wordsArray = raw.split(/\s+/).filter(Boolean);
    const wordsCount = wordsArray.length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s+/g, '').length;

    // Sentences: split by . ! ? followed by whitespace or end
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;

    // Paragraphs: split by double line breaks or single line breaks with content
    const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0).length || 1;

    // Reading & Speaking Time
    const readingTimeMinutes = Math.ceil(wordsCount / 200);
    const speakingTimeMinutes = Math.ceil(wordsCount / 130);

    // Count syllables roughly: vowel groups
    let syllableCount = 0;
    wordsArray.forEach((word) => {
      const w = word.toLowerCase().replace(/[^a-z]/g, '');
      if (!w) return;
      if (w.length <= 3) {
        syllableCount += 1;
        return;
      }
      const matches = w.match(/[aeiouy]{1,2}/g);
      syllableCount += matches ? matches.length : 1;
    });

    // Flesch Reading Ease: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
    let ease = 100;
    let readingLevel = 'Very Easy';
    if (wordsCount > 0 && sentences > 0) {
      const avgSentenceLength = wordsCount / sentences;
      const avgSyllablesPerWord = syllableCount / wordsCount;
      ease = Math.round(206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord);
      if (ease > 100) ease = 100;
      if (ease < 0) ease = 0;

      if (ease >= 90) readingLevel = 'Very Easy (5th grade)';
      else if (ease >= 80) readingLevel = 'Easy (6th grade)';
      else if (ease >= 70) readingLevel = 'Fairly Easy (7th grade)';
      else if (ease >= 60) readingLevel = 'Standard (8th–9th grade)';
      else if (ease >= 50) readingLevel = 'Fairly Difficult (High school)';
      else if (ease >= 30) readingLevel = 'Difficult (College level)';
      else readingLevel = 'Very Confusing (Graduate level)';
    }

    // Keyword density
    const frequency: Record<string, number> = {};
    const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'i', 'is', 'that', 'it', 'on', 'you', 'this', 'for', 'with']);
    wordsArray.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean.length > 2 && !stopWords.has(clean)) {
        frequency[clean] = (frequency[clean] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({
        word,
        count,
        percentage: ((count / wordsCount) * 100).toFixed(1),
      }));

    return {
      words: wordsCount,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTimeMinutes,
      speakingTimeMinutes,
      syllables: syllableCount,
      readingEase: ease,
      readingLevel,
      topKeywords,
    };
  }, [text]);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-medium text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-900 font-semibold">Word Counter</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              📝
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
              Word Counter &amp; Text Analyzer
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
            Real-time word, character, sentence count, reading ease scores, and keyword density diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!text}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-40"
          >
            {copied ? '✓ Copied' : 'Copy Text'}
          </button>
          <button
            onClick={() => setText('')}
            disabled={!text}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Metrics Top Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs text-center">
          <span className="block text-2xl sm:text-3xl font-black text-gray-950">
            {stats.words}
          </span>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Words
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs text-center">
          <span className="block text-2xl sm:text-3xl font-black text-gray-950">
            {stats.characters}
          </span>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Characters
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs text-center">
          <span className="block text-2xl sm:text-3xl font-black text-gray-950">
            {stats.charactersNoSpaces}
          </span>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            No Spaces
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs text-center">
          <span className="block text-2xl sm:text-3xl font-black text-gray-950">
            {stats.sentences}
          </span>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Sentences
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs text-center">
          <span className="block text-2xl sm:text-3xl font-black text-gray-950">
            {stats.paragraphs}
          </span>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Paragraphs
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs text-center">
          <span className="block text-2xl sm:text-3xl font-black text-teal-600">
            ~{stats.readingTimeMinutes} min
          </span>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Read Time
          </span>
        </div>
      </div>

      {/* Main Text Input Area */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden mb-8">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your article, essay, or copy here to analyze..."
          className="w-full h-80 p-6 text-sm text-gray-800 placeholder-gray-400 outline-none resize-none leading-relaxed"
        />
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Speaking Time: ~{stats.speakingTimeMinutes} min (at 130 wpm)</span>
          <span>Syllables: ~{stats.syllables}</span>
        </div>
      </div>

      {/* Diagnostics: Readability Score & Top Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Readability Score */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            Readability &amp; Grade Level
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Calculated via the Flesch-Kincaid Reading Ease formula.
          </p>

          <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex flex-col items-center justify-center shrink-0">
              <span className="text-xl font-black">{stats.readingEase}</span>
              <span className="text-[9px] uppercase font-bold tracking-tight">Score</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{stats.readingLevel}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Higher scores (60-80) represent accessible, high-converting copy.
              </p>
            </div>
          </div>
        </div>

        {/* Keyword Density */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            Top Keyword Frequency
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Most frequent terms in your copy (excluding common stop words).
          </p>

          {stats.topKeywords.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-6 text-center">
              Type at least a few sentences to reveal keyword distribution.
            </p>
          ) : (
            <div className="space-y-2">
              {stats.topKeywords.map((kw) => (
                <div
                  key={kw.word}
                  className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-xs"
                >
                  <span className="font-semibold text-gray-800">{kw.word}</span>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200 font-mono text-[10px]">
                      {kw.count}x
                    </span>
                    <span className="font-medium text-[11px]">{kw.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
