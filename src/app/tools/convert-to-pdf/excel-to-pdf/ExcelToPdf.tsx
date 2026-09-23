'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts, RGB } from 'pdf-lib';
import AdSlot from '@/components/AdSlot';
import ToolResultCard from '@/components/ToolResultCard';

interface SheetData {
  name: string;
  rows: string[][];
  maxCols: number;
}

type PageSize = 'A4' | 'Letter' | 'Legal';
type Orientation = 'landscape' | 'portrait';
type MarginSize = 'compact' | 'normal' | 'wide';
type HeaderTheme = 'indigo' | 'slate' | 'emerald' | 'navy' | 'crimson';

const PAGE_DIMENSIONS: Record<PageSize, { width: number; height: number }> = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612.0, height: 792.0 },
  Legal: { width: 612.0, height: 1008.0 },
};

const MARGIN_VALUES: Record<MarginSize, number> = {
  compact: 20,
  normal: 36,
  wide: 54,
};

const THEME_COLORS: Record<
  HeaderTheme,
  { bg: RGB; text: RGB; hex: string; name: string }
> = {
  indigo: {
    bg: rgb(79 / 255, 70 / 255, 229 / 255), // #4f46e5
    text: rgb(1, 1, 1),
    hex: '#4f46e5',
    name: 'ToolsVerse Indigo',
  },
  slate: {
    bg: rgb(30 / 255, 41 / 255, 59 / 255), // #1e293b
    text: rgb(1, 1, 1),
    hex: '#1e293b',
    name: 'Executive Slate',
  },
  emerald: {
    bg: rgb(16 / 255, 149 / 255, 106 / 255), // #10b981
    text: rgb(1, 1, 1),
    hex: '#10b981',
    name: 'Modern Emerald',
  },
  navy: {
    bg: rgb(30 / 255, 58 / 255, 138 / 255), // #1e3a8a
    text: rgb(1, 1, 1),
    hex: '#1e3a8a',
    name: 'Classic Navy',
  },
  crimson: {
    bg: rgb(159 / 255, 18 / 255, 57 / 255), // #9f1239
    text: rgb(1, 1, 1),
    hex: '#9f1239',
    name: 'Crimson Rose',
  },
};

// Convert column letter like "A", "B", "AA", "AB" to 0-based column index
function colLetterToIndex(colStr: string): number {
  let index = 0;
  const upper = colStr.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    index = index * 26 + (upper.charCodeAt(i) - 64);
  }
  return index - 1;
}

// Convert 0-based column index to letter like "A", "B", "AA"
function indexToColLetter(index: number): string {
  let col = '';
  let temp = index + 1;
  while (temp > 0) {
    const rem = (temp - 1) % 26;
    col = String.fromCharCode(65 + rem) + col;
    temp = Math.floor((temp - 1) / 26);
  }
  return col;
}

