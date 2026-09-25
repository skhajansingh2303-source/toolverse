'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import AdSlot from '@/components/AdSlot';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';

export default function PdfToText() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (window && (window as any).pdfjsLib) {
      setPdfjsLoaded(true);
    }
  }, []);

  const handleScriptLoad = () => {
    if ((window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfjsLoaded(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setExtractedText('');
      setProgress({ current: 0, total: 0 });
      setCopied(false);
    }
  };

  const extractText = async () => {
    if (!file || !(window as any).pdfjsLib) return;
    setIsProcessing(true);
    setExtractedText('');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setProgress({ current: 0, total: numPages });
      let fullText = '';

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        setExtractedText(fullText.trim());
        setProgress({ current: i, total: numPages });
      }

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `⚡ Extracted text from all ${numPages} pages!` },
        })
      );
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('An error occurred during extraction.');
    }
    
    setIsProcessing(false);
  };

  const copyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadTextFile = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_${file?.name || 'document'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 transition-colors">
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" 
        onLoad={handleScriptLoad}
      />
      <div className="max-w-4xl mx-auto px-4">
        <nav className="text-sm mb-8 text-gray-500">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">PDF to Text</span>
        </nav>

        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">PDF to Text Extractor</h1>
          <p className="text-gray-600">Extract plain text from your PDF documents instantly.</p>
        </header>

        <AdSlot format="horizontal" />

        {!file ? (
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 rounded-2xl p-10 transition-colors group bg-gray-50/50 dark:bg-slate-950/40 mb-8 mt-8">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                handleFileUpload(e);
                e.target.value = '';
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title=""
            />
            <div className="pointer-events-none flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-2xl text-primary-600 dark:text-primary-400 mb-3 group-hover:scale-110 transition-transform">
                📝
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Choose PDF to Extract Text
              </span>
              <span className="text-xs text-gray-400 mb-4">or drag and drop your document here</span>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-8 mb-6">
            <DocumentLiveViewer
              file={file}
              onFileChange={(newFile) => {
                setFile(newFile);
                setExtractedText('');
              }}
              onRemove={() => {
                setFile(null);
                setExtractedText('');
              }}
            />
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm mb-8">
          {file && !extractedText && (
            <div className="mb-6 text-center">
              <p className="text-gray-700 dark:text-slate-300 font-medium mb-4">Selected File: {file.name}</p>
              {!isProcessing ? (
                <button 
                  onClick={extractText} 
                  disabled={!pdfjsLoaded} 
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-3 font-semibold disabled:opacity-50 transition-all active:scale-95 shadow-md"
                >
                  {!pdfjsLoaded ? 'Loading Extractor...' : 'Extract Text Now'}
                </button>
              ) : (
                <div className="max-w-md mx-auto space-y-3">
                  <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-slate-300">
                    <span>Extracting page {progress.current} of {progress.total}...</span>
                    <span>{progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-600 to-indigo-600 h-full transition-all duration-150 rounded-full"
                      style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {extractedText && (
            <div className="mt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div className="text-sm text-gray-600 dark:text-slate-400 font-medium">
                  Words: {extractedText.split(/\s+/).filter(w => w.length > 0).length} | Characters: {extractedText.length}
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                  <button 
                    onClick={copyToClipboard}
                    className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 px-4 py-2 rounded-xl font-medium transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy All Text'}
                  </button>
                  <button 
                    onClick={downloadTextFile}
                    className="flex-1 sm:flex-none bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                  >
                    Download .txt
                  </button>
                </div>
              </div>
              <textarea 
                value={extractedText}
                readOnly
                className="w-full h-96 p-4 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-0 text-gray-900 dark:text-slate-100 resize-y"
              />
            </div>
          )}
        </div>

        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-slate-300 space-y-2">
            <li>Upload your PDF file using the file picker.</li>
            <li>Click "Extract Text" to process the document.</li>
            <li>Review the extracted text in the reading pane.</li>
            <li>Use the "Copy All Text" button to copy to your clipboard, or "Download .txt" to save it as a text file.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
