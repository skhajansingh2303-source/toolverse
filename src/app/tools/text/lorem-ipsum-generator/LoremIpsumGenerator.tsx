'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const wordsList = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
  "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit",
  "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
  "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
  "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
];

export default function LoremIpsumGenerator() {
  const [count, setCount] = useState<number>(5);
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const getRandomWord = () => wordsList[Math.floor(Math.random() * wordsList.length)];

  const generateSentence = (wordCount: number = Math.floor(Math.random() * 8) + 8) => {
    const sentenceWords = Array.from({ length: wordCount }, getRandomWord);
    sentenceWords[0] = sentenceWords[0].charAt(0).toUpperCase() + sentenceWords[0].slice(1);
    return sentenceWords.join(' ') + '.';
  };

  const generateParagraph = (sentenceCount: number = Math.floor(Math.random() * 5) + 4) => {
    return Array.from({ length: sentenceCount }, () => generateSentence()).join(' ');
  };

  const generateText = () => {
    let result = '';
    const loremStart = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

    if (type === 'words') {
      let words = Array.from({ length: count }, getRandomWord);
      if (startWithLorem && count > 0) {
        const startWords = loremStart.replace('.', '').split(' ');
        words = [...startWords.slice(0, Math.min(count, startWords.length)), ...words.slice(startWords.length)].slice(0, count);
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      }
      result = words.join(' ');
    } else if (type === 'sentences') {
      let sentences = Array.from({ length: count }, () => generateSentence());
      if (startWithLorem && count > 0) {
        sentences[0] = loremStart;
      }
      result = sentences.join(' ');
    } else if (type === 'paragraphs') {
      let paragraphs = Array.from({ length: count }, () => generateParagraph());
      if (startWithLorem && count > 0) {
        const p = paragraphs[0].split(' ');
        p.splice(0, 8, ...loremStart.split(' '));
        paragraphs[0] = p.join(' ');
      }
      result = paragraphs.join('\n\n');
    }

    setOutput(result.trim());
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = output ? output.split(/\s+/).filter(w => w.length > 0).length : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <nav className="text-sm font-medium text-gray-500 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Lorem Ipsum Generator</span>
        </nav>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Lorem Ipsum Generator</h1>
              <p className="text-gray-600">Generate custom dummy text for your layouts and mockups.</p>
            </div>

            <div className="flex flex-wrap items-end gap-6 mb-8">
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">Count</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full sm:w-24 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3"
                />
              </div>

              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full sm:w-48 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3 bg-white"
                >
                  <option value="paragraphs">Paragraphs</option>
                  <option value="sentences">Sentences</option>
                  <option value="words">Words</option>
                </select>
              </div>

              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="startWithLorem"
                  checked={startWithLorem}
                  onChange={(e) => setStartWithLorem(e.target.checked)}
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="startWithLorem" className="ml-2 block text-sm text-gray-700">
                  Start with 'Lorem ipsum...'
                </label>
              </div>

              <button
                onClick={generateText}
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-3 font-semibold transition-colors ml-auto"
              >
                Generate
              </button>
            </div>

            {output && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    {wordCount} words generated
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="bg-gray-800 hover:bg-gray-900 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 whitespace-pre-wrap text-gray-700 leading-relaxed max-h-96 overflow-y-auto">
                  {output}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How to Use</h2>
          <ol className="list-decimal list-inside space-y-4 text-gray-600">
            <li>Enter the number of paragraphs, sentences, or words you want to generate.</li>
            <li>Select the structural type (Paragraphs, Sentences, or Words) from the dropdown.</li>
            <li>Check or uncheck the 'Start with Lorem ipsum' box depending on your preference.</li>
            <li>Click <strong>Generate</strong> to create your custom placeholder text.</li>
            <li>Use the <strong>Copy to Clipboard</strong> button to instantly copy the text for use in your project.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
