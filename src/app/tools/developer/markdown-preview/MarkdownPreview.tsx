'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const sampleMarkdown = `# Welcome to Markdown Preview!

This is a **live** markdown editor.

## Features
- Headers (H1-H6)
- *Italics* and **Bold** text
- [Links](https://example.com)
- \`Inline code\`
- Blockquotes

### Code Blocks
\`\`\`javascript
const greeting = "Hello World!";
console.log(greeting);
\`\`\`

### Lists
1. First item
2. Second item
   - Nested item
   - Another nested item

> "Markdown is a lightweight markup language with plain-text-formatting syntax."

---

![Sample Image](https://via.placeholder.com/150)
`;

export default function MarkdownPreview() {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const parseMarkdown = (md: string) => {
    let result = md;

    // Code blocks
    result = result.replace(/\`\`\`([\s\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>');
    // Inline code
    result = result.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
    
    // Headers
    result = result.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    result = result.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    result = result.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold & Italic
    result = result.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    result = result.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    
    // Links
    result = result.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-600 underline">$1</a>');
    
    // Images
    result = result.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" class="max-w-full h-auto rounded" />');
    
    // Blockquotes
    result = result.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4">$1</blockquote>');
    
    // Horizontal Rule
    result = result.replace(/^\-\-\-/gim, '<hr class="my-6 border-gray-300" />');
    
    // Lists (simplified)
    result = result.replace(/^\d+\. (.*$)/gim, '<ol class="list-decimal ml-6 my-2"><li>$1</li></ol>');
    result = result.replace(/^[-*] (.*$)/gim, '<ul class="list-disc ml-6 my-2"><li>$1</li></ul>');
    
    // Merge consecutive list items (hacky but works for simple cases)
    result = result.replace(/<\/ul>\n<ul class="list-disc ml-6 my-2">/g, '\n');
    result = result.replace(/<\/ol>\n<ol class="list-decimal ml-6 my-2">/g, '\n');

    // Paragraphs (double newlines to <p>)
    result = result.replace(/\n\n+/g, '</p><p class="my-4">');
    // Wrap the whole thing in <p> if it's not starting with an HTML block element
    if (result && !result.startsWith('<')) {
        result = '<p class="my-4">' + result + '</p>';
    }

    return result;
  };

  useEffect(() => {
    setHtml(parseMarkdown(markdown));
  }, [markdown]);

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        <nav className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white">Markdown Preview</span>
        </nav>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Markdown Preview</h1>
              <p className="text-gray-600 dark:text-slate-300">Write markdown and see the HTML preview instantly.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMarkdown(sampleMarkdown)}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl px-4 py-2 font-semibold transition-colors"
              >
                Load Sample
              </button>
              <button
                onClick={() => setMarkdown('')}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl px-4 py-2 font-semibold transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold text-gray-700 dark:text-slate-200">Markdown Input</label>
                <button onClick={copyMarkdown} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  {copiedMd ? 'Copied!' : 'Copy MD'}
                </button>
              </div>
              <textarea
                className="flex-grow w-full rounded-xl border border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 font-mono text-sm resize-none"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Type your markdown here..."
              />
            </div>

            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold text-gray-700 dark:text-slate-200">Live Preview</label>
                <button onClick={copyHtml} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  {copiedHtml ? 'Copied HTML!' : 'Copy HTML'}
                </button>
              </div>
              <div 
                className="flex-grow w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 overflow-y-auto prose prose-indigo dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How to Use</h2>
          <ol className="list-decimal list-inside space-y-4 text-gray-600 dark:text-slate-300">
            <li>Type or paste your Markdown text into the left editor pane.</li>
            <li>See the formatted output instantly in the right preview pane.</li>
            <li>Use the <strong>Load Sample</strong> button to see examples of Markdown syntax.</li>
            <li>Click <strong>Copy MD</strong> to copy your raw markdown, or <strong>Copy HTML</strong> to copy the rendered HTML code.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
