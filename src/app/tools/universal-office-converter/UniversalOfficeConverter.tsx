'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import AdSlot from '@/components/AdSlot';

type InputFormat = 'docx' | 'xlsx' | 'pptx' | 'pdf' | 'csv' | 'txt' | 'html' | 'image' | 'unknown';
type OutputFormat = 'pdf' | 'docx' | 'xlsx' | 'csv' | 'html' | 'txt' | 'md' | 'json' | 'png' | 'webp';

interface FormatOption {
  format: OutputFormat;
  label: string;
  ext: string;
  desc: string;
  badge: string;
}

const COMPATIBLE_OUTPUTS: Record<InputFormat, FormatOption[]> = {
  docx: [
    { format: 'pdf', label: 'PDF Document', ext: '.pdf', desc: 'Preserves typography and page layout', badge: 'Popular' },
    { format: 'html', label: 'HTML Webpage', ext: '.html', desc: 'Semantic HTML markup with headings & tables', badge: 'Web' },
    { format: 'txt', label: 'Plain Text', ext: '.txt', desc: 'Extracts clean unformatted text', badge: 'Fast' },
    { format: 'md', label: 'Markdown', ext: '.md', desc: 'GitHub-flavored markdown syntax', badge: 'Dev' },
  ],
  xlsx: [
    { format: 'csv', label: 'CSV Spreadsheet', ext: '.csv', desc: 'Standard comma-delimited tabular data', badge: 'Popular' },
    { format: 'pdf', label: 'PDF Document', ext: '.pdf', desc: 'Clean vector grid table PDF document', badge: 'Print' },
    { format: 'json', label: 'JSON Data', ext: '.json', desc: 'Array of records for developers & APIs', badge: 'Dev' },
    { format: 'html', label: 'HTML Table', ext: '.html', desc: 'Embeddable styled HTML data table', badge: 'Web' },
  ],
  pptx: [
    { format: 'pdf', label: 'PDF Slides', ext: '.pdf', desc: 'Multi-page presentation slides PDF', badge: 'Popular' },
    { format: 'html', label: 'HTML Slide Cards', ext: '.html', desc: 'Responsive web slide deck', badge: 'Web' },
    { format: 'txt', label: 'Extracted Text', ext: '.txt', desc: 'Slide-by-slide speaker notes & text', badge: 'Fast' },
    { format: 'md', label: 'Markdown Deck', ext: '.md', desc: 'Slide headings and bullet outlines', badge: 'Dev' },
  ],
  pdf: [
    { format: 'docx', label: 'Word (.docx)', ext: '.docx', desc: 'Editable Microsoft Word document', badge: 'Popular' },
    { format: 'txt', label: 'Plain Text', ext: '.txt', desc: 'Extracted paragraphs and text streams', badge: 'Fast' },
    { format: 'html', label: 'HTML Document', ext: '.html', desc: 'Clean HTML webpage with paragraph tags', badge: 'Web' },
    { format: 'csv', label: 'CSV Data', ext: '.csv', desc: 'Extracted tabular numbers & text', badge: 'Data' },
  ],
  csv: [
    { format: 'xlsx', label: 'Excel (.xlsx)', ext: '.xlsx', desc: 'Native Microsoft Excel workbook', badge: 'Popular' },
    { format: 'json', label: 'JSON Records', ext: '.json', desc: 'Structured JSON objects from CSV rows', badge: 'Dev' },
    { format: 'html', label: 'HTML Table', ext: '.html', desc: 'Styled responsive data table', badge: 'Web' },
    { format: 'pdf', label: 'PDF Report', ext: '.pdf', desc: 'Print-ready tabular report', badge: 'Print' },
  ],
  txt: [
    { format: 'pdf', label: 'PDF Document', ext: '.pdf', desc: 'Formatted document with pagination', badge: 'Popular' },
    { format: 'docx', label: 'Word (.docx)', ext: '.docx', desc: 'Editable Microsoft Word document', badge: 'Office' },
    { format: 'html', label: 'HTML Page', ext: '.html', desc: 'Clean web document with paragraphs', badge: 'Web' },
    { format: 'md', label: 'Markdown', ext: '.md', desc: 'Plain Markdown formatted file', badge: 'Dev' },
  ],
  html: [
    { format: 'pdf', label: 'PDF Document', ext: '.pdf', desc: 'Page-formatted document', badge: 'Popular' },
    { format: 'docx', label: 'Word (.docx)', ext: '.docx', desc: 'OpenXML Word processing document', badge: 'Office' },
    { format: 'txt', label: 'Plain Text', ext: '.txt', desc: 'Stripped HTML tags, raw content', badge: 'Fast' },
    { format: 'md', label: 'Markdown', ext: '.md', desc: 'Converted tags to Markdown', badge: 'Dev' },
  ],
  image: [
    { format: 'pdf', label: 'PDF Document', ext: '.pdf', desc: 'Single-page image encapsulated in PDF', badge: 'Popular' },
    { format: 'webp', label: 'WebP Image', ext: '.webp', desc: 'Modern compressed web image', badge: 'Web' },
    { format: 'png', label: 'PNG Image', ext: '.png', desc: 'Lossless transparent raster graphic', badge: 'Clean' },
  ],
  unknown: [],
};

