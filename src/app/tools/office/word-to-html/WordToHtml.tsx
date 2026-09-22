'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

interface WordParagraph {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bullet';
  text: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
}

interface WordTable {
  type: 'table';
  rows: string[][];
}

type WordContentBlock = WordParagraph | WordTable;

export default function WordToHtml() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parsedBlocks, setParsedBlocks] = useState<WordContentBlock[]>([]);
  const [docTitle, setDocTitle] = useState<string>('Document');
  const [includeInlineCss, setIncludeInlineCss] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'minimal'>('light');
  const [includeImages, setIncludeImages] = useState<boolean>(false);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
                let hasBold = false;
                let hasItalic = false;
                let hasUnderline = false;

                runs.forEach((run) => {
                  const rPr = run.getElementsByTagName('w:rPr')[0];
                  if (rPr) {
                    if (rPr.getElementsByTagName('w:b').length > 0) hasBold = true;
                    if (rPr.getElementsByTagName('w:i').length > 0) hasItalic = true;
                    if (rPr.getElementsByTagName('w:u').length > 0) hasUnderline = true;
                  }
                  const tElements = Array.from(run.getElementsByTagName('w:t'));
                  tElements.forEach((t) => {
                    paragraphText += t.textContent || '';
                  });
                });

                const cleanText = paragraphText.trim();
                if (!cleanText) return;

                if (styleVal.includes('heading 1') || styleVal === 'heading1' || styleVal === '1') {
                  blocks.push({ type: 'heading1', text: cleanText, isBold: true });
                } else if (styleVal.includes('heading 2') || styleVal === 'heading2' || styleVal === '2') {
                  blocks.push({ type: 'heading2', text: cleanText, isBold: true });
                } else if (styleVal.includes('heading 3') || styleVal === 'heading3' || styleVal === '3') {
                  blocks.push({ type: 'heading3', text: cleanText, isBold: true });
                } else if (isBullet || /^[\u2022\u25E6\u2023\u25AA\-\*]\s+/.test(cleanText)) {
                  blocks.push({
                    type: 'bullet',
                    text: cleanText.replace(/^[\u2022\u25E6\u2023\u25AA\-\*]\s+/, ''),
                    isBold: hasBold,
                  });
                } else {
                  blocks.push({
                    type: 'paragraph',
                    text: cleanText,
                    isBold: hasBold,
                    isItalic: hasItalic,
                    isUnderline: hasUnderline,
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
      generateHtmlCode(blocks, includeInlineCss, theme);
    } catch (err) {
      console.error('Error reading Word document:', err);
      alert('Could not read Word file. Please verify it is a valid .docx or .doc file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSampleDoc = () => {
    const sampleBlocks: WordContentBlock[] = [
      { type: 'heading1', text: 'Executive HTML Conversion Proposal', isBold: true },
      { type: 'paragraph', text: 'This document provides an overview of our semantic HTML capabilities. All recommendations are prepared with valid HTML5 tags.' },
      { type: 'heading2', text: '1. Strategic Elements', isBold: true },
      { type: 'bullet', text: 'Automate manual back-office tasks through tags.' },
      { type: 'bullet', text: 'Ensure semantic structure for SEO.' },
      { type: 'table', rows: [
        ['Phase', 'Tag', 'Description'],
        ['1', '<h1>', 'Main Heading'],
        ['2', '<ul>', 'Unordered List'],
      ]},
    ];
    setDocTitle('HTML Proposal');
    setParsedBlocks(sampleBlocks);
    generateHtmlCode(sampleBlocks, includeInlineCss, theme);
  };

  const generateHtmlCode = (blocks: WordContentBlock[], inlineCss: boolean, currentTheme: string) => {
    let html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>${docTitle}</title>\n`;
    
    if (inlineCss) {
      const bg = currentTheme === 'dark' ? '#111827' : currentTheme === 'minimal' ? '#ffffff' : '#f9fafb';
      const text = currentTheme === 'dark' ? '#f3f4f6' : '#111827';
      const accent = '#059669'; // Emerald 600
      
      html += `  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: ${text}; background-color: ${bg}; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1, h2, h3 { color: ${currentTheme === 'minimal' ? text : accent}; margin-top: 1.5rem; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
    th, td { border: 1px solid ${currentTheme === 'dark' ? '#374151' : '#e5e7eb'}; padding: 0.75rem; text-align: left; }
    th { background-color: ${currentTheme === 'dark' ? '#1f2937' : '#f3f4f6'}; }
    ul { margin-bottom: 1.5rem; }
  </style>\n`;
    }
    html += `</head>\n<body>\n`;
    
    let inList = false;

    blocks.forEach((block, idx) => {
      const isNextBullet = idx + 1 < blocks.length && blocks[idx + 1].type === 'bullet';
      
      if (block.type === 'bullet' && !inList) {
        html += `  <ul>\n`;
        inList = true;
      }

      if (block.type !== 'bullet' && inList) {
        html += `  </ul>\n`;
        inList = false;
      }

      const formatText = (text: string, b?: boolean, i?: boolean, u?: boolean) => {
        let res = text;
        if (b) res = `<strong>${res}</strong>`;
        if (i) res = `<em>${res}</em>`;
        if (u) res = `<u>${res}</u>`;
        return res;
      };

      if (block.type === 'heading1') {
        html += `  <h1>${formatText(block.text, block.isBold, block.isItalic, block.isUnderline)}</h1>\n`;
      } else if (block.type === 'heading2') {
        html += `  <h2>${formatText(block.text, block.isBold, block.isItalic, block.isUnderline)}</h2>\n`;
      } else if (block.type === 'heading3') {
        html += `  <h3>${formatText(block.text, block.isBold, block.isItalic, block.isUnderline)}</h3>\n`;
      } else if (block.type === 'paragraph') {
        html += `  <p>${formatText(block.text, block.isBold, block.isItalic, block.isUnderline)}</p>\n`;
      } else if (block.type === 'bullet') {
        html += `    <li>${formatText(block.text, block.isBold, block.isItalic, block.isUnderline)}</li>\n`;
      } else if (block.type === 'table') {
        html += `  <table>\n`;
        block.rows.forEach((row, rIdx) => {
          html += `    <tr>\n`;
          row.forEach((cell) => {
            const tag = rIdx === 0 ? 'th' : 'td';
            html += `      <${tag}>${cell}</${tag}>\n`;
          });
          html += `    </tr>\n`;
        });
        html += `  </table>\n`;
      }
    });

    if (inList) {
      html += `  </ul>\n`;
    }

    html += `</body>\n</html>`;
    setGeneratedHtml(html);
  };

  useEffect(() => {
    if (parsedBlocks.length > 0) {
      generateHtmlCode(parsedBlocks, includeInlineCss, theme);
    }
  }, [includeInlineCss, theme]);

  useEffect(() => {
    if (iframeRef.current && generatedHtml) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(generatedHtml);
        doc.close();
      }
    }
  }, [generatedHtml]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: 'HTML copied to clipboard!', type: 'success' },
        })
      );
    } catch (err) {
      alert('Failed to copy');
    }
  };

  const downloadHtml = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.trim() || 'converted'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="text-sm mb-8 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/tools" className="hover:text-emerald-600 dark:hover:text-emerald-400">
            Tools
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Word to HTML</span>
        </nav>

        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-3">
            <span>⚡ Semantic HTML Generator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Word to HTML Converter
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Convert Microsoft Word (.docx and .doc) documents into clean, responsive HTML code instantly.
          </p>
        </header>

        <AdSlot format="horizontal" />

        {!file && parsedBlocks.length === 0 ? (
          <div>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-12 transition-all group bg-white dark:bg-slate-900 shadow-sm mb-6">
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
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-3xl text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  🌐
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Choose Word Document
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
                  Drag and drop your .docx or .doc file here or click anywhere to browse
                </p>
                <span className="px-6 py-3 bg-emerald-600 group-hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all inline-block">
                  Browse Files
                </span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={loadSampleDoc}
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-xs"
              >
                <span>💡 Load Sample Document</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
                  HTML
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
                    setGeneratedHtml('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  <span>📋 Copy Code</span>
                </button>
                <button
                  onClick={downloadHtml}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>📥 Download HTML</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                  Inline CSS
                </label>
                <select
                  value={includeInlineCss ? 'yes' : 'no'}
                  onChange={(e) => setIncludeInlineCss(e.target.value === 'yes')}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="yes">Include Basic Styling</option>
                  <option value="no">Raw HTML Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                  Theme (if CSS enabled)
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  disabled={!includeInlineCss}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option value="light">Light Theme</option>
                  <option value="dark">Dark Theme</option>
                  <option value="minimal">Minimal / Unstyled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col h-[500px]">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">HTML Output</h4>
                <textarea
                  readOnly
                  value={generatedHtml}
                  className="w-full h-full p-4 font-mono text-sm bg-gray-100 dark:bg-slate-950 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex flex-col h-[500px]">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Live Preview</h4>
                <div className="w-full h-full border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white">
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full"
                    title="HTML Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-16 bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to convert Word to HTML</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-slate-300">
            <li>Upload your Word document (.docx or .doc) using the upload area above.</li>
            <li>The tool will instantly parse the document in your browser (no data is uploaded to any server).</li>
            <li>Adjust settings like whether to include inline CSS and which theme to apply.</li>
            <li>Preview the raw HTML and rendered output side-by-side.</li>
            <li>Copy the code directly or click &quot;Download HTML&quot; to save the .html file to your computer.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