// Parse CSV/TSV with standard quote handling
function parseDelimitedText(text: string, delimiter: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n of \r\n
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

// Auto-detect CSV/TSV delimiter
function detectDelimiter(text: string): string {
  const sample = text.slice(0, 3000);
  const delimiters = [',', '\t', ';', '|'];
  const counts: Record<string, number> = { ',': 0, '\t': 0, ';': 0, '|': 0 };

  const lines = sample.split(/\r?\n/).slice(0, 5);
  for (const line of lines) {
    for (const d of delimiters) {
      const parts = line.split(d);
      if (parts.length > 1) {
        counts[d] += parts.length;
      }
    }
  }

  let bestDelim = ',';
  let maxCount = -1;
  for (const d of delimiters) {
    if (counts[d] > maxCount) {
      maxCount = counts[d];
      bestDelim = d;
    }
  }
  return bestDelim;
}

const SAMPLE_SHEET_DATA: SheetData[] = [
  {
    name: 'Quarterly Sales',
    rows: [
      ['Region', 'Product Category', 'Units Sold', 'Unit Price ($)', 'Total Revenue ($)', 'Target ($)', 'Performance'],
      ['North America', 'Enterprise Software', '1,450', '850.00', '1,232,500.00', '1,100,000.00', '+12.0%'],
      ['North America', 'Cloud Subscriptions', '4,210', '120.00', '505,200.00', '480,000.00', '+5.3%'],
      ['Europe West', 'Enterprise Software', '980', '850.00', '833,000.00', '850,000.00', '-2.0%'],
      ['Europe West', 'Consulting Services', '320', '1,500.00', '480,000.00', '400,000.00', '+20.0%'],
      ['Asia Pacific', 'Cloud Subscriptions', '6,800', '95.00', '646,000.00', '600,000.00', '+7.7%'],
      ['Asia Pacific', 'Security Add-on', '1,250', '250.00', '312,500.00', '300,000.00', '+4.2%'],
      ['Latin America', 'Hardware Appliances', '210', '3,400.00', '714,000.00', '700,000.00', '+2.0%'],
      ['Latin America', 'Technical Support', '540', '300.00', '162,000.00', '150,000.00', '+8.0%'],
      ['Middle East', 'Cloud Subscriptions', '2,150', '110.00', '236,500.00', '220,000.00', '+7.5%'],
      ['Total', 'Consolidated Portfolio', '17,910', '-', '5,121,700.00', '4,800,000.00', '+6.7%'],
    ],
    maxCols: 7,
  },
  {
    name: 'Employee Directory',
    rows: [
      ['Emp ID', 'Full Name', 'Department', 'Job Title', 'Office Location', 'Status'],
      ['TV-1001', 'Alexander Wright', 'Engineering', 'Principal Architect', 'San Francisco, CA', 'Active'],
      ['TV-1002', 'Elena Rostova', 'Product Design', 'Lead UX Designer', 'London, UK', 'Active'],
      ['TV-1003', 'Marcus Chen', 'Finance', 'Director of FP&A', 'Singapore', 'Active'],
      ['TV-1004', 'Sarah Jenkins', 'Marketing', 'VP Growth & Brand', 'New York, NY', 'Active'],
      ['TV-1005', 'Tariq Al-Mansoor', 'Operations', 'Infrastructure Lead', 'Dubai, UAE', 'Active'],
      ['TV-1006', 'Chloe Deschanel', 'Customer Success', 'Senior CSM', 'Paris, France', 'Active'],
    ],
    maxCols: 6,
  },
];

export default function ExcelToPdf() {
  const [fileName, setFileName] = useState<string>('sample-sales-report.xlsx');
  const [fileSize, setFileSize] = useState<number>(14520);
  const [sheets, setSheets] = useState<SheetData[]>(SAMPLE_SHEET_DATA);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Layout & Styling State
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [margins, setMargins] = useState<MarginSize>('compact');
  const [fontSize, setFontSize] = useState<number>(9);
  const [headerTheme, setHeaderTheme] = useState<HeaderTheme>('indigo');

  // Toggles
  const [firstRowIsHeader, setFirstRowIsHeader] = useState<boolean>(true);
  const [repeatHeader, setRepeatHeader] = useState<boolean>(true);
  const [zebraStriping, setZebraStriping] = useState<boolean>(true);
  const [gridLines, setGridLines] = useState<boolean>(true);
  const [includeTitleBanner, setIncludeTitleBanner] = useState<boolean>(true);
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);

  // Search & Preview
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const activeSheet = sheets[activeSheetIndex] || sheets[0];

  // Filtered rows for table preview
  const filteredRows = useMemo(() => {
    if (!activeSheet || !activeSheet.rows) return [];
    if (!searchQuery.trim()) return activeSheet.rows;
    const query = searchQuery.toLowerCase();
    const rows = activeSheet.rows;
    const header = firstRowIsHeader && rows.length > 0 ? rows[0] : null;
    const dataRows = firstRowIsHeader ? rows.slice(1) : rows;

    const matched = dataRows.filter((r) =>
      r.some((cell) => cell.toLowerCase().includes(query))
    );

    return header ? [header, ...matched] : matched;
  }, [activeSheet, searchQuery, firstRowIsHeader]);

  // Handle uploaded spreadsheet files
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setFileName(file.name);
    setFileSize(file.size);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
        const text = await file.text();
        const delim = ext === 'tsv' ? '\t' : detectDelimiter(text);
        const parsedRows = parseDelimitedText(text, delim);

        if (parsedRows.length === 0) {
          throw new Error('The file appears to be empty.');
        }

        const maxCols = parsedRows.reduce((max, r) => Math.max(max, r.length), 0);
        // Normalize rows to same column count
        const normalized = parsedRows.map((r) => {
          const row = [...r];
          while (row.length < maxCols) row.push('');
          return row;
        });

        const sheetTitle = file.name.replace(/\.[^/.]+$/, '');
        setSheets([{ name: sheetTitle, rows: normalized, maxCols }]);
        setActiveSheetIndex(0);
      } else if (ext === 'xlsx') {
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // 1. Parse shared strings if present
        const sharedStrings: string[] = [];
        const sharedStringsFile = zip.file('xl/sharedStrings.xml');
        if (sharedStringsFile) {
          const xmlText = await sharedStringsFile.async('text');
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
          const siNodes = xmlDoc.getElementsByTagName('si');
          for (let i = 0; i < siNodes.length; i++) {
            const si = siNodes[i];
            const tNodes = si.getElementsByTagName('t');
            let str = '';
            for (let j = 0; j < tNodes.length; j++) {
              str += tNodes[j].textContent || '';
            }
            sharedStrings.push(str);
          }
        }

        // 2. Parse workbook.xml to get sheet names and r:ids
        const workbookFile = zip.file('xl/workbook.xml');
        if (!workbookFile) {
          throw new Error('Invalid Excel file format: missing xl/workbook.xml');
        }

        const wbXmlText = await workbookFile.async('text');
        const parser = new DOMParser();
        const wbDoc = parser.parseFromString(wbXmlText, 'text/xml');
        const sheetNodes = wbDoc.getElementsByTagName('sheet');

        // 3. Parse workbook relationships
        const relsFile = zip.file('xl/_rels/workbook.xml.rels');
        const relsMap: Record<string, string> = {};
        if (relsFile) {
          const relsXml = await relsFile.async('text');
          const relsDoc = parser.parseFromString(relsXml, 'text/xml');
          const relNodes = relsDoc.getElementsByTagName('Relationship');
          for (let i = 0; i < relNodes.length; i++) {
            const id = relNodes[i].getAttribute('Id') || '';
            const target = relNodes[i].getAttribute('Target') || '';
            relsMap[id] = target;
          }
        }

        const extractedSheets: SheetData[] = [];

        for (let s = 0; s < sheetNodes.length; s++) {
          const sNode = sheetNodes[s];
          const sheetName = sNode.getAttribute('name') || `Sheet${s + 1}`;
          const rId =
            sNode.getAttribute('r:id') ||
            sNode.getAttribute('id') ||
            `rId${s + 1}`;
          let targetPath = relsMap[rId] || `worksheets/sheet${s + 1}.xml`;
          if (!targetPath.startsWith('xl/')) {
            targetPath = `xl/${targetPath}`;
          }

          const worksheetFile = zip.file(targetPath);
          if (!worksheetFile) continue;

          const wsXmlText = await worksheetFile.async('text');
          const wsDoc = parser.parseFromString(wsXmlText, 'text/xml');
          const rowNodes = wsDoc.getElementsByTagName('row');

          const gridMap: Record<number, Record<number, string>> = {};
          let sheetMaxCol = 0;
          let sheetMaxRow = 0;

          for (let rIdx = 0; rIdx < rowNodes.length; rIdx++) {
            const rowNode = rowNodes[rIdx];
            const rAttr = rowNode.getAttribute('r');
            const rowNum = rAttr ? parseInt(rAttr, 10) - 1 : rIdx;
            sheetMaxRow = Math.max(sheetMaxRow, rowNum);

            const cNodes = rowNode.getElementsByTagName('c');
            for (let cIdx = 0; cIdx < cNodes.length; cIdx++) {
              const cNode = cNodes[cIdx];
              const cellRef = cNode.getAttribute('r') || '';
              const colLetters = cellRef.replace(/[0-9]/g, '');
              const colIndex = colLetters
                ? colLetterToIndex(colLetters)
                : cIdx;
              sheetMaxCol = Math.max(sheetMaxCol, colIndex);

              const cellType = cNode.getAttribute('t');
              let cellValue = '';

              if (cellType === 's') {
                const vNode = cNode.getElementsByTagName('v')[0];
                if (vNode && vNode.textContent) {
                  const sIdx = parseInt(vNode.textContent, 10);
                  cellValue = sharedStrings[sIdx] || '';
                }
              } else if (cellType === 'inlineStr') {
                const tNode = cNode.getElementsByTagName('t')[0];
                cellValue = tNode?.textContent || '';
              } else if (cellType === 'b') {
                const vNode = cNode.getElementsByTagName('v')[0];
                cellValue = vNode?.textContent === '1' ? 'TRUE' : 'FALSE';
              } else {
                const vNode = cNode.getElementsByTagName('v')[0];
                cellValue = vNode?.textContent || '';
              }

              if (!gridMap[rowNum]) gridMap[rowNum] = {};
              gridMap[rowNum][colIndex] = cellValue.trim();
            }
          }

          const totalCols = sheetMaxCol + 1;
          const rowsList: string[][] = [];

          for (let r = 0; r <= sheetMaxRow; r++) {
            const rowArr: string[] = [];
            let rowHasData = false;
            for (let c = 0; c < totalCols; c++) {
              const val = gridMap[r]?.[c] || '';
              rowArr.push(val);
              if (val.length > 0) rowHasData = true;
            }
            if (rowHasData || rowsList.length > 0) {
              rowsList.push(rowArr);
            }
          }

          // Strip trailing empty rows
          while (
            rowsList.length > 0 &&
            rowsList[rowsList.length - 1].every((cell) => !cell || cell.trim() === '')
          ) {
            rowsList.pop();
          }

          if (rowsList.length > 0) {
            extractedSheets.push({
              name: sheetName,
              rows: rowsList,
              maxCols: totalCols,
            });
          }
        }

        if (extractedSheets.length === 0) {
          throw new Error('No data found in worksheets.');
        }

        setSheets(extractedSheets);
        setActiveSheetIndex(0);
      } else if (ext === 'xls') {
        // Check for HTML table or XML SpreadsheetML
        const text = await file.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const table = doc.querySelector('table');

        if (table) {
          const rowsList: string[][] = [];
          const trs = table.querySelectorAll('tr');
          trs.forEach((tr) => {
            const cells = tr.querySelectorAll('th, td');
            const rowArr: string[] = [];
            cells.forEach((cell) => {
              rowArr.push(cell.textContent?.trim() || '');
            });
            if (rowArr.some((c) => c.length > 0)) {
              rowsList.push(rowArr);
            }
          });

          const maxCols = rowsList.reduce((max, r) => Math.max(max, r.length), 0);
          const normalized = rowsList.map((r) => {
            const row = [...r];
            while (row.length < maxCols) row.push('');
            return row;
          });

          setSheets([
            {
              name: file.name.replace(/\.[^/.]+$/, ''),
              rows: normalized,
              maxCols,
            },
          ]);
          setActiveSheetIndex(0);
        } else {
          throw new Error(
            'Legacy binary XLS format requires modern XLSX or CSV. Please re-save as .xlsx or .csv.'
          );
        }
      } else {
        throw new Error('Unsupported format. Please upload .xlsx, .xls, .csv, or .tsv.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err?.message || 'Failed to parse spreadsheet file. Please verify file integrity.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSampleData = () => {
    setFileName('sample-sales-report.xlsx');
    setFileSize(14520);
    setSheets(SAMPLE_SHEET_DATA);
    setActiveSheetIndex(0);
    setErrorMessage(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  // Generate Paginated PDF using pdf-lib
  const generatePdf = async (downloadImmediately: boolean = false): Promise<Uint8Array | null> => {
    if (!activeSheet || activeSheet.rows.length === 0) return null;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const pdfDoc = await PDFDocument.create();
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Dimensions based on page size & orientation
      const baseDim = PAGE_DIMENSIONS[pageSize];
      const pageWidth = orientation === 'landscape' ? baseDim.height : baseDim.width;
      const pageHeight = orientation === 'landscape' ? baseDim.width : baseDim.height;
      const margin = MARGIN_VALUES[margins];
      const usableWidth = pageWidth - margin * 2;

      const theme = THEME_COLORS[headerTheme];
      const borderColor = rgb(203 / 255, 213 / 255, 225 / 255); // #cbd5e1 slate-300
      const zebraBg = rgb(248 / 255, 250 / 255, 252 / 255); // #f8fafc slate-50
      const textColor = rgb(30 / 255, 41 / 255, 59 / 255); // #1e293b
      const metaTextColor = rgb(100 / 255, 116 / 255, 139 / 255); // #64748b

      const rows = activeSheet.rows;
      const totalCols = activeSheet.maxCols;

      if (totalCols === 0) {
        throw new Error('Active sheet does not contain any columns.');
      }

      // Step 1: Compute optimal column widths
      const colLengths: number[] = new Array(totalCols).fill(4);
      // Sample first 100 rows for sizing
      const sampleRows = rows.slice(0, 100);
      sampleRows.forEach((row) => {
        row.forEach((cell, cIdx) => {
          if (cIdx < totalCols) {
            colLengths[cIdx] = Math.max(colLengths[cIdx], cell.length);
          }
        });
      });

      const totalLength = colLengths.reduce((sum, len) => sum + len, 0) || 1;
      // Proportional width calculation
      const colWidths = colLengths.map((len) => {
        const proportion = len / totalLength;
        return Math.max(proportion * usableWidth, 40); // minimum 40pt width
      });

      // Normalize if total exceeds or falls short of usableWidth
      const sumWidths = colWidths.reduce((sum, w) => sum + w, 0);
      const widthMultiplier = usableWidth / sumWidths;
      const finalColWidths = colWidths.map((w) => w * widthMultiplier);

      const cellPadding = 4;
      const rowHeight = Math.max(fontSize * 1.85, 18);
      const titleBannerHeight = includeTitleBanner ? 38 : 0;
      const footerReserve = includePageNumbers ? 24 : 14;

      // Text truncation helper to prevent PDF overflow
      const truncateText = (
        text: string,
        maxWidth: number,
        font: any,
        fSize: number
      ): string => {
        if (!text) return '';
        const clean = text.replace(/[\r\n\t]/g, ' ');
        let cur = clean;
        let width = font.widthOfTextAtSize(cur, fSize);
        if (width <= maxWidth) return cur;

        // Truncate with ellipsis
        while (cur.length > 1 && font.widthOfTextAtSize(cur + '...', fSize) > maxWidth) {
          cur = cur.slice(0, -1);
        }
        return cur + '...';
      };

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;
      let pageNumber = 1;
      const pagesList: any[] = [currentPage];

      // Draw Top Title Banner if enabled
      const drawBanner = (page: any, y: number): number => {
        if (!includeTitleBanner) return y;
        // Document Title
        page.drawText(activeSheet.name, {
          x: margin,
          y: y - 12,
          size: 14,
          font: helveticaBold,
          color: theme.bg,
        });

        // Meta info (date & file name)
        const dateStr = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        const metaText = `File: ${fileName} • Converted: ${dateStr}`;
        const metaWidth = helvetica.widthOfTextAtSize(metaText, 8);
        page.drawText(metaText, {
          x: pageWidth - margin - metaWidth,
          y: y - 10,
          size: 8,
          font: helvetica,
          color: metaTextColor,
        });

        // Horizontal divider
        page.drawLine({
          start: { x: margin, y: y - 22 },
          end: { x: pageWidth - margin, y: y - 22 },
          thickness: 0.75,
          color: borderColor,
        });

        return y - titleBannerHeight;
      };

      // Draw Table Header Row
      const drawHeaderRow = (page: any, y: number, headerRow: string[]): number => {
        const nextY = y - rowHeight;
        // Background fill
        page.drawRectangle({
          x: margin,
          y: nextY,
          width: usableWidth,
          height: rowHeight,
          color: theme.bg,
        });

        let curX = margin;
        for (let c = 0; c < totalCols; c++) {
          const colW = finalColWidths[c];
          const rawText = headerRow[c] || (firstRowIsHeader ? '' : `Col ${indexToColLetter(c)}`);
          const text = truncateText(
            rawText,
            colW - cellPadding * 2,
            helveticaBold,
            fontSize
          );

          page.drawText(text, {
            x: curX + cellPadding,
            y: nextY + (rowHeight - fontSize) / 2 + 1,
            size: fontSize,
            font: helveticaBold,
            color: theme.text,
          });

          // Vertical grid separator
          if (gridLines && c > 0) {
            page.drawLine({
              start: { x: curX, y: nextY },
              end: { x: curX, y: y },
              thickness: 0.5,
              color: rgb(1, 1, 1),
            });
          }

          curX += colW;
        }

        return nextY;
      };

      currentY = drawBanner(currentPage, currentY);

      const headerData =
        firstRowIsHeader && rows.length > 0
          ? rows[0]
          : Array.from({ length: totalCols }, (_, i) => `Col ${indexToColLetter(i)}`);

      currentY = drawHeaderRow(currentPage, currentY, headerData);

      const dataRows = firstRowIsHeader ? rows.slice(1) : rows;

      // Loop through data rows and auto-paginate
      for (let rIdx = 0; rIdx < dataRows.length; rIdx++) {
        const row = dataRows[rIdx];

        // Check if page break needed
        if (currentY - rowHeight < margin + footerReserve) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          pagesList.push(currentPage);
          pageNumber++;
          currentY = pageHeight - margin;

          if (includeTitleBanner) {
            currentY = drawBanner(currentPage, currentY);
          }

          if (repeatHeader) {
            currentY = drawHeaderRow(currentPage, currentY, headerData);
          }
        }

        const nextY = currentY - rowHeight;
        const isZebra = zebraStriping && rIdx % 2 === 1;

        // Zebra row background
        if (isZebra) {
          currentPage.drawRectangle({
            x: margin,
            y: nextY,
            width: usableWidth,
            height: rowHeight,
            color: zebraBg,
          });
        }

        let curX = margin;
        for (let c = 0; c < totalCols; c++) {
          const colW = finalColWidths[c];
          const cellVal = row[c] || '';
          const text = truncateText(
            cellVal,
            colW - cellPadding * 2,
            helvetica,
            fontSize
          );

          currentPage.drawText(text, {
            x: curX + cellPadding,
            y: nextY + (rowHeight - fontSize) / 2 + 1,
            size: fontSize,
            font: helvetica,
            color: textColor,
          });

          // Vertical cell border
          if (gridLines && c > 0) {
            currentPage.drawLine({
              start: { x: curX, y: nextY },
              end: { x: curX, y: currentY },
              thickness: 0.5,
              color: borderColor,
            });
          }

          curX += colW;
        }

        // Horizontal row bottom line
        if (gridLines) {
          currentPage.drawLine({
            start: { x: margin, y: nextY },
            end: { x: margin + usableWidth, y: nextY },
            thickness: 0.5,
            color: borderColor,
          });
        }

        currentY = nextY;
      }

      // Outer table border for all pages
      if (gridLines) {
        pagesList.forEach((pg) => {
          pg.drawRectangle({
            x: margin,
            y: margin + footerReserve,
            width: usableWidth,
            height: pageHeight - margin * 2 - footerReserve - (includeTitleBanner ? titleBannerHeight : 0),
            borderColor: borderColor,
            borderWidth: 0.5,
          });
        });
      }

      // Page Footers (Page X of Y)
      const totalPages = pagesList.length;
      if (includePageNumbers) {
        pagesList.forEach((pg, idx) => {
          const footerY = margin - 6;
          const pageStr = `Page ${idx + 1} of ${totalPages}`;
          const pageStrW = helvetica.widthOfTextAtSize(pageStr, 8);
          pg.drawText(pageStr, {
            x: pageWidth - margin - pageStrW,
            y: footerY,
            size: 8,
            font: helvetica,
            color: metaTextColor,
          });

          const brandStr = 'Converted by ToolsVerse Excel to PDF';
          pg.drawText(brandStr, {
            x: margin,
            y: footerY,
            size: 8,
            font: helvetica,
            color: metaTextColor,
          });
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      setPdfUrl(url);

      if (downloadImmediately) {
        const link = document.createElement('a');
        link.href = url;
        const cleanBase = fileName.replace(/\.[^/.]+$/, '');
        link.download = `${cleanBase}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      return pdfBytes;
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Error generating PDF. Please check table formatting.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy table as TSV to clipboard
  const copyAsTsv = () => {
    if (!activeSheet) return;
    const tsvText = activeSheet.rows.map((r) => r.join('\t')).join('\n');
    navigator.clipboard.writeText(tsvText).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    });
  };

  // Download active sheet as CSV
  const downloadCsv = () => {
    if (!activeSheet) return;
    const csvContent = activeSheet.rows
      .map((row) =>
        row
          .map((cell) => {
            const escaped = cell.replace(/"/g, '""');
            return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')
              ? `"${escaped}"`
              : escaped;
          })
          .join(',')
      )
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSheet.name || 'export'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm mb-8 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Excel to PDF</span>
        </nav>

        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-xs font-semibold text-primary-700 dark:text-primary-300 mb-3">
            <span>📊 Multi-Sheet Spreadsheet to PDF Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Excel to PDF Converter
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Convert Microsoft Excel (.xlsx, .xls), CSV, and TSV spreadsheets into beautifully
            styled, paginated PDF documents with custom margins, orientations, and grid formatting.
          </p>
        </header>

        {/* Ad Slot */}
        <AdSlot format="horizontal" />

        {/* Upload Dropzone */}
        <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-3xl p-8 sm:p-12 transition-all group bg-white dark:bg-slate-900 shadow-sm mb-8 text-center">
          <input
            type="file"
            accept=".xlsx,.xls,.csv,.tsv,.txt"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={(e) => {
              handleFile(e);
              e.target.value = '';
            }}
          />
          <div className="pointer-events-none flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-3xl text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Choose Excel or CSV Spreadsheet
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
              Drag &amp; drop your .xlsx, .xls, .csv, or .tsv file here, or click to browse
            </p>
            <span className="px-6 py-3 bg-primary-600 group-hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all inline-block">
              Browse Files
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-gray-400 dark:text-slate-500 mt-4">
              <span>✓ 100% Client-side Processing</span>
              <span>•</span>
              <span>✓ Multi-Sheet Support</span>
              <span>•</span>
              <span>✓ Auto-paginated Grid</span>
            </div>
          </div>
        </div>

        {/* Sample dataset banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl mb-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                Loaded: <span className="text-primary-600 dark:text-primary-400">{fileName}</span> ({((fileSize || 0) / 1024).toFixed(1)} KB)
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {sheets.length} sheet{sheets.length > 1 ? 's' : ''} detected • {activeSheet.rows.length} rows in active sheet
              </p>
            </div>
          </div>
          <button
            onClick={loadSampleData}
            className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
          >
            Reset to Sample Data
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 mb-8 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
            <span>⚠️ {errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs underline font-semibold ml-4 hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Sheet Tabs */}
        {sheets.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 mr-2 whitespace-nowrap">
              Sheets:
            </span>
            {sheets.map((sheet, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveSheetIndex(idx);
                  if (pdfUrl) {
                    URL.revokeObjectURL(pdfUrl);
                    setPdfUrl(null);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeSheetIndex === idx
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:border-primary-400'
                }`}
              >
                <span>{sheet.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeSheetIndex === idx
                      ? 'bg-primary-800 text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  {sheet.rows.length}r × {sheet.maxCols}c
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Generated PDF Result Card with Preview First & Download Button */}
        {pdfUrl && (
          <ToolResultCard
            title="Excel Spreadsheet Converted to PDF!"
            filename={`${fileName.replace(/\.[^/.]+$/, '')}.pdf`}
            downloadUrl={pdfUrl}
            badgeText="PDF Generated"
            previewUrl={pdfUrl}
            previewType="pdf"
            details={[
              { label: 'Active Sheet', value: activeSheet?.name || 'Sheet' },
              { label: 'Page Format', value: `${pageSize} (${orientation})` },
              { label: 'Theme', value: headerTheme.toUpperCase() },
            ]}
            onReset={() => {
              if (pdfUrl) URL.revokeObjectURL(pdfUrl);
              setPdfUrl(null);
            }}
            resetButtonText="Reset / Re-adjust Settings"
            nextTool={{
              name: 'Compress PDF',
              url: '/tools/optimize-pdf/compress-pdf',
              description: 'Shrink your newly converted PDF file size.'
            }}
          />
        )}

        {/* Main Grid: Settings & Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Settings Panel */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-slate-800">
              <span>⚙️</span> PDF Layout Settings
            </h2>

            {/* Page Size & Orientation */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400">
                Page Size &amp; Orientation
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['A4', 'Letter', 'Legal'] as PageSize[]).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setPageSize(sz)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      pageSize === sz
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    orientation === 'landscape'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>⬚</span> Landscape (Recommended)
                </button>
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    orientation === 'portrait'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>▯</span> Portrait
                </button>
              </div>
            </div>

            {/* Margins & Font Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 block mb-2">
                  Margins
                </label>
                <select
                  value={margins}
                  onChange={(e) => setMargins(e.target.value as MarginSize)}
                  className="w-full text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 p-2.5 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="compact">Compact (20pt)</option>
                  <option value="normal">Normal (36pt)</option>
                  <option value="wide">Wide (54pt)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 block mb-2">
                  Font Size
                </label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 p-2.5 focus:ring-2 focus:ring-primary-500"
                >
                  <option value={8}>8pt (Small / Dense)</option>
                  <option value={9}>9pt (Recommended)</option>
                  <option value={10}>10pt (Standard)</option>
                  <option value={12}>12pt (Large)</option>
                </select>
              </div>
            </div>

            {/* Header Theme */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 block mb-2">
                Header Accent Theme
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(['indigo', 'slate', 'emerald', 'navy', 'crimson'] as HeaderTheme[]).map(
                  (theme) => (
                    <button
                      key={theme}
                      onClick={() => setHeaderTheme(theme)}
                      className={`h-9 rounded-xl flex items-center justify-center transition-all border-2 ${
                        headerTheme === theme
                          ? 'border-primary-600 scale-105 shadow-sm'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: THEME_COLORS[theme].hex }}
                      title={THEME_COLORS[theme].name}
                    >
                      {headerTheme === theme && (
                        <span className="text-white text-xs font-bold">✓</span>
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Table Styling Toggles */}
            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 block">
                Formatting &amp; Pagination
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={firstRowIsHeader}
                  onChange={(e) => setFirstRowIsHeader(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>First row contains headers</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={repeatHeader}
                  onChange={(e) => setRepeatHeader(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Repeat header on every page</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={zebraStriping}
                  onChange={(e) => setZebraStriping(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Zebra stripe alternate rows</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gridLines}
                  onChange={(e) => setGridLines(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Show table grid lines</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTitleBanner}
                  onChange={(e) => setIncludeTitleBanner(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Include sheet title banner</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePageNumbers}
                  onChange={(e) => setIncludePageNumbers(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Include page numbers in footer</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200 dark:border-slate-800 space-y-2.5">
              <button
                onClick={() => generatePdf(true)}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-3.5 font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 text-sm"
              >
                <span>{isProcessing ? 'Generating PDF...' : '📥 Download Converted PDF'}</span>
              </button>

              <button
                onClick={() => generatePdf(false)}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl px-4 py-2.5 font-semibold transition-colors text-xs"
              >
                <span>👁️ Generate Live Preview</span>
              </button>
            </div>
          </div>

          {/* Interactive Preview Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Table Preview: {activeSheet.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Showing {filteredRows.length} of {activeSheet.rows.length} rows • {activeSheet.maxCols} columns
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Filter table..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500 w-full sm:w-48"
                />
                <button
                  onClick={copyAsTsv}
                  title="Copy as TSV"
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 transition-colors whitespace-nowrap"
                >
                  {copiedNotification ? '✓ Copied' : '📋 Copy'}
                </button>
                <button
                  onClick={downloadCsv}
                  title="Export as CSV"
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 transition-colors whitespace-nowrap"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {/* Scrollable Table View */}
            <div className="my-4 flex-1 overflow-x-auto overflow-y-auto max-h-[500px] border border-gray-200 dark:border-slate-800 rounded-xl">
              <table className="min-w-full text-xs border-collapse">
                <thead>
                  <tr
                    style={{ backgroundColor: THEME_COLORS[headerTheme].hex }}
                    className="text-white sticky top-0 z-10 shadow-xs"
                  >
                    <th className="px-3 py-2.5 text-left font-mono font-normal opacity-80 w-12 border-r border-white/20">
                      #
                    </th>
                    {Array.from({ length: activeSheet.maxCols }).map((_, cIdx) => (
                      <th
                        key={cIdx}
                        className="px-3 py-2.5 text-left font-bold border-r border-white/20 last:border-r-0 whitespace-nowrap"
                      >
                        {firstRowIsHeader && filteredRows.length > 0
                          ? filteredRows[0][cIdx] || `Col ${indexToColLetter(cIdx)}`
                          : `Col ${indexToColLetter(cIdx)}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(firstRowIsHeader ? filteredRows.slice(1) : filteredRows).map(
                    (row, rIdx) => {
                      const isEven = rIdx % 2 === 1;
                      return (
                        <tr
                          key={rIdx}
                          className={`border-b border-gray-200 dark:border-slate-800 transition-colors hover:bg-primary-50/40 dark:hover:bg-primary-950/30 ${
                            zebraStriping && isEven
                              ? 'bg-gray-50/70 dark:bg-slate-800/40'
                              : 'bg-white dark:bg-slate-900'
                          }`}
                        >
                          <td className="px-3 py-2 font-mono text-[11px] text-gray-400 dark:text-slate-500 border-r border-gray-200 dark:border-slate-800">
                            {rIdx + (firstRowIsHeader ? 2 : 1)}
                          </td>
                          {Array.from({ length: activeSheet.maxCols }).map((_, cIdx) => (
                            <td
                              key={cIdx}
                              className={`px-3 py-2 text-gray-800 dark:text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs ${
                                gridLines
                                  ? 'border-r border-gray-200 dark:border-slate-800 last:border-r-0'
                                  : ''
                              }`}
                            >
                              {row[cIdx] || ''}
                            </td>
                          ))}
                        </tr>
                      );
                    }
                  )}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={activeSheet.maxCols + 1}
                        className="py-12 text-center text-gray-400 dark:text-slate-500"
                      >
                        No data matches your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* How to Use Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Convert Excel Spreadsheets to PDF
          </h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-slate-300 space-y-3 text-sm">
            <li>
              <strong>Upload your spreadsheet:</strong> Drag and drop your Excel workbook (<code>.xlsx</code>, <code>.xls</code>) or delimited text file (<code>.csv</code>, <code>.tsv</code>) into the upload area or click &ldquo;Browse Files&rdquo;.
            </li>
            <li>
              <strong>Select Active Sheet:</strong> If your workbook contains multiple worksheets, switch between them using the sheet selector tabs above the preview.
            </li>
            <li>
              <strong>Configure Page Layout &amp; Theme:</strong> Choose your target paper size (A4, Letter, or Legal), orientation (Landscape is optimal for multi-column tables), custom margins, and professional header color theme.
            </li>
            <li>
              <strong>Adjust Table Display Options:</strong> Toggle first-row header styling, repeat headers on each page break, zebra alternating row shading, and table grid borders according to your presentation requirements.
            </li>
            <li>
              <strong>Download Paginated PDF:</strong> Click &ldquo;Download Converted PDF&rdquo; to instantly generate and save your formatted PDF document directly from your browser.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
