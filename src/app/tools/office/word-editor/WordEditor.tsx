'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

export default function WordEditor() {
  const [docTitle, setDocTitle] = useState('Untitled Document');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [isCopied, setIsCopied] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    updateStats();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
    const count = words.length;
    setWordCount(count);
    setCharCount(text.length);
    setReadingTime(Math.max(1, Math.ceil(count / 200)));
  };

  useEffect(() => {
    // Initial content
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = `
        <h1>Project Proposal: Next Generation Online Platform</h1>
        <p>This document was drafted using the <strong>ToolsVerse In-Browser Word Document Editor</strong>. All your typography, headings, tables, and notes remain 100% private and execute entirely on your device.</p>
        <h2>Executive Summary</h2>
        <p>ToolsVerse provides over 100 free utilities for students, developers, and corporate teams. It requires no installation, has zero server uploads, and offers bank-grade privacy.</p>
        <h3>Key Deliverables</h3>
        <ul>
          <li>Full-featured in-browser document processing</li>
          <li>Export documents to DOCX, HTML, or PDF</li>
          <li>Real-time word, character, and reading-time metrics</li>
        </ul>
      `;
      updateStats();
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    setDocTitle(baseName);

    if (file.name.endsWith('.docx')) {
      try {
        const buffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(buffer);
        const docXmlFile = zip.file('word/document.xml');
        if (docXmlFile) {
          const xmlText = await docXmlFile.async('text');
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
          const paragraphs = Array.from(xmlDoc.getElementsByTagName('w:p'));

          let html = '';
          for (const p of paragraphs) {
            const texts = Array.from(p.getElementsByTagName('w:t')).map((t) => t.textContent).join('');
            if (texts.trim()) {
              html += `<p>${texts}</p>`;
            }
          }
          if (editorRef.current) {
            editorRef.current.innerHTML = html || '<p>Document was empty or non-textual.</p>';
            updateStats();
          }
        }
      } catch (err) {
        alert('Could not read .docx file structure.');
      }
    } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
      const text = await file.text();
      if (editorRef.current) {
        editorRef.current.innerHTML = text;
        updateStats();
      }
    } else {
      const text = await file.text();
      if (editorRef.current) {
        editorRef.current.innerText = text;
        updateStats();
      }
    }
  };

  const downloadDocx = async () => {
    if (!editorRef.current) return;
    const textContent = editorRef.current.innerText || '';
    const paragraphs = textContent.split('\n').filter((p) => p.trim().length > 0);

    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
    );

    zip.file(
      '_rels/.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
    );

    const pXml = paragraphs
      .map(
        (p) => `<w:p><w:r><w:t>${p
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')}</w:t></w:r></w:p>`
      )
      .join('');

    zip.file(
      'word/document.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${pXml}</w:body>
</w:document>`
    );

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle || 'document'}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadHtml = () => {
    if (!editorRef.current) return;
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docTitle}</title>
  <style>
    body { font-family: ${fontFamily}, system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
  </style>
</head>
<body>
  ${editorRef.current.innerHTML}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle || 'document'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTxt = () => {
    if (!editorRef.current) return;
    const blob = new Blob([editorRef.current.innerText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle || 'document'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printDocument = () => {
    window.print();
  };

  const copyToClipboard = () => {
    if (!editorRef.current) return;
    navigator.clipboard.writeText(editorRef.current.innerText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const insertTable = () => {
    const tableHtml = `
      <table border="1" style="border-collapse: collapse; width: 100%; margin: 12px 0;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="padding: 8px; border: 1px solid #cbd5e1;">Header 1</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1;">Header 2</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1;">Header 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">Data 1</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">Data 2</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">Data 3</td>
          </tr>
        </tbody>
      </table>
    `;
    executeCommand('insertHTML', tableHtml);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/#tools" className="hover:text-primary-600 transition-colors">Tools</Link>
        <span>/</span>
        <span className="text-gray-800 dark:text-slate-200 font-medium">Word Editor</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3 border border-blue-200 dark:border-blue-900/50">
          <span>📄</span>
          <span>100% Private In-Browser Word Processor</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          Online Word Document Editor
        </h1>
        <p className="text-base text-gray-600 dark:text-slate-400 leading-relaxed">
          Create, edit, and format documents directly in your browser. Export to DOCX, HTML, or PDF with zero server uploads.
        </p>
      </div>

      {/* Top Document Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 mb-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📝</span>
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="text-base font-bold bg-transparent border-b border-dashed border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-hidden focus:border-primary-500 px-1 py-0.5"
            placeholder="Document Name"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="cursor-pointer px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5">
            <span>📂</span>
            <span>Open File</span>
            <input type="file" accept=".docx,.txt,.html,.htm" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={downloadDocx}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <span>💾</span>
            <span>Export DOCX</span>
          </button>

          <button
            onClick={downloadHtml}
            className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors"
          >
            HTML
          </button>

          <button
            onClick={downloadTxt}
            className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors"
          >
            TXT
          </button>

          <button
            onClick={printDocument}
            className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors"
            title="Print or Save as PDF"
          >
            🖨️ Print / PDF
          </button>

          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors"
          >
            {isCopied ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>
      </div>

      {/* Formatting Ribbon */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-t-2xl p-3 border-b border-gray-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
        {/* Undo / Redo */}
        <button
          onClick={() => executeCommand('undo')}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
          title="Undo (Ctrl+Z)"
        >
          ↩️
        </button>
        <button
          onClick={() => executeCommand('redo')}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
          title="Redo (Ctrl+Y)"
        >
          ↪️
        </button>

        <span className="w-px h-5 bg-gray-200 dark:bg-slate-800" />

        {/* Heading formatting */}
        <select
          onChange={(e) => executeCommand('formatBlock', e.target.value)}
          className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1 text-gray-700 dark:text-slate-200 font-medium"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        {/* Font Family */}
        <select
          value={fontFamily}
          onChange={(e) => {
            setFontFamily(e.target.value);
            executeCommand('fontName', e.target.value);
          }}
          className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1 text-gray-700 dark:text-slate-200 font-medium"
        >
          <option value="Arial">Arial</option>
          <option value="Calibri">Calibri</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
        </select>

        <span className="w-px h-5 bg-gray-200 dark:bg-slate-800" />

        {/* Bold, Italic, Underline, Strikethrough */}
        <button
          onClick={() => executeCommand('bold')}
          className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 font-black text-gray-800 dark:text-slate-200"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          onClick={() => executeCommand('italic')}
          className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 italic font-serif text-gray-800 dark:text-slate-200"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          onClick={() => executeCommand('underline')}
          className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 underline text-gray-800 dark:text-slate-200"
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        <button
          onClick={() => executeCommand('strikeThrough')}
          className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 line-through text-gray-800 dark:text-slate-200"
          title="Strikethrough"
        >
          S
        </button>

        <span className="w-px h-5 bg-gray-200 dark:bg-slate-800" />

        {/* Alignments */}
        <button
          onClick={() => executeCommand('justifyLeft')}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
          title="Align Left"
        >
          ⇤
        </button>
        <button
          onClick={() => executeCommand('justifyCenter')}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
          title="Align Center"
        >
          ≡
        </button>
        <button
          onClick={() => executeCommand('justifyRight')}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
          title="Align Right"
        >
          ⇥
        </button>

        <span className="w-px h-5 bg-gray-200 dark:bg-slate-800" />

        {/* Lists & Extras */}
        <button
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
          title="Bulleted List"
        >
          • List
        </button>
        <button
          onClick={() => executeCommand('insertOrderedList')}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
          title="Numbered List"
        >
          1. List
        </button>
        <button
          onClick={insertTable}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
          title="Insert Table"
        >
          ▦ Table
        </button>
        <button
          onClick={() => executeCommand('insertHorizontalRule')}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
          title="Horizontal Divider"
        >
          ― Line
        </button>
        <button
          onClick={() => executeCommand('removeFormat')}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-red-600 dark:text-red-400"
          title="Clear Formatting"
        >
          ✕ Clear
        </button>
      </div>

      {/* Editor Canvas Container */}
      <div className="bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 rounded-b-2xl border-x border-b border-gray-200 dark:border-slate-800 shadow-inner">
        <div
          ref={editorRef}
          contentEditable
          onInput={updateStats}
          onKeyUp={updateStats}
          style={{ fontFamily }}
          className="bg-white text-slate-900 mx-auto min-h-[600px] max-w-4xl p-8 sm:p-14 shadow-lg rounded-sm focus:outline-hidden leading-relaxed prose max-w-none dark:prose-invert"
        />
      </div>

      {/* Word Stats Bar */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-slate-400 px-2">
        <div className="flex items-center gap-4">
          <span>Words: <strong className="text-gray-800 dark:text-slate-200">{wordCount}</strong></span>
          <span>Characters: <strong className="text-gray-800 dark:text-slate-200">{charCount}</strong></span>
          <span>Reading time: ~<strong className="text-gray-800 dark:text-slate-200">{readingTime} min</strong></span>
        </div>
        <div>
          <span>🔒 100% Client-Side Private Document</span>
        </div>
      </div>

      {/* Ad Placement */}
      <AdSlot format="horizontal" className="my-8" />

      {/* SEO & Knowledge Guide */}
      <div className="mt-12 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 max-w-4xl mx-auto shadow-xs">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Free Online Microsoft Word Document Editor &amp; Formatter
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-sm text-gray-600 dark:text-slate-400">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold inline-flex items-center justify-center mb-2 text-xs">1</span>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Type or Open</h3>
            <p className="text-xs">Start typing from scratch or open an existing .docx, .html, or .txt file right inside your browser.</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold inline-flex items-center justify-center mb-2 text-xs">2</span>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Format Typography</h3>
            <p className="text-xs">Adjust headings, lists, tables, bold, italics, and alignments with full keyboard shortcuts.</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold inline-flex items-center justify-center mb-2 text-xs">3</span>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">1-Click Export</h3>
            <p className="text-xs">Download your work directly as a Word (.docx) document, webpage (.html), or print to PDF.</p>
          </div>
        </div>

        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Frequently Asked Questions</h3>
        <div className="space-y-4 text-xs sm:text-sm text-gray-600 dark:text-slate-400">
          <div>
            <h4 className="font-bold text-gray-800 dark:text-slate-200">Can I open and edit .docx files without Microsoft Word?</h4>
            <p>Yes. ToolsVerse parses the document body client-side so you can view, edit, and save changes on any device.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-slate-200">Are my drafts saved to any server?</h4>
            <p>Never. Your text stays entirely in your browser memory and is never transmitted over the network.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
