'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function TextToPdf() {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [fontSize, setFontSize] = useState<number>(12);
  const [margin, setMargin] = useState<number>(50); // normal
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGeneratePdf = async () => {
    if (!text && !title) return;
    setIsProcessing(true);
    
    try {
      const pdfDoc = await PDFDocument.create();
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

      let page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      let cursorY = height - margin;
      const maxWidth = width - margin * 2;
      const lineHeight = fontSize * 1.5;

      // Draw Title
      if (title) {
        const titleSize = fontSize + 8;
        page.drawText(title, {
          x: margin,
          y: cursorY,
          size: titleSize,
          font: timesRomanBoldFont,
          color: rgb(0, 0, 0),
        });
        cursorY -= (titleSize * 1.5);
      }

      // Draw Text
      const paragraphs = text.split('\n');
      for (const paragraph of paragraphs) {
        if (cursorY < margin) {
            page = pdfDoc.addPage();
            cursorY = height - margin;
        }

        if (paragraph.trim() === '') {
            cursorY -= lineHeight;
            continue;
        }

        const words = paragraph.split(' ');
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const testLine = currentLine + word + ' ';
          const textWidth = timesRomanFont.widthOfTextAtSize(testLine, fontSize);

          if (textWidth > maxWidth && i > 0) {
            if (cursorY < margin) {
              page = pdfDoc.addPage();
              cursorY = height - margin;
            }
            
            page.drawText(currentLine.trim(), {
              x: margin,
              y: cursorY,
              size: fontSize,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });
            
            currentLine = word + ' ';
            cursorY -= lineHeight;
          } else {
            currentLine = testLine;
          }
        }

        if (currentLine.trim() !== '') {
          if (cursorY < margin) {
            page = pdfDoc.addPage();
            cursorY = height - margin;
          }
          
          page.drawText(currentLine.trim(), {
            x: margin,
            y: cursorY,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });
          cursorY -= lineHeight;
        }
        
        // Extra space after paragraph
        cursorY -= (lineHeight * 0.5);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title ? title.replace(/\s+/g, '_') : 'document'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF.');
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <nav className="text-sm mb-8 text-gray-500">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Text to PDF</span>
        </nav>

        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Text to PDF Converter</h1>
          <p className="text-gray-600">Convert your notes, essays, and text into a clean PDF document.</p>
        </header>

        <AdSlot format="horizontal" />

        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Title (Optional)</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Enter title here"
                className="w-full rounded-xl border border-gray-300 p-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
              <select 
                value={fontSize} 
                onChange={e => setFontSize(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 p-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value={12}>12pt (Standard)</option>
                <option value={14}>14pt (Medium)</option>
                <option value={16}>16pt (Large)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page Margins</label>
              <select 
                value={margin} 
                onChange={e => setMargin(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 p-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value={36}>Narrow (0.5 inch)</option>
                <option value={72}>Normal (1 inch)</option>
                <option value={108}>Wide (1.5 inch)</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Content</label>
            <textarea 
              value={text} 
              onChange={e => setText(e.target.value)} 
              placeholder="Type or paste your text here..."
              className="w-full h-96 rounded-xl border border-gray-300 p-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y font-serif"
            ></textarea>
          </div>
          
          <button 
            onClick={handleGeneratePdf} 
            disabled={isProcessing || (!text && !title)} 
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-8 py-4 font-bold text-lg disabled:opacity-50 transition-colors"
          >
            {isProcessing ? 'Generating PDF...' : 'Generate PDF'}
          </button>
        </div>

        <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4">How to Use</h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>(Optional) Enter a document title for the top of your PDF.</li>
            <li>Select your preferred font size and page margins.</li>
            <li>Type or paste your text content into the main text area.</li>
            <li>Click "Generate PDF" to automatically create and download your formatted PDF document.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
