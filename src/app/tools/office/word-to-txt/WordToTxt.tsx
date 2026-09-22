'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

interface WordParagraph {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bullet';
  text: string;
}

interface WordTable {
  type: 'table';
  rows: string[][];
}

type WordContentBlock = WordParagraph | WordTable;

export default function WordToTxt() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parsedBlocks, setParsedBlocks] = useState<WordContentBlock[]>([]);
  const [docTitle, setDocTitle] = useState<string>('Document');
  
  const [lineEnding, setLineEnding] = useState<'lf' | 'crlf'>('lf');
  const [includeHeadingMarkers, setIncludeHeadingMarkers] = useState<boolean>(true);
  const [preserveTables, setPreserveTables] = useState<boolean>(true);
  const [generatedTxt, setGeneratedTxt] = useState<string>('');
  
  // Stats
  const [wordCount, setWordCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [lineCount, setLineCount] = useState<number>(0);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocTitle(cleanName || 'Document');
      parseWordDocument(selected);
    }
  };

  const parseWordDocument = async (fileToParse: File) => {
    setIsProcessing(true);
    try {
      const buffer = await fileToParse.arrayBuffer();
      const blocks: WordContentBlock[] = [];

      try {
        const zip = await JSZip.loadAsync(buffer);
        const documentXmlFile = zip.file('word/document.xml');

        if (documentXmlFile) {
          const xmlText = await documentXmlFile.async('text');
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

          const body = xmlDoc.getElementsByTagName('w:body')[0] || xmlDoc.getElementsByTagName('body')[0];
          if (body) {
            const children = Array.from(body.children);

            children.forEach((child) => {
              const nodeName = child.nodeName.toLowerCase();

              if (nodeName.includes('tbl') || nodeName.endsWith(':tbl')) {
                const trElements = Array.from(child.getElementsByTagName('w:tr'));
                const rows: string[][] = [];

                trElements.forEach((tr) => {
                  const tcElements = Array.from(tr.getElementsByTagName('w:tc'));
                  const rowCells: string[] = [];

                  tcElements.forEach((tc) => {
                    const textRuns = Array.from(tc.getElementsByTagName('w:t'));
                    const cellText = textRuns.map((t) => t.textContent || '').join('');
                    rowCells.push(cellText.trim());
                  });

                  if (rowCells.some((c) => c.length > 0)) {
                    rows.push(rowCells);
                  }
                });

                if (rows.length > 0) {
                  blocks.push({ type: 'table', rows });
                }
                return;
              }

              if (nodeName.includes('p') || nodeName.endsWith(':p')) {
                const pPr = child.getElementsByTagName('w:pPr')[0];
                let styleVal = '';
                let isBullet = false;

                if (pPr) {
                  const pStyle = pPr.getElementsByTagName('w:pStyle')[0];
                  if (pStyle) {
                    styleVal = (pStyle.getAttribute('w:val') || '').toLowerCase();
                  }
                  const numPr = pPr.getElementsByTagName('w:numPr')[0];
                  if (numPr || styleVal.includes('list') || styleVal.includes('bullet')) {
                    isBullet = true;
                  }
                }

                const runs = Array.from(child.getElementsByTagName('w:r'));
                let paragraphText = '';

                runs.forEach((run) => {
                  const tElements = Array.from(run.getElementsByTagName('w:t'));
                  tElements.forEach((t) => {
                    paragraphText += t.textContent || '';
                  });
                });

                const cleanText = paragraphText.trim();
                if (!cleanText) return;

                if (styleVal.includes('heading 1') || styleVal === 'heading1' || styleVal === '1') {
                  blocks.push({ type: 'heading1', text: cleanText });
                } else if (styleVal.includes('heading 2') || styleVal === 'heading2' || styleVal === '2') {
                  blocks.push({ type: 'heading2', text: cleanText });
                } else if (styleVal.includes('heading 3') || styleVal === 'heading3' || styleVal === '3') {
                  blocks.push({ type: 'heading3', text: cleanText });
                } else if (isBullet || /^[\u2022\u25E6\u2023\u25AA\-\*]\s+/.test(cleanText)) {
                  blocks.push({
                    type: 'bullet',
                    text: cleanText.replace(/^[\u2022\u25E6\u2023\u25AA\-\*]\s+/, ''),
                  });
                } else {
                  blocks.push({ type: 'paragraph', text: cleanText });
                }
              }
            });
          }
        }
      } catch {
        const textDecoder = new TextDecoder('utf-8', { fatal: false });
        const rawString = textDecoder.decode(buffer);
        const cleanLines = rawString
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 2);

        cleanLines.forEach((line) => {
          blocks.push({ type: 'paragraph', text: line });
        });
      }

      setParsedBlocks(blocks);
      generateTxtCode(blocks, lineEnding, includeHeadingMarkers, preserveTables);
    } catch (err) {
      console.error('Error reading Word document:', err);
      alert('Could not read Word file. Please verify it is a valid .docx or .doc file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSampleDoc = () => {
    const sampleBlocks: WordContentBlock[] = [
      { type: 'heading1', text: 'Executive Plain Text Strategy' },
      { type: 'paragraph', text: 'This document provides an overview of our raw text output capabilities. Useful for legacy systems and raw data processing.' },
      { type: 'heading2', text: '1. Goals' },
      { type: 'bullet', text: 'Extract raw text effectively.' },
      { type: 'bullet', text: 'Provide clean, unformatted strings.' },
      { type: 'table', rows: [
        ['ID', 'Name', 'Role'],
        ['001', 'Alice', 'Engineer'],
        ['002', 'Bob', 'Manager'],
      ]},
    ];
    setDocTitle('TXT Strategy');
    setParsedBlocks(sampleBlocks);
    generateTxtCode(sampleBlocks, lineEnding, includeHeadingMarkers, preserveTables);
  };

  const generateTxtCode = (blocks: WordContentBlock[], ending: string, markers: boolean, pTables: boolean) => {
    let txt = '';
    const newline = ending === 'crlf' ? '\r\n' : '\n';

    blocks.forEach((block, idx) => {
      if (block.type === 'heading1') {
        txt += block.text + newline;
        if (markers) txt += '='.repeat(block.text.length) + newline;
        txt += newline;
      } else if (block.type === 'heading2') {
        txt += block.text + newline;
        if (markers) txt += '-'.repeat(block.text.length) + newline;
        txt += newline;
      } else if (block.type === 'heading3') {
        if (markers) txt += '### ';
        txt += block.text + newline + newline;
      } else if (block.type === 'paragraph') {
        txt += block.text + newline + newline;
      } else if (block.type === 'bullet') {
        txt += '• ' + block.text + newline;
        // add extra newline if next is not bullet
        if (idx + 1 < blocks.length && blocks[idx + 1].type !== 'bullet') {
          txt += newline;
        }
      } else if (block.type === 'table') {
        if (pTables) {
          // Calculate column widths
          const colWidths: number[] = [];
          block.rows.forEach(row => {
            row.forEach((cell, cIdx) => {
              colWidths[cIdx] = Math.max(colWidths[cIdx] || 0, cell.length);
            });
          });

          block.rows.forEach(row => {
            const rowStr = row.map((cell, cIdx) => cell.padEnd(colWidths[cIdx], ' ')).join(' | ');
            txt += rowStr + newline;
          });
        } else {
          block.rows.forEach(row => {
            txt += row.join(', ') + newline;
          });
        }
        txt += newline;
      }
    });

    setGeneratedTxt(txt.trim());
    
    // update stats
    setCharCount(txt.length);
    setWordCount(txt.split(/\s+/).filter(w => w.length > 0).length);
    setLineCount(txt.split(newline).length);
  };

  useEffect(() => {
    if (parsedBlocks.length > 0) {
      generateTxtCode(parsedBlocks, lineEnding, includeHeadingMarkers, preserveTables);
    }
  }, [lineEnding, includeHeadingMarkers, preserveTables]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedTxt);
      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: 'Text copied to clipboard!', type: 'success' },
        })
      );
    } catch (err) {
      alert('Failed to copy');
    }
  };

  const downloadTxt = () => {
    if (!generatedTxt) return;
    const blob = new Blob([generatedTxt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.trim() || 'converted'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="text-sm mb-8 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-400">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/tools" className="hover:text-slate-600 dark:hover:text-slate-400">
            Tools
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Word to TXT</span>
        </nav>

        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
            <span>⚡ Raw Plain Text Extractor</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Word to TXT Converter
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Convert Microsoft Word (.docx and .doc) documents into unformatted plain text files instantly.
          </p>
        </header>

        <AdSlot format="horizontal" />

        {!file && parsedBlocks.length === 0 ? (
          <div>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-slate-500 dark:hover:border-slate-500 rounded-3xl p-12 transition-all group bg-white dark:bg-slate-900 shadow-sm mb-6">
              <input
                type="file"
                accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => {
                  handleFile(e);
                  e.target.value = '';
                }}
              />
              <div className="pointer-events-none flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl text-slate-600 dark:text-slate-400 mb-4 group-hover:scale-110 transition-transform">
                  📝
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Choose Word Document
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
                  Drag and drop your .docx or .doc file here or click anywhere to browse
                </p>
                <span className="px-6 py-3 bg-slate-600 group-hover:bg-slate-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all inline-block">
                  Browse Files
                </span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={loadSampleDoc}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:underline bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-xs"
              >
                <span>💡 Load Sample Document</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-2xl font-bold">
                  TXT
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    {file ? file.name : 'Sample Word Document'}
                  </h3>
                  <div className="flex gap-3 text-xs text-gray-500 dark:text-slate-400 mt-1">
                    <span>{wordCount.toLocaleString()} words</span>
                    <span>•</span>
                    <span>{charCount.toLocaleString()} chars</span>
                    <span>•</span>
                    <span>{lineCount.toLocaleString()} lines</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setFile(null);
                    setParsedBlocks([]);
                    setGeneratedTxt('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  <span>📋 Copy Text</span>
                </button>
                <button
                  onClick={downloadTxt}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>📥 Download TXT</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                  Line Endings
                </label>
                <select
                  value={lineEnding}
                  onChange={(e) => setLineEnding(e.target.value as any)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="lf">Unix / macOS (LF)</option>
                  <option value="crlf">Windows (CRLF)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                  Heading Markers
                </label>
                <select
                  value={includeHeadingMarkers ? 'yes' : 'no'}
                  onChange={(e) => setIncludeHeadingMarkers(e.target.value === 'yes')}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="yes">Include (===, ---)</option>
                  <option value="no">Do not include</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                  Table Formatting
                </label>
                <select
                  value={preserveTables ? 'yes' : 'no'}
                  onChange={(e) => setPreserveTables(e.target.value === 'yes')}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="yes">Align with Spaces</option>
                  <option value="no">Comma Separated</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col h-[600px]">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Plain Text Output</h4>
              <textarea
                readOnly
                value={generatedTxt}
                className="w-full h-full p-4 font-mono text-sm bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 whitespace-pre"
              />
            </div>
          </div>
        )}
        
        <div className="mt-16 bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to convert Word to TXT</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-slate-300">
            <li>Upload your Word document (.docx or .doc) using the uploader above.</li>
            <li>All document text and tables will be instantly extracted locally.</li>
            <li>Use the options to configure line endings (Windows/Unix), table spacing, and heading formats.</li>
            <li>Review the extracted plain text in the live preview editor.</li>
            <li>Copy the text to your clipboard or download it as a .txt file.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
