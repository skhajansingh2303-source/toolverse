'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';
import RelatedTools from '@/components/RelatedTools';
import ToolResultCard from '@/components/ToolResultCard';

type MainTab = 'from-pdf' | 'to-pdf';
type FromPdfTarget = 'word' | 'text' | 'html' | 'images';
type ToPdfSource = 'images' | 'text' | 'html';

export default function PdfConverter() {
  const [mainTab, setMainTab] = useState<MainTab>('from-pdf');

  // Mode 1: PDF to Other Formats
  const [fromPdfFile, setFromPdfFile] = useState<File | null>(null);
  const [fromPdfPages, setFromPdfPages] = useState<number>(0);
  const [fromPdfTarget, setFromPdfTarget] = useState<FromPdfTarget>('word');
  const [fromPdfProgress, setFromPdfProgress] = useState<{ current: number; total: number } | null>(null);
  const [isConvertingFromPdf, setIsConvertingFromPdf] = useState(false);
  const [fromPdfSuccess, setFromPdfSuccess] = useState('');
  const [fromPdfError, setFromPdfError] = useState('');
  const [resultData, setResultData] = useState<{
    url: string;
    filename: string;
    size: number;
    previewUrl?: string;
    previewType?: 'pdf' | 'image' | 'text' | 'auto';
    previewText?: string;
    details?: { label: string; value: string | number }[];
  } | null>(null);

  // Mode 2: Other Formats to PDF
  const [toPdfSource, setToPdfSource] = useState<ToPdfSource>('images');
  const [toPdfImages, setToPdfImages] = useState<File[]>([]);
  const [toPdfText, setToPdfText] = useState<string>('');
  const [toPdfHtml, setToPdfHtml] = useState<string>(
    '<!DOCTYPE html>\n<html>\n<head>\n  <title>Document</title>\n  <style>\n    body { font-family: sans-serif; padding: 20px; line-height: 1.6; }\n    h1 { color: #4f46e5; }\n  </style>\n</head>\n<body>\n  <h1>My Converted Document</h1>\n  <p>This HTML document was converted to PDF 100% client-side with ToolsVerse.</p>\n</body>\n</html>'
  );
  const [isConvertingToPdf, setIsConvertingToPdf] = useState(false);
  const [toPdfSuccess, setToPdfSuccess] = useState('');
  const [toPdfError, setToPdfError] = useState('');

  const [pdfjsReady, setPdfjsReady] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfjsReady(true);
    }
  }, []);

  const handleScriptLoad = () => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfjsReady(true);
    }
  };

  // Upload handler for Mode 1 (From PDF)
  const handleFromPdfUpload = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFromPdfError('Please upload a valid PDF document.');
      return;
    }
    setFromPdfError('');
    setFromPdfSuccess('');
    setFromPdfFile(file);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setFromPdfPages(pdfDoc.getPageCount());
    } catch {
      setFromPdfPages(1);
    }
  };

  // Convert PDF to Word / Text / HTML / Images
  const handleConvertFromPdf = async () => {
    if (!fromPdfFile) return;
    setIsConvertingFromPdf(true);
    setFromPdfError('');
    setFromPdfSuccess('');
    setFromPdfProgress({ current: 0, total: fromPdfPages || 1 });

    const baseName = fromPdfFile.name.replace(/\.[^/.]+$/, '');

    try {
      const arrayBuffer = await fromPdfFile.arrayBuffer();

      // Ensure PDF.js is ready for text/image rendering
      let pdfDocProxy: any = null;
      if ((window as any).pdfjsLib) {
        pdfDocProxy = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      }

      const total = pdfDocProxy ? pdfDocProxy.numPages : fromPdfPages || 1;
      setFromPdfProgress({ current: 0, total });

      // TARGET: PLAIN TEXT (.txt)
      if (fromPdfTarget === 'text') {
        let fullText = '';
        if (pdfDocProxy) {
          for (let i = 1; i <= total; i++) {
            setFromPdfProgress({ current: i, total });
            const page = await pdfDocProxy.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;
          }
        } else {
          fullText = `Extracted Text from ${fromPdfFile.name}\n\n(PDF renderer initializing, please retry in a moment).`;
        }

        const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
        triggerDownload(blob, `${baseName}.txt`);
        setFromPdfSuccess(`Successfully converted PDF to Plain Text (${total} pages extracted)!`);
      }

      // TARGET: HTML (.html)
      else if (fromPdfTarget === 'html') {
        let pagesHtml = '';
        if (pdfDocProxy) {
          for (let i = 1; i <= total; i++) {
            setFromPdfProgress({ current: i, total });
            const page = await pdfDocProxy.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            pagesHtml += `
            <div class="page-container">
              <div class="page-header">Page ${i}</div>
              <p>${pageText.replace(/\n/g, '<br/>') || '<em>[Empty page or image-only content]</em>'}</p>
            </div>\n`;
          }
        }

        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${baseName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px 20px; line-height: 1.7; }
    .doc-wrapper { max-width: 800px; margin: 0 auto; }
    .page-container { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .page-header { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #6366f1; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="doc-wrapper">
    <h1>${baseName}</h1>
    ${pagesHtml}
  </div>
</body>
</html>`;

        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        triggerDownload(blob, `${baseName}.html`);
        setFromPdfSuccess(`Successfully converted PDF to responsive HTML (${total} pages)!`);
      }

      // TARGET: WORD (.docx / .doc)
      else if (fromPdfTarget === 'word') {
        let wordContent = '';
        if (pdfDocProxy) {
          for (let i = 1; i <= total; i++) {
            setFromPdfProgress({ current: i, total });
            const page = await pdfDocProxy.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            wordContent += `
            <div class="WordSection${i}">
              <p style="font-size: 10pt; color: #666666; border-bottom: 1px solid #cccccc; padding-bottom: 4pt; margin-bottom: 12pt;">
                Page ${i}
              </p>
              <p style="font-size: 12pt; line-height: 1.5; color: #000000;">
                ${pageText.replace(/\n/g, '</p><p style="font-size: 12pt; line-height: 1.5;">') || 'Empty Page'}
              </p>
            </div>
            ${i < total ? '<br clear="all" style="page-break-before:always" />' : ''}
            `;
          }
        }

        // Standard Microsoft Word HTML format with Word XML markup
        const wordDocument = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${baseName}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; }
            p { margin-bottom: 10pt; line-height: 1.15; }
          </style>
        </head>
        <body>
          <h1 style="font-size: 20pt; color: #2b579a; margin-bottom: 16pt;">${baseName}</h1>
          ${wordContent}
        </body>
        </html>
        `;

        const blob = new Blob(['\ufeff' + wordDocument], { type: 'application/msword' });
        triggerDownload(blob, `${baseName}.doc`);
        setFromPdfSuccess(`Successfully converted PDF to Word Document (${total} pages formatted)!`);
      }

      // TARGET: IMAGES (.zip)
      else if (fromPdfTarget === 'images') {
        if (!pdfDocProxy) {
          throw new Error('PDF Image rendering engine is still loading. Please try again.');
        }

        const zip = new JSZip();
        const imgFolder = zip.folder(`${baseName}_images`) || zip;

        for (let i = 1; i <= total; i++) {
          setFromPdfProgress({ current: i, total });
          const page = await pdfDocProxy.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // 2x crisp DPI

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          await page.render({ canvasContext: ctx, viewport }).promise;

          const dataUrl = canvas.toDataURL('image/png');
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          const pageNum = String(i).padStart(total >= 100 ? 3 : 2, '0');
          imgFolder.file(`page_${pageNum}.png`, base64Data, { base64: true });
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        triggerDownload(zipBlob, `${baseName}_images.zip`);
        setFromPdfSuccess(`Successfully rendered and downloaded ${total} pages in ZIP archive!`);
      }
    } catch (err: any) {
      console.error(err);
      setFromPdfError('Conversion failed: ' + (err.message || 'Unknown error.'));
    } finally {
      setIsConvertingFromPdf(false);
      setFromPdfProgress(null);
    }
  };

  // Convert Images / Text / HTML into PDF
  const handleConvertToPdf = async () => {
    setIsConvertingToPdf(true);
    setToPdfError('');
    setToPdfSuccess('');

    try {
      // 1. IMAGES TO PDF
      if (toPdfSource === 'images') {
        if (toPdfImages.length === 0) {
          throw new Error('Please select at least one image to convert.');
        }

        const pdfDoc = await PDFDocument.create();

        for (const imgFile of toPdfImages) {
          const imgBuffer = await imgFile.arrayBuffer();
          let embeddedImage: any;

          if (imgFile.type === 'image/jpeg' || imgFile.name.toLowerCase().endsWith('.jpg') || imgFile.name.toLowerCase().endsWith('.jpeg')) {
            embeddedImage = await pdfDoc.embedJpg(imgBuffer);
          } else if (imgFile.type === 'image/png' || imgFile.name.toLowerCase().endsWith('.png')) {
            embeddedImage = await pdfDoc.embedPng(imgBuffer);
          } else {
            // For WebP / other, draw onto canvas first
            const imgBitmap = await createImageBitmap(imgFile);
            const canvas = document.createElement('canvas');
            canvas.width = imgBitmap.width;
            canvas.height = imgBitmap.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(imgBitmap, 0, 0);
            const pngData = canvas.toDataURL('image/png');
            embeddedImage = await pdfDoc.embedPng(pngData);
          }

          const imgDims = embeddedImage.scale(1);
          // Standard A4 or fit image dimensions
          const page = pdfDoc.addPage([imgDims.width, imgDims.height]);
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: imgDims.width,
            height: imgDims.height,
          });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
        triggerDownload(blob, `converted_images_${Date.now()}.pdf`);
        setToPdfSuccess(`Successfully compiled ${toPdfImages.length} images into PDF!`);
      }

      // 2. TEXT TO PDF
      else if (toPdfSource === 'text') {
        if (!toPdfText.trim()) {
          throw new Error('Please enter or upload some text to convert to PDF.');
        }

        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 11;
        const lineHeight = 16;
        const margin = 50;
        const pageWidth = 595.28; // A4
        const pageHeight = 841.89; // A4
        const usableWidth = pageWidth - margin * 2;
        const usableHeight = pageHeight - margin * 2;
        const maxLinesPerPage = Math.floor(usableHeight / lineHeight);

        // Simple text wrapping
        const lines: string[] = [];
        const paragraphs = toPdfText.split('\n');

        for (const p of paragraphs) {
          if (!p.trim()) {
            lines.push('');
            continue;
          }
          const words = p.split(' ');
          let currentLine = '';

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const textWidth = font.widthOfTextAtSize(testLine, fontSize);
            if (textWidth < usableWidth) {
              currentLine = testLine;
            } else {
              lines.push(currentLine);
              currentLine = word;
            }
          }
          if (currentLine) lines.push(currentLine);
        }

        // Paginate
        for (let i = 0; i < lines.length; i += maxLinesPerPage) {
          const pageLines = lines.slice(i, i + maxLinesPerPage);
          const page = pdfDoc.addPage([pageWidth, pageHeight]);

          pageLines.forEach((line, lineIdx) => {
            const y = pageHeight - margin - lineIdx * lineHeight;
            page.drawText(line, {
              x: margin,
              y,
              size: fontSize,
              font,
              color: rgb(0.1, 0.1, 0.1),
            });
          });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
        triggerDownload(blob, `converted_text_${Date.now()}.pdf`);
        setToPdfSuccess(`Successfully converted text into paginated PDF!`);
      }

      // 3. HTML TO PDF
      else if (toPdfSource === 'html') {
        if (!toPdfHtml.trim()) {
          throw new Error('Please enter valid HTML code to convert.');
        }

        // Isolated iframe printing to PDF
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        document.body.appendChild(printFrame);

        const frameDoc = printFrame.contentWindow?.document;
        if (frameDoc) {
          frameDoc.open();
          frameDoc.write(toPdfHtml);
          frameDoc.close();
          setTimeout(() => {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
            setTimeout(() => {
              document.body.removeChild(printFrame);
            }, 1000);
          }, 300);
          setToPdfSuccess('Print-to-PDF dialog initiated! Select "Save as PDF" to complete.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setToPdfError('Conversion failed: ' + (err.message || 'Unknown error.'));
    } finally {
      setIsConvertingToPdf(false);
    }
  };

  const triggerDownload = (blob: Blob, filename: string, extra?: { previewText?: string; previewType?: 'pdf' | 'image' | 'text' | 'auto'; details?: { label: string; value: string | number }[] }) => {
    const url = URL.createObjectURL(blob);
    if (resultData?.url) {
      URL.revokeObjectURL(resultData.url);
    }
    const isZip = filename.toLowerCase().endsWith('.zip');
    const isPdf = filename.toLowerCase().endsWith('.pdf');
    const isTxt = filename.toLowerCase().endsWith('.txt');
    const pType = extra?.previewType || (isPdf ? 'pdf' : isTxt ? 'text' : 'auto');

    setResultData({
      url,
      filename,
      size: blob.size,
      previewUrl: isZip ? undefined : url,
      previewType: pType,
      previewText: extra?.previewText,
      details: extra?.details || [],
    });

    window.dispatchEvent(
      new CustomEvent('toolsverse-toast', {
        detail: { message: `✅ Conversion finished! Preview & download ready below.` },
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      {/* PDF.js script */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={handleScriptLoad}
      />

      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex items-center text-xs font-medium text-gray-500 dark:text-slate-400">
            <li className="flex items-center">
              <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Home
              </Link>
              <svg className="w-3 h-3 mx-2 text-gray-400 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </li>
            <li className="text-gray-800 dark:text-white font-semibold">PDF Converter</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Universal PDF Converter</h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">
            Convert PDF files into Word documents, plain text, HTML, or high-res images, or convert documents into PDF 100% free.
          </p>
        </div>

        {/* AdSlot */}
        <div className="mb-8">
          <AdSlot format="horizontal" />
        </div>

        {/* Live Result Card with Preview First & Prominent Download Button */}
        {resultData && (
          <ToolResultCard
            title="Conversion Completed Successfully!"
            filename={resultData.filename}
            downloadUrl={resultData.url}
            fileSize={resultData.size}
            previewUrl={resultData.previewUrl}
            previewType={resultData.previewType}
            previewText={resultData.previewText}
            details={resultData.details}
            onReset={() => {
              if (resultData.url) URL.revokeObjectURL(resultData.url);
              setResultData(null);
            }}
            resetButtonText="Convert Another File"
            nextTool={{
              name: 'Compress PDF',
              url: '/tools/optimize-pdf/compress-pdf',
              description: 'Optimize and shrink the file size of your converted documents.'
            }}
          />
        )}

        {/* Main Hub Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-800 mb-8">
          <button
            onClick={() => setMainTab('from-pdf')}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              mainTab === 'from-pdf'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400'
            }`}
          >
            <span>📄 PDF to Other Formats</span>
          </button>
          <button
            onClick={() => setMainTab('to-pdf')}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              mainTab === 'to-pdf'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400'
            }`}
          >
            <span>🔄 Other Formats to PDF</span>
          </button>
        </div>

        {/* TAB 1: PDF TO OTHER FORMATS */}
        {mainTab === 'from-pdf' && (
          <div className="space-y-6">
            {!fromPdfFile ? (
              /* Dropzone */
              <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 bg-white dark:bg-slate-900 rounded-3xl p-12 text-center transition-all group shadow-sm">
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFromPdfUpload(e.target.files[0]);
                    e.target.value = '';
                  }}
                  title=""
                />
                <div className="pointer-events-none flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                    📄
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Upload PDF Document to Convert
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-md mb-5">
                    Select a PDF to convert into Word, Text, HTML, or Images.
                  </p>
                  <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all inline-block">
                    Browse Files
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
                {/* File info banner */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold">
                      PDF
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-sm">
                        {fromPdfFile.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {(fromPdfFile.size / (1024 * 1024)).toFixed(2)} MB • {fromPdfPages} page{fromPdfPages === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFromPdfFile(null);
                      setFromPdfPages(0);
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    Remove
                  </button>
                </div>

                {/* Target Format Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">
                    Select Output Format:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        id: 'word',
                        name: 'Word (.doc)',
                        icon: '📝',
                        badge: 'Editable',
                        desc: 'Full document with text & layout for Microsoft Word',
                      },
                      {
                        id: 'text',
                        name: 'Plain Text (.txt)',
                        icon: '📋',
                        badge: 'Lightweight',
                        desc: 'Clean text extracted page by page',
                      },
                      {
                        id: 'html',
                        name: 'Webpage (.html)',
                        icon: '🌐',
                        badge: 'Universal',
                        desc: 'Responsive HTML document with CSS styling',
                      },
                      {
                        id: 'images',
                        name: 'Images (.zip)',
                        icon: '🖼️',
                        badge: 'High-Res',
                        desc: 'Every page rendered as crisp PNG in a ZIP archive',
                      },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => setFromPdfTarget(fmt.id as FromPdfTarget)}
                        className={`p-5 rounded-2xl border text-left transition-all relative ${
                          fromPdfTarget === fmt.id
                            ? 'border-primary-600 bg-primary-50/40 dark:bg-primary-950/30 dark:border-primary-500 ring-2 ring-primary-500/20 shadow-xs'
                            : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{fmt.icon}</span>
                          <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded">
                            {fmt.badge}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                          {fmt.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {fmt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress bar if converting */}
                {fromPdfProgress && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                      <span>Converting document...</span>
                      <span>
                        Page {fromPdfProgress.current} of {fromPdfProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary-600 h-2 transition-all duration-300"
                        style={{
                          width: `${Math.round(
                            (fromPdfProgress.current / Math.max(1, fromPdfProgress.total)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Error & Success Messages */}
                {fromPdfError && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs sm:text-sm text-red-600 dark:text-red-400">
                    {fromPdfError}
                  </div>
                )}
                {fromPdfSuccess && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                    {fromPdfSuccess}
                  </div>
                )}

                {/* Convert Action */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleConvertFromPdf}
                    disabled={isConvertingFromPdf}
                    className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isConvertingFromPdf ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>Converting...</span>
                      </>
                    ) : (
                      <span>Convert & Download Now</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OTHER FORMATS TO PDF */}
        {mainTab === 'to-pdf' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Sub-format Switcher */}
            <div className="flex flex-wrap gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
              {[
                { id: 'images', label: '🖼️ Image(s) to PDF' },
                { id: 'text', label: '📋 Text to PDF' },
                { id: 'html', label: '🌐 HTML to PDF' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setToPdfSource(s.id as ToPdfSource)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    toPdfSource === s.id
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Sub-format 1: Images to PDF */}
            {toPdfSource === 'images' && (
              <div className="space-y-4">
                <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 rounded-2xl p-8 text-center bg-gray-50/50 dark:bg-slate-950/40 group">
                  <input
                    ref={imgInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        setToPdfImages((prev) => [...prev, ...newFiles]);
                      }
                      e.target.value = '';
                    }}
                    title=""
                  />
                  <div className="pointer-events-none flex flex-col items-center">
                    <div className="text-3xl mb-2">📸</div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                      Choose Images (JPG, PNG, WebP)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
                      Select multiple images to combine into a multi-page PDF
                    </p>
                    <span className="px-5 py-2 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block">
                      Browse Images
                    </span>
                  </div>
                </div>

                {toPdfImages.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300">
                      <span>Selected Images ({toPdfImages.length})</span>
                      <button
                        onClick={() => setToPdfImages([])}
                        className="text-red-500 hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {toPdfImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative p-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 text-center"
                        >
                          <span className="text-[10px] font-bold text-primary-600 block mb-1">
                            Page {idx + 1}
                          </span>
                          <p className="text-xs truncate font-medium text-gray-900 dark:text-white">
                            {img.name}
                          </p>
                          <button
                            onClick={() =>
                              setToPdfImages((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-[10px] text-red-500 hover:underline mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sub-format 2: Text to PDF */}
            {toPdfSource === 'text' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Enter or Paste Plain Text:
                </label>
                <textarea
                  rows={8}
                  value={toPdfText}
                  onChange={(e) => setToPdfText(e.target.value)}
                  placeholder="Paste your text here. The tool will automatically paginate and wrap text into formatted PDF pages..."
                  className="w-full rounded-2xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-xs sm:text-sm text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            )}

            {/* Sub-format 3: HTML to PDF */}
            {toPdfSource === 'html' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Custom HTML / CSS Code:
                </label>
                <textarea
                  rows={8}
                  value={toPdfHtml}
                  onChange={(e) => setToPdfHtml(e.target.value)}
                  placeholder="Paste HTML code here..."
                  className="w-full rounded-2xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-xs font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            )}

            {/* Error / Success Messages */}
            {toPdfError && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs sm:text-sm text-red-600 dark:text-red-400">
                {toPdfError}
              </div>
            )}
            {toPdfSuccess && (
              <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                {toPdfSuccess}
              </div>
            )}

            {/* Convert to PDF Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleConvertToPdf}
                disabled={isConvertingToPdf}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isConvertingToPdf ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <span>Convert & Download PDF</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* How to Use */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">How to Use Universal PDF Converter</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Choose Direction</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Select whether you want to convert a PDF into other formats or convert files into a PDF document.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Upload Files</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Drag and drop your PDF or source files (images, text, HTML) using the full-screen upload dropzone.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Select Format</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Choose Word (.doc), Plain Text (.txt), HTML, or Images (.zip) based on your document needs.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Instant Download</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Processing completes instantly client-side and triggers a direct 1-click download with zero upload lag.
              </p>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-8">
          <RelatedTools currentSlug="pdf-converter" />
        </div>
      </div>
    </div>
  );
}
