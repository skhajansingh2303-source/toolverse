'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import AdSlot from '@/components/AdSlot';

interface MetadataFields {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  producer: string;
  creator: string;
}

export default function PdfMetadata() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [metadata, setMetadata] = useState<MetadataFields>({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    producer: '',
    creator: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setFile(uploadedFile);
    setError('');

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      setPdfDoc(doc);
      
      setMetadata({
        title: doc.getTitle() || '',
        author: doc.getAuthor() || '',
        subject: doc.getSubject() || '',
        keywords: doc.getKeywords() || '',
        producer: doc.getProducer() || '',
        creator: doc.getCreator() || '',
      });
    } catch (err: any) {
      console.error(err);
      setError('Error reading PDF file. It might be corrupted or password protected.');
      setFile(null);
    }
  };

  const handleProcess = async () => {
    if (!file || !pdfDoc) return;

    setIsProcessing(true);
    try {
      pdfDoc.setTitle(metadata.title);
      pdfDoc.setAuthor(metadata.author);
      pdfDoc.setSubject(metadata.subject);
      pdfDoc.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
      pdfDoc.setProducer(metadata.producer);
      pdfDoc.setCreator(metadata.creator);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace('.pdf', '_updated.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error saving PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <nav className="text-sm font-medium text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">PDF Metadata Editor</span>
        </nav>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">PDF Metadata Editor</h1>
          <p className="text-gray-600 dark:text-slate-400">View and edit document properties like title, author, and keywords.</p>
        </div>

        <AdSlot format="horizontal" />

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 space-y-6">
          {!file ? (
            <div
              className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-12 text-center hover:border-primary-500 transition-colors group bg-white/50 dark:bg-slate-900/50"
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title=""
                ref={fileInputRef}
                onChange={(e) => {
                  handleFileUpload(e);
                  e.target.value = '';
                }}
              />
              <div className="pointer-events-none flex flex-col items-center text-gray-500 dark:text-slate-400">
                <svg className="mx-auto h-12 w-12 mb-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-medium text-gray-900 dark:text-white">Click or drop a PDF file here</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">View and edit document properties</p>
                <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                  Browse Files
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="text-lg font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                  {file.name}
                </div>
                <button
                  onClick={() => { setFile(null); setPdfDoc(null); }}
                  className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove File
                </button>
              </div>

              {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Author</label>
                  <input
                    type="text"
                    value={metadata.author}
                    onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={metadata.subject}
                    onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Keywords (comma separated)</label>
                  <input
                    type="text"
                    value={metadata.keywords}
                    onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Producer</label>
                  <input
                    type="text"
                    value={metadata.producer}
                    onChange={(e) => setMetadata({ ...metadata, producer: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Creator</label>
                  <input
                    type="text"
                    value={metadata.creator}
                    onChange={(e) => setMetadata({ ...metadata, creator: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl px-8 py-3 font-semibold transition-colors"
                >
                  {isProcessing ? 'Saving...' : 'Update & Save PDF'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-slate-400">
            <li>Upload your PDF file using the drop zone above.</li>
            <li>The tool will automatically read and display the current metadata.</li>
            <li>Edit any of the fields: Title, Author, Subject, Keywords, etc.</li>
            <li>Click &quot;Update &amp; Save PDF&quot; to apply your changes and download the updated file.</li>
            <li>All processing is done securely in your browser.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