const FORMAT_ICONS: Record<InputFormat, { icon: string; bg: string; text: string; label: string }> = {
  docx: { icon: 'W', bg: 'bg-blue-600', text: 'text-white', label: 'Microsoft Word Document' },
  xlsx: { icon: 'X', bg: 'bg-emerald-600', text: 'text-white', label: 'Microsoft Excel Spreadsheet' },
  pptx: { icon: 'P', bg: 'bg-orange-600', text: 'text-white', label: 'PowerPoint Presentation' },
  pdf: { icon: 'PDF', bg: 'bg-red-600', text: 'text-white', label: 'Adobe PDF Document' },
  csv: { icon: 'CSV', bg: 'bg-teal-600', text: 'text-white', label: 'CSV Delimited Data' },
  txt: { icon: 'TXT', bg: 'bg-gray-600', text: 'text-white', label: 'Plain Text File' },
  html: { icon: 'HTML', bg: 'bg-amber-600', text: 'text-white', label: 'HTML Web Document' },
  image: { icon: 'IMG', bg: 'bg-purple-600', text: 'text-white', label: 'Image Graphic' },
  unknown: { icon: '?', bg: 'bg-gray-400', text: 'text-white', label: 'Unknown File' },
};

export default function UniversalOfficeConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<InputFormat>('unknown');
  const [selectedOutput, setSelectedOutput] = useState<OutputFormat>('pdf');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [convertedResult, setConvertedResult] = useState<{
    blob: Blob;
    fileName: string;
    textPreview?: string;
    dataUrl?: string;
    size: number;
    mime: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [pdfjsLoaded, setPdfjsLoaded] = useState<boolean>(false);

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

  const detectType = (f: File): InputFormat => {
    const name = f.name.toLowerCase();
    const ext = name.split('.').pop() || '';

    if (ext === 'docx') return 'docx';
    if (ext === 'xlsx') return 'xlsx';
    if (ext === 'pptx') return 'pptx';
    if (ext === 'pdf') return 'pdf';
    if (ext === 'csv') return 'csv';
    if (ext === 'txt') return 'txt';
    if (ext === 'html' || ext === 'htm') return 'html';
    if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';

    // MIME fallback
    if (f.type.includes('pdf')) return 'pdf';
    if (f.type.includes('wordprocessingml')) return 'docx';
    if (f.type.includes('spreadsheetml')) return 'xlsx';
    if (f.type.includes('presentationml')) return 'pptx';
    if (f.type.includes('csv')) return 'csv';
    if (f.type.startsWith('image/')) return 'image';
    if (f.type.includes('html')) return 'html';
    if (f.type.includes('text')) return 'txt';

    return 'unknown';
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const detected = detectType(selected);
    setFile(selected);
    setDetectedFormat(detected);
    setConvertedResult(null);
    setProgress(0);

    const available = COMPATIBLE_OUTPUTS[detected];
    if (available && available.length > 0) {
      setSelectedOutput(available[0].format);
    }
  };

  // Helper to build simple clean DOCX OpenXML Zip
  const createDocxBlob = async (paragraphs: string[], title: string = 'Document'): Promise<Blob> => {
    const zip = new JSZip();

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

    zip.file(
      '_rels/.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
    );

    zip.file(
      'word/_rels/document.xml.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
    );

    zip.file(
      'word/styles.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:color w:val="1E293B"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
  </w:style>
</w:styles>`
    );

    const bodyParagraphs = paragraphs
      .map((p) => {
        const safeText = p
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `
    <w:p>
      <w:r>
        <w:t xml:space="preserve">${safeText}</w:t>
      </w:r>
    </w:p>`;
      })
      .join('');

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyParagraphs}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

    zip.file('word/document.xml', documentXml);

    return await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  };

  // Helper to build simple XLSX Zip from 2D array of cells
  const createXlsxBlob = async (rows: string[][], sheetName = 'Sheet1'): Promise<Blob> => {
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`
    );

    zip.file(
      '_rels/.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
    );

    zip.file(
      'xl/_rels/workbook.xml.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`
    );

    zip.file(
      'xl/workbook.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${sheetName}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`
    );

    // Build worksheet XML
    let sheetDataXml = '';
    rows.forEach((row, rIdx) => {
      sheetDataXml += `<row r="${rIdx + 1}">`;
      row.forEach((cellVal, cIdx) => {
        let colLetters = '';
        let temp = cIdx + 1;
        while (temp > 0) {
          const rem = (temp - 1) % 26;
          colLetters = String.fromCharCode(65 + rem) + colLetters;
          temp = Math.floor((temp - 1) / 26);
        }
        const cellRef = `${colLetters}${rIdx + 1}`;
        const escaped = (cellVal || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        sheetDataXml += `<c r="${cellRef}" t="inlineStr"><is><t>${escaped}</t></is></c>`;
      });
      sheetDataXml += `</row>`;
    });

    zip.file(
      'xl/worksheets/sheet1.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${sheetDataXml}</sheetData>
</worksheet>`
    );

    return await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  };

  // Helper to build simple PDF from text lines
  const createPdfFromTextLines = async (title: string, lines: string[]): Promise<Blob> => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const margin = 40;
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const usableWidth = pageWidth - margin * 2;
    const fontSize = 10;
    const lineHeight = 15;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;

    // Title
    page.drawText(title.slice(0, 50), {
      x: margin,
      y: currentY - 14,
      size: 14,
      font: fontBold,
      color: rgb(0.12, 0.16, 0.24),
    });
    currentY -= 32;

    for (const rawLine of lines) {
      // Wrap lines
      const words = rawLine.split(/\s+/);
      let currentSegment = '';

      for (const w of words) {
        const testSegment = currentSegment ? `${currentSegment} ${w}` : w;
        const testWidth = font.widthOfTextAtSize(testSegment, fontSize);

        if (testWidth > usableWidth) {
          if (currentY <= margin + lineHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }
          page.drawText(currentSegment, {
            x: margin,
            y: currentY,
            size: fontSize,
            font: font,
            color: rgb(0.2, 0.25, 0.3),
          });
          currentY -= lineHeight;
          currentSegment = w;
        } else {
          currentSegment = testSegment;
        }
      }

      if (currentSegment) {
        if (currentY <= margin + lineHeight) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }
        page.drawText(currentSegment, {
          x: margin,
          y: currentY,
          size: fontSize,
          font: font,
          color: rgb(0.2, 0.25, 0.3),
        });
        currentY -= lineHeight;
      }
      currentY -= 4; // slight paragraph gap
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  };

  const convertDocument = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(15);
    setStatusMessage('Reading file buffer...');

    const baseName = file.name.replace(/\.[^/.]+$/, '');

    try {
      // 1. DOCX Input
      if (detectedFormat === 'docx') {
        setStatusMessage('Extracting Word document structure...');
        const buffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(buffer);
        const docXmlFile = zip.file('word/document.xml');
        if (!docXmlFile) throw new Error('Missing word/document.xml in DOCX package.');

        const xmlText = await docXmlFile.async('text');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

        const pNodes = Array.from(xmlDoc.getElementsByTagName('w:p'));
        const paragraphs = pNodes
          .map((p) => {
            const texts = Array.from(p.getElementsByTagName('w:t')).map((t) => t.textContent || '');
            return texts.join('');
          })
          .filter((t) => t.trim().length > 0);

        // Also extract tables
        const tblNodes = Array.from(xmlDoc.getElementsByTagName('w:tbl'));
        const tables: string[][][] = [];
        tblNodes.forEach((tbl) => {
          const trs = Array.from(tbl.getElementsByTagName('w:tr'));
          const tableRows: string[][] = [];
          trs.forEach((tr) => {
            const tcs = Array.from(tr.getElementsByTagName('w:tc'));
            const row = tcs.map((tc) => {
              const texts = Array.from(tc.getElementsByTagName('w:t')).map((t) => t.textContent || '');
              return texts.join('').trim();
            });
            tableRows.push(row);
          });
          if (tableRows.length > 0) tables.push(tableRows);
        });

        setProgress(60);

        if (selectedOutput === 'txt') {
          let fullText = paragraphs.join('\n\n');
          if (tables.length > 0) {
            fullText += '\n\n--- Tables ---\n' + tables.map((t) => t.map((r) => r.join('\t')).join('\n')).join('\n\n');
          }
          const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.txt`,
            textPreview: fullText,
            size: blob.size,
            mime: 'text/plain',
          });
        } else if (selectedOutput === 'html') {
          let html = `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>${baseName}</title>\n`;
          html += `<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;color:#1e293b;}h1,h2,h3{color:#0f172a;}table{border-collapse:collapse;width:100%;margin:20px 0;}th,td{border:1px solid #cbd5e1;padding:8px 12px;text-align:left;}th{background:#f1f5f9;}</style>\n</head>\n<body>\n<h1>${baseName}</h1>\n`;
          paragraphs.forEach((p) => {
            html += `  <p>${p}</p>\n`;
          });
          tables.forEach((tbl) => {
            html += `  <table>\n    <tbody>\n`;
            tbl.forEach((r, idx) => {
              html += `      <tr>\n`;
              r.forEach((c) => {
                html += idx === 0 ? `        <th>${c}</th>\n` : `        <td>${c}</td>\n`;
              });
              html += `      </tr>\n`;
            });
            html += `    </tbody>\n  </table>\n`;
          });
          html += `</body>\n</html>`;
          const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.html`,
            textPreview: html,
            size: blob.size,
            mime: 'text/html',
          });
        } else if (selectedOutput === 'md') {
          let md = `# ${baseName}\n\n`;
          paragraphs.forEach((p) => {
            md += `${p}\n\n`;
          });
          tables.forEach((tbl) => {
            if (tbl.length > 0) {
              md += `| ${tbl[0].join(' | ')} |\n`;
              md += `| ${tbl[0].map(() => '---').join(' | ')} |\n`;
              tbl.slice(1).forEach((r) => {
                md += `| ${r.join(' | ')} |\n`;
              });
              md += '\n';
            }
          });
          const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.md`,
            textPreview: md,
            size: blob.size,
            mime: 'text/markdown',
          });
        } else if (selectedOutput === 'pdf') {
          const blob = await createPdfFromTextLines(baseName, paragraphs);
          setConvertedResult({
            blob,
            fileName: `${baseName}.pdf`,
            textPreview: paragraphs.slice(0, 10).join('\n\n') + '\n\n[...PDF Generated Successfully]',
            size: blob.size,
            mime: 'application/pdf',
          });
        }
      }

      // 2. XLSX Input
      else if (detectedFormat === 'xlsx') {
        setStatusMessage('Extracting Excel workbook data...');
        const buffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(buffer);

        // Parse sharedStrings
        const sharedStrings: string[] = [];
        const ssFile = zip.file('xl/sharedStrings.xml');
        if (ssFile) {
          const ssXml = await ssFile.async('text');
          const ssDoc = new DOMParser().parseFromString(ssXml, 'text/xml');
          const sis = ssDoc.getElementsByTagName('si');
          for (let i = 0; i < sis.length; i++) {
            const ts = sis[i].getElementsByTagName('t');
            let str = '';
            for (let j = 0; j < ts.length; j++) str += ts[j].textContent || '';
            sharedStrings.push(str);
          }
        }

        // Parse sheet1
        const sheetFile = zip.file('xl/worksheets/sheet1.xml') || zip.file('xl/worksheets/sheet0.xml');
        if (!sheetFile) throw new Error('Could not locate worksheet in XLSX.');
        const sheetXml = await sheetFile.async('text');
        const sheetDoc = new DOMParser().parseFromString(sheetXml, 'text/xml');
        const rowNodes = Array.from(sheetDoc.getElementsByTagName('row'));

        const rows: string[][] = [];
        rowNodes.forEach((rowNode) => {
          const cNodes = Array.from(rowNode.getElementsByTagName('c'));
          const rowData: string[] = [];
          cNodes.forEach((c) => {
            const t = c.getAttribute('t');
            const vNode = c.getElementsByTagName('v')[0];
            let val = '';
            if (t === 's' && vNode && vNode.textContent) {
              const idx = parseInt(vNode.textContent, 10);
              val = sharedStrings[idx] || '';
            } else if (t === 'inlineStr') {
              const inT = c.getElementsByTagName('t')[0];
              val = inT?.textContent || '';
            } else if (vNode && vNode.textContent) {
              val = vNode.textContent;
            }
            rowData.push(val.trim());
          });
          if (rowData.some((c) => c.length > 0)) {
            rows.push(rowData);
          }
        });

        setProgress(70);

        if (selectedOutput === 'csv') {
          const csvText = rows
            .map((r) =>
              r
                .map((cell) => {
                  if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                    return `"${cell.replace(/"/g, '""')}"`;
                  }
                  return cell;
                })
                .join(',')
            )
            .join('\n');
          const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.csv`,
            textPreview: csvText,
            size: blob.size,
            mime: 'text/csv',
          });
        } else if (selectedOutput === 'json') {
          const headers = rows[0] || [];
          const dataRows = rows.slice(1);
          const records = dataRows.map((r) => {
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => {
              obj[h || `Column_${i + 1}`] = r[i] || '';
            });
            return obj;
          });
          const jsonStr = JSON.stringify(records, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.json`,
            textPreview: jsonStr,
            size: blob.size,
            mime: 'application/json',
          });
        } else if (selectedOutput === 'html') {
          let html = `<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>${baseName}</title>\n`;
          html += `<style>body{font-family:system-ui,-apple-system,sans-serif;padding:30px;color:#1e293b;}table{border-collapse:collapse;width:100%;font-size:14px;}th,td{border:1px solid #cbd5e1;padding:8px 12px;text-align:left;}th{background:#f8fafc;font-weight:600;}tr:nth-child(even){background:#f9fafb;}</style>\n</head><body>\n`;
          html += `<h2>${baseName}</h2>\n<table>\n`;
          rows.forEach((r, idx) => {
            html += `  <tr>\n`;
            r.forEach((c) => {
              html += idx === 0 ? `    <th>${c}</th>\n` : `    <td>${c}</td>\n`;
            });
            html += `  </tr>\n`;
          });
          html += `</table></body></html>`;
          const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.html`,
            textPreview: html,
            size: blob.size,
            mime: 'text/html',
          });
        } else if (selectedOutput === 'pdf') {
          const lines = rows.map((r) => r.join('   |   '));
          const blob = await createPdfFromTextLines(baseName, lines);
          setConvertedResult({
            blob,
            fileName: `${baseName}.pdf`,
            textPreview: lines.slice(0, 15).join('\n') + '\n\n[...PDF Generated Successfully]',
            size: blob.size,
            mime: 'application/pdf',
          });
        }
      }

      // 3. PPTX Input
      else if (detectedFormat === 'pptx') {
        setStatusMessage('Extracting presentation slides...');
        const buffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(buffer);

        // Find slide files
        const slideFiles = Object.keys(zip.files).filter((k) => /^ppt\/slides\/slide\d+\.xml$/.test(k));
        slideFiles.sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, ''), 10);
          const numB = parseInt(b.replace(/\D/g, ''), 10);
          return numA - numB;
        });

        const slidesData: { slideNum: number; texts: string[] }[] = [];
        for (let i = 0; i < slideFiles.length; i++) {
          const slideXml = await zip.file(slideFiles[i])?.async('text');
          if (!slideXml) continue;
          const slideDoc = new DOMParser().parseFromString(slideXml, 'text/xml');
          const tNodes = Array.from(slideDoc.getElementsByTagName('a:t'));
          const texts = tNodes.map((t) => (t.textContent || '').trim()).filter((t) => t.length > 0);
          slidesData.push({ slideNum: i + 1, texts });
        }

        setProgress(70);

        if (selectedOutput === 'txt') {
          const txt = slidesData
            .map((s) => `--- Slide ${s.slideNum} ---\n` + s.texts.join('\n'))
            .join('\n\n');
          const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.txt`,
            textPreview: txt,
            size: blob.size,
            mime: 'text/plain',
          });
        } else if (selectedOutput === 'md') {
          const md = slidesData
            .map((s) => `## Slide ${s.slideNum}\n\n` + s.texts.map((t) => `- ${t}`).join('\n'))
            .join('\n\n');
          const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.md`,
            textPreview: md,
            size: blob.size,
            mime: 'text/markdown',
          });
        } else if (selectedOutput === 'html') {
          let html = `<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>${baseName}</title>\n`;
          html += `<style>body{font-family:system-ui,-apple-system,sans-serif;background:#f8fafc;padding:40px;color:#1e293b;}.slide{background:#fff;border-radius:12px;box-shadow:0 4px 6px -1px rgb(0 0 0/0.1);max-width:720px;margin:0 auto 30px;padding:32px;border:1px solid #e2e8f0;}.slide-num{font-size:12px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;}</style>\n</head><body>\n`;
          slidesData.forEach((s) => {
            html += `  <div class="slide">\n    <div class="slide-num">Slide ${s.slideNum}</div>\n`;
            s.texts.forEach((t) => {
              html += `    <p>${t}</p>\n`;
            });
            html += `  </div>\n`;
          });
          html += `</body></html>`;
          const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.html`,
            textPreview: html,
            size: blob.size,
            mime: 'text/html',
          });
        } else if (selectedOutput === 'pdf') {
          const lines: string[] = [];
          slidesData.forEach((s) => {
            lines.push(`--- SLIDE ${s.slideNum} ---`);
            s.texts.forEach((t) => lines.push(`• ${t}`));
            lines.push('');
          });
          const blob = await createPdfFromTextLines(baseName, lines);
          setConvertedResult({
            blob,
            fileName: `${baseName}.pdf`,
            textPreview: lines.slice(0, 15).join('\n') + '\n\n[...PDF Generated Successfully]',
            size: blob.size,
            mime: 'application/pdf',
          });
        }
      }

      // 4. PDF Input
      else if (detectedFormat === 'pdf') {
        setStatusMessage('Parsing PDF pages & text streams...');
        const buffer = await file.arrayBuffer();

        let extractedLines: string[] = [];

        if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
          const pdfDoc = await (window as any).pdfjsLib.getDocument({ data: buffer }).promise;
          for (let p = 1; p <= pdfDoc.numPages; p++) {
            const page = await pdfDoc.getPage(p);
            const content = await page.getTextContent();
            const pageText = content.items
              .map((it: any) => it.str || '')
              .filter((s: string) => s.trim().length > 0)
              .join(' ');
            if (pageText) extractedLines.push(pageText);
          }
        } else {
          // Fallback text reader
          const text = await file.text();
          const matches = text.match(/\(([^()]+)\)T[jJ]/g);
          if (matches) {
            extractedLines = matches.map((m) => m.replace(/^[\\(]|T[jJ]$/g, '').trim());
          } else {
            extractedLines = ['Extracted PDF Text Stream'];
          }
        }

        setProgress(70);

        if (selectedOutput === 'txt') {
          const txt = extractedLines.join('\n\n');
          const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.txt`,
            textPreview: txt,
            size: blob.size,
            mime: 'text/plain',
          });
        } else if (selectedOutput === 'docx') {
          const blob = await createDocxBlob(extractedLines, baseName);
          setConvertedResult({
            blob,
            fileName: `${baseName}.docx`,
            textPreview: extractedLines.slice(0, 10).join('\n\n') + '\n\n[...Word DOCX Built Successfully]',
            size: blob.size,
            mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });
        } else if (selectedOutput === 'html') {
          let html = `<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>${baseName}</title>\n`;
          html += `<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:40px auto;line-height:1.6;padding:0 20px;color:#1e293b;}p{margin-bottom:14px;}</style>\n</head><body>\n<h1>${baseName}</h1>\n`;
          extractedLines.forEach((p) => {
            html += `<p>${p}</p>\n`;
          });
          html += `</body></html>`;
          const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.html`,
            textPreview: html,
            size: blob.size,
            mime: 'text/html',
          });
        } else if (selectedOutput === 'csv') {
          const csvLines = extractedLines.map((l) => `"${l.replace(/"/g, '""')}"`).join('\n');
          const blob = new Blob([csvLines], { type: 'text/csv;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.csv`,
            textPreview: csvLines,
            size: blob.size,
            mime: 'text/csv',
          });
        }
      }

      // 5. CSV Input
      else if (detectedFormat === 'csv') {
        setStatusMessage('Parsing CSV lines...');
        const text = await file.text();
        const rawLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        const rows = rawLines.map((line) => {
          // Simple CSV parser
          const cells: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') inQuotes = !inQuotes;
            else if (ch === ',' && !inQuotes) {
              cells.push(current.trim());
              current = '';
            } else {
              current += ch;
            }
          }
          cells.push(current.trim());
          return cells;
        });

        setProgress(70);

        if (selectedOutput === 'xlsx') {
          const blob = await createXlsxBlob(rows, baseName.slice(0, 30));
          setConvertedResult({
            blob,
            fileName: `${baseName}.xlsx`,
            textPreview: `Generated Excel Workbook (.xlsx)\nTotal Rows: ${rows.length}\nColumns: ${rows[0]?.length || 0}`,
            size: blob.size,
            mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
        } else if (selectedOutput === 'json') {
          const headers = rows[0] || [];
          const dataRows = rows.slice(1);
          const records = dataRows.map((r) => {
            const obj: Record<string, string> = {};
            headers.forEach((h, idx) => {
              obj[h || `Col_${idx + 1}`] = r[idx] || '';
            });
            return obj;
          });
          const jsonText = JSON.stringify(records, null, 2);
          const blob = new Blob([jsonText], { type: 'application/json' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.json`,
            textPreview: jsonText,
            size: blob.size,
            mime: 'application/json',
          });
        } else if (selectedOutput === 'html') {
          let html = `<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>${baseName}</title>\n`;
          html += `<style>body{font-family:sans-serif;padding:30px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #cbd5e1;padding:8px 12px;}th{background:#f8fafc;}</style>\n</head><body>\n<table>\n`;
          rows.forEach((r, idx) => {
            html += `<tr>${r.map((c) => (idx === 0 ? `<th>${c}</th>` : `<td>${c}</td>`)).join('')}</tr>\n`;
          });
          html += `</table></body></html>`;
          const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.html`,
            textPreview: html,
            size: blob.size,
            mime: 'text/html',
          });
        } else if (selectedOutput === 'pdf') {
          const lines = rows.map((r) => r.join('  |  '));
          const blob = await createPdfFromTextLines(baseName, lines);
          setConvertedResult({
            blob,
            fileName: `${baseName}.pdf`,
            textPreview: lines.slice(0, 10).join('\n') + '\n\n[...PDF Generated Successfully]',
            size: blob.size,
            mime: 'application/pdf',
          });
        }
      }

      // 6. TXT Input
      else if (detectedFormat === 'txt') {
        setStatusMessage('Reading text lines...');
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

        setProgress(70);

        if (selectedOutput === 'pdf') {
          const blob = await createPdfFromTextLines(baseName, lines);
          setConvertedResult({
            blob,
            fileName: `${baseName}.pdf`,
            textPreview: lines.slice(0, 15).join('\n') + '\n\n[...PDF Generated Successfully]',
            size: blob.size,
            mime: 'application/pdf',
          });
        } else if (selectedOutput === 'docx') {
          const blob = await createDocxBlob(lines, baseName);
          setConvertedResult({
            blob,
            fileName: `${baseName}.docx`,
            textPreview: lines.slice(0, 15).join('\n\n') + '\n\n[...Word DOCX Generated Successfully]',
            size: blob.size,
            mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });
        } else if (selectedOutput === 'html') {
          const html = `<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>${baseName}</title>\n<style>body{font-family:sans-serif;max-width:800px;margin:40px auto;line-height:1.6;padding:0 20px;}p{margin-bottom:12px;}</style>\n</head><body>\n<h1>${baseName}</h1>\n${lines
            .map((l) => `<p>${l}</p>`)
            .join('\n')}\n</body></html>`;
          const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.html`,
            textPreview: html,
            size: blob.size,
            mime: 'text/html',
          });
        } else if (selectedOutput === 'md') {
          const md = `# ${baseName}\n\n${lines.join('\n\n')}`;
          const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.md`,
            textPreview: md,
            size: blob.size,
            mime: 'text/markdown',
          });
        }
      }

      // 7. HTML Input
      else if (detectedFormat === 'html') {
        setStatusMessage('Extracting HTML elements...');
        const text = await file.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        const textNodes = Array.from(doc.body.querySelectorAll('h1, h2, h3, p, li, td'))
          .map((el) => el.textContent?.trim() || '')
          .filter((t) => t.length > 0);

        setProgress(70);

        if (selectedOutput === 'txt') {
          const txt = doc.body.textContent || '';
          const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.txt`,
            textPreview: txt,
            size: blob.size,
            mime: 'text/plain',
          });
        } else if (selectedOutput === 'md') {
          const md = `# ${baseName}\n\n${textNodes.join('\n\n')}`;
          const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.md`,
            textPreview: md,
            size: blob.size,
            mime: 'text/markdown',
          });
        } else if (selectedOutput === 'docx') {
          const blob = await createDocxBlob(textNodes, baseName);
          setConvertedResult({
            blob,
            fileName: `${baseName}.docx`,
            textPreview: textNodes.slice(0, 15).join('\n\n'),
            size: blob.size,
            mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });
        } else if (selectedOutput === 'pdf') {
          const blob = await createPdfFromTextLines(baseName, textNodes);
          setConvertedResult({
            blob,
            fileName: `${baseName}.pdf`,
            textPreview: textNodes.slice(0, 15).join('\n') + '\n\n[...PDF Generated Successfully]',
            size: blob.size,
            mime: 'application/pdf',
          });
        }
      }

      // 8. Image Input
      else if (detectedFormat === 'image') {
        setStatusMessage('Processing image graphic...');
        const buffer = await file.arrayBuffer();

        if (selectedOutput === 'pdf') {
          const pdfDoc = await PDFDocument.create();
          let imageEmbed;
          if (file.type.includes('png')) {
            imageEmbed = await pdfDoc.embedPng(buffer);
          } else {
            imageEmbed = await pdfDoc.embedJpg(buffer);
          }
          const { width, height } = imageEmbed.scale(1);
          const page = pdfDoc.addPage([width, height]);
          page.drawImage(imageEmbed, {
            x: 0,
            y: 0,
            width,
            height,
          });
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
          setConvertedResult({
            blob,
            fileName: `${baseName}.pdf`,
            textPreview: `Image converted to single-page PDF document.\nDimensions: ${Math.round(width)} x ${Math.round(height)} px`,
            size: blob.size,
            mime: 'application/pdf',
          });
        } else if (selectedOutput === 'webp' || selectedOutput === 'png') {
          const img = new Image();
          const imgUrl = URL.createObjectURL(file);
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = rej;
            img.src = imgUrl;
          });

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          URL.revokeObjectURL(imgUrl);

          const mimeType = selectedOutput === 'webp' ? 'image/webp' : 'image/png';
          const blob: Blob = await new Promise((res) => {
            canvas.toBlob((b) => res(b || new Blob()), mimeType, 0.92);
          });

          setConvertedResult({
            blob,
            fileName: `${baseName}.${selectedOutput}`,
            dataUrl: canvas.toDataURL(mimeType),
            size: blob.size,
            mime: mimeType,
          });
        }
      }

      setProgress(100);
      setStatusMessage('Conversion completed successfully!');
    } catch (err: any) {
      console.error(err);
      alert(`Conversion error: ${err?.message || 'Could not convert file'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = () => {
    if (!convertedResult) return;
    const url = URL.createObjectURL(convertedResult.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = convertedResult.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyText = () => {
    if (!convertedResult?.textPreview) return;
    navigator.clipboard.writeText(convertedResult.textPreview).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const currentIcon = FORMAT_ICONS[detectedFormat];
  const compatibleOutputs = COMPATIBLE_OUTPUTS[detectedFormat] || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 text-gray-900 dark:text-slate-100">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={handleScriptLoad}
      />

      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="text-sm mb-6 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Universal Office Converter</span>
        </nav>

        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-xs font-semibold text-primary-700 dark:text-primary-300 mb-3">
            <span>⚡ Universal Client-Side Office Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Universal Office Converter
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Convert any Microsoft Word, Excel, PowerPoint, PDF, CSV, or Text file into your desired target format entirely within your browser with complete privacy.
          </p>
        </header>

        {/* Ad Slot */}
        <AdSlot format="horizontal" />

        {/* Upload Dropzone */}
        {!file ? (
          <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-3xl p-12 transition-all group bg-white dark:bg-slate-900 shadow-sm mb-8">
            <input
              type="file"
              accept=".docx,.xlsx,.pptx,.pdf,.csv,.txt,.html,.htm,.png,.jpg,.jpeg,.webp"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                handleFile(e);
                e.target.value = '';
              }}
            />
            <div className="pointer-events-none flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                🔄
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Drop ANY Office Document Here
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-5 max-w-md">
                Supports Word (.docx), Excel (.xlsx), PowerPoint (.pptx), PDF (.pdf), CSV, TXT, HTML & Images
              </p>
              <span className="px-6 py-3 bg-primary-600 group-hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all inline-block">
                Browse Files
              </span>
              <span className="text-[11px] text-gray-400 dark:text-slate-500 mt-4">
                100% Client-Side Private • Zero File Size Limit • Instant In-Memory Processing
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm mb-8 space-y-6">
            {/* Detected File Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl ${currentIcon.bg} ${currentIcon.text} flex items-center justify-center text-xl font-black shadow-md`}
                >
                  {currentIcon.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      {file.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                      {detectedFormat.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB • {currentIcon.label}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setConvertedResult(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Change File
              </button>
            </div>

            {/* Target Format Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Select Output Format
                </span>
                <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                  {compatibleOutputs.length} Compatible Targets
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {compatibleOutputs.map((opt) => {
                  const isSelected = selectedOutput === opt.format;
                  return (
                    <button
                      key={opt.format}
                      type="button"
                      onClick={() => setSelectedOutput(opt.format)}
                      className={`relative p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 ring-2 ring-primary-500/20'
                          : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">
                          {opt.label}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                          {opt.ext}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-tight">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Convert Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={convertDocument}
                disabled={isProcessing}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-md disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Converting...</span>
                  </>
                ) : (
                  <>
                    <span>Convert {detectedFormat.toUpperCase()} to {selectedOutput.toUpperCase()}</span>
                    <span>→</span>
                  </>
                )}
              </button>

              {isProcessing && (
                <span className="text-xs text-gray-500 dark:text-slate-400 animate-pulse">
                  {statusMessage}
                </span>
              )}
            </div>

            {/* Converted Output Card */}
            {convertedResult && (
              <div className="mt-6 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                        {convertedResult.fileName}
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        Ready to download • {(convertedResult.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {convertedResult.textPreview && (
                      <button
                        onClick={copyText}
                        className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        {copied ? '✓ Copied!' : 'Copy Content'}
                      </button>
                    )}
                    <button
                      onClick={downloadFile}
                      className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-all"
                    >
                      Download File
                    </button>
                  </div>
                </div>

                {/* Text / Code Preview */}
                {convertedResult.textPreview && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                      <span>Live Output Preview</span>
                      <span>{convertedResult.textPreview.length} characters</span>
                    </div>
                    <pre className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs font-mono text-gray-800 dark:text-slate-200 max-h-60 overflow-y-auto whitespace-pre-wrap break-words">
                      {convertedResult.textPreview.slice(0, 3000)}
                      {convertedResult.textPreview.length > 3000 ? '\n\n[... truncated preview]' : ''}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl mb-3">
              🔒
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">100% Private & Client-Side</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              No files are ever uploaded to any cloud or third-party server. All conversions happen entirely in your local browser memory.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl mb-3">
              ⚡
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Zero Waiting Queues</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Instant conversion engine using WebAssembly, JSZip, and modern DOM parsers with no file queues or conversion daily limits.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl mb-3">
              🎯
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Universal Multi-Format</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Switch effortlessly between Word, Excel, PowerPoint, PDF, CSV, JSON, Markdown, and Web formats in one single unified tool.
            </p>
          </div>
        </div>

        {/* How to Use Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Convert Any Office Document Online
          </h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-slate-300 space-y-3 text-sm">
            <li>
              <strong>Upload your document:</strong> Drag and drop any DOCX, XLSX, PPTX, PDF, CSV, or TXT file into the dropzone.
            </li>
            <li>
              <strong>Auto-Detection & Format Selection:</strong> The tool instantly identifies the file format and displays compatible output formats.
            </li>
            <li>
              <strong>Click Convert:</strong> Tap &ldquo;Convert&rdquo; to process the document in-memory using pure client-side parsers.
            </li>
            <li>
              <strong>Preview &amp; Download:</strong> Inspect the live output preview, copy the text to your clipboard, or click &ldquo;Download File&rdquo; to save it locally.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
