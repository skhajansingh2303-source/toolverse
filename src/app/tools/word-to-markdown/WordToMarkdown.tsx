'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

interface WordParagraph {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bullet' | 'number';
  text: string;
  isBold?: boolean;
  isItalic?: boolean;
}

interface WordTable {
  type: 'table';
  rows: string[][];
}

type WordContentBlock = WordParagraph | WordTable;

export default function WordToMarkdown() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parsedBlocks, setParsedBlocks] = useState<WordContentBlock[]>([]);
  const [docTitle, setDocTitle] = useState<string>('Document');
  
  const [headingStyle, setHeadingStyle] = useState<'atx' | 'setext'>('atx');
  const [bulletChar, setBulletChar] = useState<'-' | '*' | '+'>('-');
  const [emphasisChar, setEmphasisChar] = useState<'*' | '_'>('*');
  const [generatedMd, setGeneratedMd] = useState<string>('');
  
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
                let isNumber = false;

                if (pPr) {
                  const pStyle = pPr.getElementsByTagName('w:pStyle')[0];
                  if (pStyle) {
                    styleVal = (pStyle.getAttribute('w:val') || '').toLowerCase();
                  }
                  
                  const numPr = pPr.getElementsByTagName('w:numPr')[0];
                  if (numPr) {
                    // a very basic heuristic: we'll check style val too, but usually numId handles both
                    if (styleVal.includes('number') || styleVal.includes('listparagraph')) isNumber = true;
                    else isBullet = true;
                  } else if (styleVal.includes('bullet') || styleVal.includes('list')) {
                    isBullet = true;
                  }
                }

                const runs = Array.from(child.getElementsByTagName('w:r'));
                let paragraphText = '';
                let hasBold = false;
                let hasItalic = false;

                runs.forEach((run) => {
                  const rPr = run.getElementsByTagName('w:rPr')[0];
                  if (rPr) {
                    if (rPr.getElementsByTagName('w:b').length > 0) hasBold = true;
                    if (rPr.getElementsByTagName('w:i').length > 0) hasItalic = true;
                  }
                  const tElements = Array.from(run.getElementsByTagName('w:t'));
                  tElements.forEach((t) => {
                    paragraphText += t.textContent || '';
                  });
                });

                const cleanText = paragraphText.trim();
                if (!cleanText) return;

                if (styleVal.includes('heading 1') || styleVal === 'heading1' || styleVal === '1') {
                  blocks.push({ type: 'heading1', text: cleanText, isBold: hasBold, isItalic: hasItalic });
                } else if (styleVal.includes('heading 2') || styleVal === 'heading2' || styleVal === '2') {
                  blocks.push({ type: 'heading2', text: cleanText, isBold: hasBold, isItalic: hasItalic });
                } else if (styleVal.includes('heading 3') || styleVal === 'heading3' || styleVal === '3') {
                  blocks.push({ type: 'heading3', text: cleanText, isBold: hasBold, isItalic: hasItalic });
                } else if (isNumber || /^\d+\.\s+/.test(cleanText)) {
                   blocks.push({
                    type: 'number',
                    text: cleanText.replace(/^\d+[\.\)]\s+/, ''),
                    isBold: hasBold,
                    isItalic: hasItalic
                  });
                } else if (isBullet || /^[\u2022\u25E6\u2023\u25AA\-\*]\s+/.test(cleanText)) {
                  blocks.push({
                    type: 'bullet',
                    text: cleanText.replace(/^[\u2022\u25E6\u2023\u25AA\-\*]\s+/, ''),
                    isBold: hasBold,
                    isItalic: hasItalic
                  });
                } else {
                  blocks.push({
                    type: 'paragraph',
                    text: cleanText,
                    isBold: hasBold,
                    isItalic: hasItalic
                  });
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
          if (line.length < 50 && /^[A-Z0-9\s:_-]+$/.test(line)) {
            blocks.push({ type: 'heading2', text: line, isBold: true });
          } else {
            blocks.push({ type: 'paragraph', text: line });
          }
        });
      }

      setParsedBlocks(blocks);
      generateMdCode(blocks, headingStyle, bulletChar, emphasisChar);
    } catch (err) {
      console.error('Error reading Word document:', err);
      alert('Could not read Word file. Please verify it is a valid .docx or .doc file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSampleDoc = () => {
    const sampleBlocks: WordContentBlock[] = [
      { type: 'heading1', text: 'Markdown Migration Plan' },
      { type: 'paragraph', text: 'This document provides an overview of moving to a Markdown-first documentation approach.' },
      { type: 'heading2', text: '1. Key Benefits' },
      { type: 'bullet', text: 'Simple formatting', isBold: true },
      { type: 'bullet', text: 'Developer friendly' },
      { type: 'heading2', text: '2. Steps' },
      { type: 'number', text: 'Audit current docs' },
      { type: 'number', text: 'Convert via ToolsVerse' },
      { type: 'table', rows: [
        ['Tool', 'Format', 'Status'],
        ['Word', 'DOCX', 'Deprecated'],
        ['Markdown', 'MD', 'Active'],
      ]},
    ];
    setDocTitle('Markdown Plan');
    setParsedBlocks(sampleBlocks);
    generateMdCode(sampleBlocks, headingStyle, bulletChar, emphasisChar);
  };

  const generateMdCode = (blocks: WordContentBlock[], hStyle: string, bChar: string, eChar: string) => {
    let md = '';

    const formatText = (text: string, b?: boolean, i?: boolean) => {
      let res = text;
      if (b) res = `${eChar}${eChar}${res}${eChar}${eChar}`;
      if (i) res = `${eChar}${res}${eChar}`;
      return res;
    };

    blocks.forEach((block, idx) => {
      if (block.type === 'heading1') {
        if (hStyle === 'setext') {
          md += block.text + '\n' + '='.repeat(block.text.length) + '\n\n';
        } else {
          md += '# ' + formatText(block.text, block.isBold, block.isItalic) + '\n\n';
        }
      } else if (block.type === 'heading2') {
        if (hStyle === 'setext') {
          md += block.text + '\n' + '-'.repeat(block.text.length) + '\n\n';
        } else {
          md += '## ' + formatText(block.text, block.isBold, block.isItalic) + '\n\n';
        }
      } else if (block.type === 'heading3') {
        md += '### ' + formatText(block.text, block.isBold, block.isItalic) + '\n\n';
      } else if (block.type === 'paragraph') {
        md += formatText(block.text, block.isBold, block.isItalic) + '\n\n';
      } else if (block.type === 'bullet') {
        md += `${bChar} ` + formatText(block.text, block.isBold, block.isItalic) + '\n';
        if (idx + 1 < blocks.length && blocks[idx + 1].type !== 'bullet') {
          md += '\n';
        }
      } else if (block.type === 'number') {
        md += `1. ` + formatText(block.text, block.isBold, block.isItalic) + '\n';
        if (idx + 1 < blocks.length && blocks[idx + 1].type !== 'number') {
          md += '\n';
        }
      } else if (block.type === 'table') {
        block.rows.forEach((row, rIdx) => {
          md += '| ' + row.join(' | ') + ' |\n';
          if (rIdx === 0) {
            md += '| ' + row.map(() => '---').join(' | ') + ' |\n';
          }
        });
        md += '\n';
      }
    });

    setGeneratedMd(md.trim());
  };

  useEffect(() => {
    if (parsedBlocks.length > 0) {
      generateMdCode(parsedBlocks, headingStyle, bulletChar, emphasisChar);
    }
  }, [headingStyle, bulletChar, emphasisChar]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedMd);
      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: 'Markdown copied to clipboard!', type: 'success' },
        })
      );
    } catch (err) {
      alert('Failed to copy');
    }
  };

  const downloadMd = () => {
    if (!generatedMd) return;
    const blob = new Blob([generatedMd], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.trim() || 'converted'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="text-sm mb-8 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-violet-600 dark:hover:text-violet-400">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/tools" className="hover:text-violet-600 dark:hover:text-violet-400">
            Tools
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Word to Markdown</span>
        </nav>

        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-xs font-semibold text-violet-700 dark:text-violet-300 mb-3">
            <span>⚡ Markdown Documentation Generator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Word to Markdown Converter
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Convert Microsoft Word (.docx and .doc) documents into clean, Github-Flavored Markdown instantly.
          </p>
        </header>

        <AdSlot format="horizontal" />

        {!file && parsedBlocks.length === 0 ? (
          <div>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 rounded-3xl p-12 transition-all group bg-white dark:bg-slate-900 shadow-sm mb-6">
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
                <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/40 flex items-center justify-center text-3xl text-violet-600 dark:text-violet-400 mb-4 group-hover:scale-110 transition-transform">
                  M↓
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Choose Word Document
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
                  Drag and drop your .docx or .doc file here or click anywhere to browse
                </p>
                <span className="px-6 py-3 bg-violet-600 group-hover:bg-violet-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all inline-block">
                  Browse Files
                </span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={loadSampleDoc}
                className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-xs"
              >
                <span>💡 Load Sample Document</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center text-2xl font-bold">
                  MD
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    {file ? file.name : 'Sample Word Document'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {parsedBlocks.length} content blocks parsed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setFile(null);
                    setParsedBlocks([]);
                    setGeneratedMd('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  <span>📋 Copy MD</span>
                </button>
                <button
                  onClick={downloadMd}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>📥 Download .md</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                  Heading Style
                </label>
                <select
                  value={headingStyle}
                  onChange={(e) => setHeadingStyle(e.target.value as any)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="atx">ATX (# Heading)</option>
                  <option value="setext">Setext (=== Heading)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                  Bullet Character
                </label>
                <select
                  value={bulletChar}
                  onChange={(e) => setBulletChar(e.target.value as any)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="-">Hyphen (-)</option>
                  <option value="*">Asterisk (*)</option>
                  <option value="+">Plus (+)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                  Emphasis Character
                </label>
                <select
                  value={emphasisChar}
                  onChange={(e) => setEmphasisChar(e.target.value as any)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="*">Asterisk (*text*)</option>
                  <option value="_">Underscore (_text_)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 h-[600px]">
              <div className="flex flex-col h-full">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Markdown Code</h4>
                <textarea
                  readOnly
                  value={generatedMd}
                  className="w-full h-full p-4 font-mono text-sm bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 whitespace-pre-wrap"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-16 bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to convert Word to Markdown</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-slate-300">
            <li>Upload your Word document (.docx or .doc) into the converter.</li>
            <li>The content will automatically be converted to GitHub-Flavored Markdown.</li>
            <li>Adjust styling for headers, lists, and emphasis in the options.</li>
            <li>Review the markdown syntax in the code editor.</li>
            <li>Click &quot;Copy MD&quot; or download the file as a .md extension.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
