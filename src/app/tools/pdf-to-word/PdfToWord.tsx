'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

interface DocBlock {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bullet' | 'table';
  text?: string;
  isBold?: boolean;
  rows?: string[][];
  pageIndex: number;
}

interface PageData {
  pageNumber: number;
  blocks: DocBlock[];
}

export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [pdfjsLoaded, setPdfjsLoaded] = useState<boolean>(false);
  const [pages, setPages] = useState<PageData[]>([]);
  const [docTitle, setDocTitle] = useState<string>('Document');
  const [fontFamily, setFontFamily] = useState<'Calibri' | 'Aptos' | 'Times New Roman' | 'Arial'>('Calibri');
  const [fontSize, setFontSize] = useState<number>(11);
  const [includePageBreaks, setIncludePageBreaks] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [editableText, setEditableText] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfjsLoaded(true);
    }
  }, []);

  const handleScriptLoad = () => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfjsLoaded(true);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocTitle(cleanName || 'Document');
      setPages([]);
      setEditableText('');
      setProgress({ current: 0, total: 0 });
    }
  };

  const parsePdfDocument = async () => {
    if (!file || !(window as any).pdfjsLib) return;
    setIsProcessing(true);
    setPages([]);
    setProgress({ current: 0, total: 0 });

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await (window as any).pdfjsLib.getDocument({ data: buffer }).promise;
      const numPages = pdf.numPages;
      setProgress({ current: 0, total: numPages });

      // Pass 1: Baseline font size estimation
      const allFontHeights: number[] = [];
      for (let i = 1; i <= Math.min(numPages, 5); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        textContent.items.forEach((it: any) => {
          if (it.str && it.str.trim()) {
            const size = Math.abs(it.transform[0]) || Math.abs(it.transform[3]) || 12;
            allFontHeights.push(size);
          }
        });
      }
      allFontHeights.sort((a, b) => a - b);
      const medianFontSize =
        allFontHeights.length > 0 ? allFontHeights[Math.floor(allFontHeights.length / 2)] : 12;

      const extractedPages: PageData[] = [];
      let fullEditableString = '';

      // Pass 2: Page by page structure extraction
      for (let pNum = 1; pNum <= numPages; pNum++) {
        const page = await pdf.getPage(pNum);
        const textContent = await page.getTextContent();
        const rawItems = textContent.items as any[];

        // Cluster items into lines based on Y-coordinate tolerance
        const lineBuckets: { [yKey: number]: any[] } = {};
        rawItems.forEach((item) => {
          if (!item.str || !item.str.trim()) return;
          const y = item.transform[5];
          let matchedKey: number | null = null;
          for (const k of Object.keys(lineBuckets)) {
            const numK = parseFloat(k);
            if (Math.abs(numK - y) <= 4.0) {
              matchedKey = numK;
              break;
            }
          }
          if (matchedKey !== null) {
            lineBuckets[matchedKey].push(item);
          } else {
            lineBuckets[y] = [item];
          }
        });

        const sortedY = Object.keys(lineBuckets)
          .map((k) => parseFloat(k))
          .sort((a, b) => b - a);

        const pageBlocks: DocBlock[] = [];
        let tableBuffer: string[][] = [];

        const flushTableBuffer = () => {
          if (tableBuffer.length > 0) {
            pageBlocks.push({
              type: 'table',
              rows: [...tableBuffer],
              pageIndex: pNum,
            });
            tableBuffer = [];
          }
        };

        sortedY.forEach((y) => {
          const items = lineBuckets[y];
          items.sort((a, b) => a.transform[4] - b.transform[4]);

          let lineText = '';
          let maxLineFontSize = 0;
          let isLineBold = false;

          items.forEach((it, idx) => {
            const fontH = Math.abs(it.transform[0]) || Math.abs(it.transform[3]) || 12;
            if (fontH > maxLineFontSize) maxLineFontSize = fontH;

            const fn = (it.fontName || '').toLowerCase();
            if (fn.includes('bold') || fn.includes('black') || fn.includes('heavy') || fn.includes('700')) {
              isLineBold = true;
            }

            if (idx > 0) {
              const prev = items[idx - 1];
              const prevRight = prev.transform[4] + (prev.width || 0);
              if (it.transform[4] - prevRight > 3) {
                lineText += ' ';
              }
            }
            lineText += it.str;
          });

          const cleanStr = lineText.trim();
          if (!cleanStr) return;

          // Check if line represents a tabular row (2 or more distinct columns separated by spacing)
          const cols = cleanStr.split(/\s{2,}|\t/).map((c) => c.trim()).filter(Boolean);
          if (cols.length >= 2 && cleanStr.length > 8) {
            tableBuffer.push(cols);
            return;
          } else {
            flushTableBuffer();
          }

          // Bullet list check
          if (/^[\u2022\u25E6\u2023\u25AA\-\*]\s+/.test(cleanStr)) {
            pageBlocks.push({
              type: 'bullet',
              text: cleanStr.replace(/^[\u2022\u25E6\u2023\u25AA\-\*]\s+/, ''),
              isBold: isLineBold,
              pageIndex: pNum,
            });
            return;
          }

          // Heading classification based on relative font size
          if (maxLineFontSize >= medianFontSize * 1.55) {
            pageBlocks.push({
              type: 'heading1',
              text: cleanStr,
              isBold: true,
              pageIndex: pNum,
            });
          } else if (maxLineFontSize >= medianFontSize * 1.25) {
            pageBlocks.push({
              type: 'heading2',
              text: cleanStr,
              isBold: true,
              pageIndex: pNum,
            });
          } else if (maxLineFontSize >= medianFontSize * 1.1 && cleanStr.length < 90) {
            pageBlocks.push({
              type: 'heading3',
              text: cleanStr,
              isBold: true,
              pageIndex: pNum,
            });
          } else {
            pageBlocks.push({
              type: 'paragraph',
              text: cleanStr,
              isBold: isLineBold,
              pageIndex: pNum,
            });
          }
        });

        flushTableBuffer();

        extractedPages.push({
          pageNumber: pNum,
          blocks: pageBlocks,
        });

        // Add to editable representation
        fullEditableString += `--- Page ${pNum} ---\n`;
        pageBlocks.forEach((b) => {
          if (b.type === 'table' && b.rows) {
            b.rows.forEach((r) => {
              fullEditableString += r.join('\t') + '\n';
            });
          } else if (b.type === 'bullet') {
            fullEditableString += `• ${b.text}\n`;
          } else if (b.type.startsWith('heading')) {
            fullEditableString += `# ${b.text}\n`;
          } else {
            fullEditableString += `${b.text}\n\n`;
          }
        });
        fullEditableString += '\n';

        setProgress({ current: pNum, total: numPages });
      }

      setPages(extractedPages);
      setEditableText(fullEditableString);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('toolsverse-toast', {
            detail: { message: `Successfully converted ${numPages} PDF pages to Word!` },
          })
        );
      }
    } catch (err) {
      console.error('Error converting PDF to Word:', err);
      alert('Failed to parse PDF document. Please try another PDF file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const escapeXml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const buildDocxXml = (): string => {
    let bodyContent = '';

    pages.forEach((page, pIdx) => {
      // If page breaks are requested and this is not the first page, insert page break
      if (includePageBreaks && pIdx > 0) {
        bodyContent += `
          <w:p>
            <w:r>
              <w:br w:type="page"/>
            </w:r>
          </w:p>`;
      }

      page.blocks.forEach((block) => {
        if (block.type === 'heading1') {
          bodyContent += `
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Heading1"/>
                <w:spacing w:before="280" w:after="120"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="${fontFamily}" w:hAnsi="${fontFamily}"/>
                  <w:b/>
                  <w:sz w:val="${Math.round(fontSize * 2 * 1.6)}"/>
                  <w:color w:val="1E293B"/>
                </w:rPr>
                <w:t xml:space="preserve">${escapeXml(block.text || '')}</w:t>
              </w:r>
            </w:p>`;
        } else if (block.type === 'heading2') {
          bodyContent += `
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Heading2"/>
                <w:spacing w:before="240" w:after="100"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="${fontFamily}" w:hAnsi="${fontFamily}"/>
                  <w:b/>
                  <w:sz w:val="${Math.round(fontSize * 2 * 1.3)}"/>
                  <w:color w:val="334155"/>
                </w:rPr>
                <w:t xml:space="preserve">${escapeXml(block.text || '')}</w:t>
              </w:r>
            </w:p>`;
        } else if (block.type === 'heading3') {
          bodyContent += `
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Heading3"/>
                <w:spacing w:before="200" w:after="80"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="${fontFamily}" w:hAnsi="${fontFamily}"/>
                  <w:b/>
                  <w:sz w:val="${Math.round(fontSize * 2 * 1.1)}"/>
                  <w:color w:val="475569"/>
                </w:rPr>
                <w:t xml:space="preserve">${escapeXml(block.text || '')}</w:t>
              </w:r>
            </w:p>`;
        } else if (block.type === 'bullet') {
          bodyContent += `
            <w:p>
              <w:pPr>
                <w:pStyle w:val="ListBullet"/>
                <w:ind w:left="720" w:hanging="360"/>
                <w:spacing w:after="80"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="${fontFamily}" w:hAnsi="${fontFamily}"/>
                  <w:sz w:val="${fontSize * 2}"/>
                </w:rPr>
                <w:t xml:space="preserve">•  ${escapeXml(block.text || '')}</w:t>
              </w:r>
            </w:p>`;
        } else if (block.type === 'table' && block.rows && block.rows.length > 0) {
          bodyContent += `
            <w:tbl>
              <w:tblPr>
                <w:tblStyle w:val="TableGrid"/>
                <w:tblW w:w="0" w:type="auto"/>
                <w:tblBorders>
                  <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                  <w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                  <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
                  <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
                </w:tblBorders>
              </w:tblPr>`;

          block.rows.forEach((row, rIdx) => {
            bodyContent += `<w:tr>`;
            row.forEach((cell) => {
              const isHeader = rIdx === 0;
              bodyContent += `
                <w:tc>
                  <w:tcPr>
                    <w:tcMar>
                      <w:top w:w="120" w:type="dxa"/>
                      <w:left w:w="160" w:type="dxa"/>
                      <w:bottom w:w="120" w:type="dxa"/>
                      <w:right w:w="160" w:type="dxa"/>
                    </w:tcMar>
                    ${isHeader ? '<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>' : ''}
                  </w:tcPr>
                  <w:p>
                    <w:r>
                      <w:rPr>
                        <w:rFonts w:ascii="${fontFamily}" w:hAnsi="${fontFamily}"/>
                        ${isHeader ? '<w:b/>' : ''}
                        <w:sz w:val="${Math.max(fontSize * 2 - 2, 16)}"/>
                      </w:rPr>
                      <w:t xml:space="preserve">${escapeXml(cell)}</w:t>
                    </w:r>
                  </w:p>
                </w:tc>`;
            });
            bodyContent += `</w:tr>`;
          });

          bodyContent += `</w:tbl>`;
        } else {
          // Standard Paragraph
          bodyContent += `
            <w:p>
              <w:pPr>
                <w:spacing w:after="140" w:line="276" w:lineRule="auto"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="${fontFamily}" w:hAnsi="${fontFamily}"/>
                  ${block.isBold ? '<w:b/>' : ''}
                  <w:sz w:val="${fontSize * 2}"/>
                  <w:color w:val="1E293B"/>
                </w:rPr>
                <w:t xml:space="preserve">${escapeXml(block.text || '')}</w:t>
              </w:r>
            </w:p>`;
        }
      });
    });

    // Section properties (standard Letter / A4 portrait page margins: 1 inch = 1440 dxa)
    bodyContent += `
      <w:sectPr>
        <w:pgSz w:w="11906" w:h="16838"/>
        <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
        <w:cols w:space="720"/>
        <w:docGrid w:linePitch="360"/>
      </w:sectPr>`;

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${bodyContent}
  </w:body>
</w:document>`;
  };

  const downloadDocx = async () => {
    if (pages.length === 0) return;

    try {
      const zip = new JSZip();

      // [Content_Types].xml
      zip.file(
        '[Content_Types].xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`
      );

      // _rels/.rels
      zip.file(
        '_rels/.rels',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
      );

      // word/_rels/document.xml.rels
      zip.file(
        'word/_rels/document.xml.rels',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
      );

      // word/styles.xml
      zip.file(
        'word/styles.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="${fontFamily}" w:hAnsi="${fontFamily}" w:cs="${fontFamily}"/>
        <w:sz w:val="${fontSize * 2}"/>
        <w:color w:val="1E293B"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:rPr>
      <w:b/>
      <w:sz w:val="${Math.round(fontSize * 2 * 1.6)}"/>
      <w:color w:val="1E293B"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:rPr>
      <w:b/>
      <w:sz w:val="${Math.round(fontSize * 2 * 1.3)}"/>
      <w:color w:val="334155"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:rPr>
      <w:b/>
      <w:sz w:val="${Math.round(fontSize * 2 * 1.1)}"/>
      <w:color w:val="475569"/>
    </w:rPr>
  </w:style>
  <w:style w:type="table" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/>
    <w:basedOn w:val="TableNormal"/>
    <w:qFormat/>
  </w:style>
</w:styles>`
      );

      // word/document.xml
      zip.file('word/document.xml', buildDocxXml());

      const blob = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docTitle.trim() || 'converted-document'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating docx:', err);
      alert('Failed to generate Word document.');
    }
  };

  const downloadWordDocHtml = () => {
    if (pages.length === 0) return;

    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${docTitle}</title>
      <style>
        body { font-family: '${fontFamily}', Arial, sans-serif; font-size: ${fontSize}pt; line-height: 1.5; color: #1e293b; padding: 40px; }
        h1 { font-size: ${fontSize * 1.6}pt; color: #0f172a; margin-top: 24px; margin-bottom: 12px; }
        h2 { font-size: ${fontSize * 1.3}pt; color: #1e293b; margin-top: 20px; margin-bottom: 10px; }
        h3 { font-size: ${fontSize * 1.1}pt; color: #334155; margin-top: 16px; margin-bottom: 8px; }
        p { margin-bottom: 12px; }
        ul { margin-bottom: 12px; padding-left: 24px; }
        li { margin-bottom: 6px; }
        table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
        th { background-color: #f1f5f9; font-weight: bold; }
        .page-break { page-break-after: always; }
      </style>
      </head><body>`;

    pages.forEach((p, idx) => {
      if (idx > 0 && includePageBreaks) {
        htmlContent += `<div class="page-break"></div>`;
      }
      p.blocks.forEach((b) => {
        if (b.type === 'heading1') htmlContent += `<h1>${escapeXml(b.text || '')}</h1>`;
        else if (b.type === 'heading2') htmlContent += `<h2>${escapeXml(b.text || '')}</h2>`;
        else if (b.type === 'heading3') htmlContent += `<h3>${escapeXml(b.text || '')}</h3>`;
        else if (b.type === 'bullet') htmlContent += `<ul><li>${escapeXml(b.text || '')}</li></ul>`;
        else if (b.type === 'table' && b.rows) {
          htmlContent += `<table>`;
          b.rows.forEach((r, rIdx) => {
            htmlContent += `<tr>`;
            r.forEach((c) => {
              if (rIdx === 0) htmlContent += `<th>${escapeXml(c)}</th>`;
              else htmlContent += `<td>${escapeXml(c)}</td>`;
            });
            htmlContent += `</tr>`;
          });
          htmlContent += `</table>`;
        } else {
          htmlContent += `<p>${b.isBold ? `<strong>${escapeXml(b.text || '')}</strong>` : escapeXml(b.text || '')}</p>`;
        }
      });
    });

    htmlContent += `</body></html>`;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.trim() || 'converted-document'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyAllText = () => {
    if (!editableText) return;
    navigator.clipboard.writeText(editableText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const totalWords = editableText.split(/\s+/).filter(Boolean).length;
  const totalCharacters = editableText.length;
  const totalTables = pages.reduce(
    (acc, p) => acc + p.blocks.filter((b) => b.type === 'table').length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={handleScriptLoad}
      />

      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="text-sm mb-8 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">PDF to Word</span>
        </nav>

        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-xs font-semibold text-primary-700 dark:text-primary-300 mb-3">
            <span>✨ Authentic Microsoft Word DOCX Converter</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            PDF to Word Converter
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Convert PDF documents into fully editable Microsoft Word (.docx) documents with intact
            paragraphs, structural headings, tables, and typography.
          </p>
        </header>

        {/* Horizontal AdSlot */}
        <AdSlot format="horizontal" />

        {/* File Dropzone */}
        {!file ? (
          <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-3xl p-12 transition-all group bg-white dark:bg-slate-900 shadow-sm mb-8">
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                handleFile(e);
                e.target.value = '';
              }}
            />
            <div className="pointer-events-none flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-3xl text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                📄
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Choose PDF to Convert to Word
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
                Drag and drop your PDF here or click anywhere to browse
              </p>
              <span className="px-6 py-3 bg-primary-600 group-hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all inline-block">
                Browse Files
              </span>
              <span className="text-[11px] text-gray-400 dark:text-slate-500 mt-4">
                100% Client-Side Private • No server upload • Instant conversion
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold">
                  W
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    {file.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setFile(null);
                    setPages([]);
                    setEditableText('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Change File
                </button>
                {pages.length === 0 && (
                  <button
                    onClick={parsePdfDocument}
                    disabled={isProcessing || !pdfjsLoaded}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-md disabled:opacity-50 transition-all active:scale-95"
                  >
                    {isProcessing ? 'Converting...' : !pdfjsLoaded ? 'Loading Engine...' : 'Convert to Word (.docx)'}
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="py-8 max-w-md mx-auto space-y-3 text-center">
                <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-slate-300">
                  <span>Analyzing page {progress.current} of {progress.total}...</span>
                  <span>{progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-600 to-indigo-600 h-full transition-all duration-200 rounded-full"
                    style={{
                      width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Extracting typography, tables, and paragraphs client-side...
                </p>
              </div>
            )}

            {/* Converted Document Workspace */}
            {pages.length > 0 && (
              <div className="mt-6 space-y-6">
                {/* Document Options & Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                      Word Font Family
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as any)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    >
                      <option value="Calibri">Calibri (Modern Office)</option>
                      <option value="Aptos">Aptos (Default M365)</option>
                      <option value="Times New Roman">Times New Roman (Academic)</option>
                      <option value="Arial">Arial (Clean Sans)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                      Base Font Size
                    </label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    >
                      <option value={10}>10 pt (Compact)</option>
                      <option value={11}>11 pt (Standard Word)</option>
                      <option value={12}>12 pt (Large)</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2 text-xs font-medium text-gray-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={includePageBreaks}
                        onChange={(e) => setIncludePageBreaks(e.target.checked)}
                        className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                      />
                      <span>Preserve Page Breaks</span>
                    </label>
                  </div>
                </div>

                {/* Quick Stats Pill */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 dark:text-slate-300 bg-blue-50/60 dark:bg-blue-950/30 px-4 py-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50">
                  <div className="flex items-center gap-4">
                    <span>📄 <strong>{pages.length}</strong> Pages</span>
                    <span>📝 <strong>{totalWords}</strong> Words</span>
                    <span>🔡 <strong>{totalCharacters}</strong> Characters</span>
                    {totalTables > 0 && (
                      <span className="text-primary-600 dark:text-primary-400 font-semibold">
                        📊 <strong>{totalTables}</strong> Tables Detected
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                        activeTab === 'preview'
                          ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-xs'
                          : 'hover:bg-blue-100/50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Live Word View
                    </button>
                    <button
                      onClick={() => setActiveTab('edit')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                        activeTab === 'edit'
                          ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-xs'
                          : 'hover:bg-blue-100/50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Raw Text Editor
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={downloadDocx}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-3 font-semibold shadow-md transition-all active:scale-95"
                  >
                    <span>📥 Download .docx</span>
                    <span className="text-xs bg-primary-800 px-2 py-0.5 rounded-md font-mono">Word 2016-365</span>
                  </button>

                  <button
                    onClick={downloadWordDocHtml}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white rounded-xl px-5 py-3 font-semibold transition-colors"
                  >
                    <span>Download .doc (HTML)</span>
                  </button>

                  <button
                    onClick={copyAllText}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 text-sm font-semibold transition-colors"
                  >
                    <span>{copied ? '✓ Copied!' : '📋 Copy Text'}</span>
                  </button>
                </div>

                {/* Tab 1: Live Split/Word Preview */}
                {activeTab === 'preview' ? (
                  <div className="border border-gray-300 dark:border-slate-700 rounded-2xl bg-gray-200 dark:bg-slate-950 p-4 sm:p-8 max-h-[600px] overflow-y-auto space-y-8">
                    {pages.map((p) => (
                      <div
                        key={p.pageNumber}
                        className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg shadow-md p-8 sm:p-12 mx-auto max-w-2xl min-h-[500px] relative border border-gray-200 dark:border-slate-800"
                        style={{ fontFamily }}
                      >
                        <div className="absolute top-3 right-4 text-[10px] font-mono text-gray-400">
                          Page {p.pageNumber} of {pages.length}
                        </div>

                        <div className="space-y-3">
                          {p.blocks.map((block, bIdx) => {
                            if (block.type === 'heading1') {
                              return (
                                <h1
                                  key={bIdx}
                                  className="font-bold text-gray-900 dark:text-white mt-4 mb-2 text-xl sm:text-2xl"
                                >
                                  {block.text}
                                </h1>
                              );
                            }
                            if (block.type === 'heading2') {
                              return (
                                <h2
                                  key={bIdx}
                                  className="font-bold text-gray-800 dark:text-slate-200 mt-3 mb-2 text-lg sm:text-xl"
                                >
                                  {block.text}
                                </h2>
                              );
                            }
                            if (block.type === 'heading3') {
                              return (
                                <h3
                                  key={bIdx}
                                  className="font-semibold text-gray-700 dark:text-slate-300 mt-2 mb-1 text-base"
                                >
                                  {block.text}
                                </h3>
                              );
                            }
                            if (block.type === 'bullet') {
                              return (
                                <div key={bIdx} className="flex items-start gap-2 pl-4 text-sm">
                                  <span className="text-gray-400">•</span>
                                  <span>{block.text}</span>
                                </div>
                              );
                            }
                            if (block.type === 'table' && block.rows) {
                              return (
                                <div key={bIdx} className="overflow-x-auto my-4">
                                  <table className="min-w-full text-xs border border-gray-300 dark:border-slate-700 rounded-lg overflow-hidden">
                                    <tbody>
                                      {block.rows.map((row, rI) => (
                                        <tr
                                          key={rI}
                                          className={
                                            rI === 0
                                              ? 'bg-gray-100 dark:bg-slate-800 font-bold'
                                              : 'border-t border-gray-200 dark:border-slate-800'
                                          }
                                        >
                                          {row.map((c, cI) => (
                                            <td
                                              key={cI}
                                              className="px-3 py-2 border-r border-gray-200 dark:border-slate-800 last:border-r-0"
                                            >
                                              {c}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            }
                            return (
                              <p
                                key={bIdx}
                                className={`text-sm leading-relaxed ${
                                  block.isBold ? 'font-bold' : ''
                                } text-gray-700 dark:text-slate-300`}
                              >
                                {block.text}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Tab 2: Raw Text Editor */
                  <div>
                    <textarea
                      value={editableText}
                      onChange={(e) => setEditableText(e.target.value)}
                      rows={18}
                      className="w-full p-4 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* How to Use Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Convert PDF to Word (.docx)
          </h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-slate-300 space-y-3 text-sm">
            <li>
              <strong>Upload your PDF document:</strong> Drag and drop your file into the upload zone or click &ldquo;Browse Files&rdquo;.
            </li>
            <li>
              <strong>Automatic Layout &amp; Table Analysis:</strong> Our engine scans text coordinates, font weights, and multi-column tabular data to classify headings, paragraphs, and tables.
            </li>
            <li>
              <strong>Customize Styles:</strong> Select your preferred Word typography (Calibri, Aptos, Times New Roman, or Arial), base font size, and page break settings.
            </li>
            <li>
              <strong>Preview &amp; Edit:</strong> Inspect the live split-view Word document preview or switch to the raw text editor to review extracted content.
            </li>
            <li>
              <strong>Download .docx:</strong> Click &ldquo;Download .docx&rdquo; to save an authentic, fully editable Microsoft Word document ready to open in Microsoft Office 365, Google Docs, or Apple Pages.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
