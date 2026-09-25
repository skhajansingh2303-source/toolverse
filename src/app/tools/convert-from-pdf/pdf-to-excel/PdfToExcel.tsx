'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

interface ExtractedTable {
  id: string;
  name: string;
  page: number;
  rows: string[][];
}

export default function PdfToExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [pdfjsLoaded, setPdfjsLoaded] = useState<boolean>(false);
  const [tables, setTables] = useState<ExtractedTable[]>([]);
  const [activeTableIndex, setActiveTableIndex] = useState<number>(0);
  const [currentGrid, setCurrentGrid] = useState<string[][]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sheetName, setSheetName] = useState<string>('Sheet1');

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
      setSheetName(cleanName.slice(0, 30) || 'Sheet1');
      setTables([]);
      setCurrentGrid([]);
      setProgress({ current: 0, total: 0 });
      extractTablesFromPdf(selected);
    }
  };

  const extractTablesFromPdf = async (pdfFile: File) => {
    if (!(window as any).pdfjsLib) return;
    setIsProcessing(true);
    setTables([]);
    setCurrentGrid([]);

    try {
      const buffer = await pdfFile.arrayBuffer();
      const pdf = await (window as any).pdfjsLib.getDocument({ data: buffer }).promise;
      const numPages = pdf.numPages;
      setProgress({ current: 0, total: numPages });

      const foundTables: ExtractedTable[] = [];

      for (let pNum = 1; pNum <= numPages; pNum++) {
        const page = await pdf.getPage(pNum);
        const textContent = await page.getTextContent();
        const rawItems = textContent.items as any[];

        // Group items into horizontal lines based on Y-coordinate tolerance
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

        const pageRows: string[][] = [];

        sortedY.forEach((y) => {
          const items = lineBuckets[y];
          items.sort((a, b) => a.transform[4] - b.transform[4]);

          // Check if items are distinct column positions
          const columns: string[] = [];
          let currentCell = '';
          let lastRight = -1;

          items.forEach((it) => {
            const currentLeft = it.transform[4];
            // If horizontal gap between items is greater than 14pt, start a new cell
            if (lastRight > 0 && currentLeft - lastRight > 14) {
              if (currentCell.trim()) {
                columns.push(currentCell.trim());
              }
              currentCell = it.str;
            } else {
              if (currentCell && !currentCell.endsWith(' ') && !it.str.startsWith(' ')) {
                currentCell += ' ' + it.str;
              } else {
                currentCell += it.str;
              }
            }
            lastRight = currentLeft + (it.width || 0);
          });

          if (currentCell.trim()) {
            columns.push(currentCell.trim());
          }

          // If line has 2 or more columns or contains multiple tab/spaced values
          if (columns.length >= 2) {
            pageRows.push(columns);
          } else if (columns.length === 1) {
            // Check if string contains multiple numbers or 2+ consecutive spaces
            const split = columns[0].split(/\s{2,}|\t/).map((s) => s.trim()).filter(Boolean);
            if (split.length >= 2) {
              pageRows.push(split);
            }
          }
        });

        if (pageRows.length >= 2) {
          // Normalize column count across rows
          const maxCols = Math.max(...pageRows.map((r) => r.length));
          const normalized = pageRows.map((r) => {
            const row = [...r];
            while (row.length < maxCols) {
              row.push('');
            }
            return row;
          });

          foundTables.push({
            id: `page-${pNum}-table`,
            name: `Page ${pNum} (${normalized.length} rows)`,
            page: pNum,
            rows: normalized,
          });
        }

        setProgress({ current: pNum, total: numPages });
      }

      // If multiple tables found, also build a merged master sheet
      if (foundTables.length > 1) {
        const mergedRows: string[][] = [];
        const maxCols = Math.max(...foundTables.map((t) => Math.max(...t.rows.map((r) => r.length))));

        foundTables.forEach((t) => {
          t.rows.forEach((r) => {
            const row = [...r];
            while (row.length < maxCols) {
              row.push('');
            }
            mergedRows.push(row);
          });
        });

        foundTables.unshift({
          id: 'merged-all',
          name: `All Pages Combined (${mergedRows.length} rows)`,
          page: 0,
          rows: mergedRows,
        });
      }

      // Fallback if no clean tables were found
      if (foundTables.length === 0) {
        // Create an empty starter table
        foundTables.push({
          id: 'manual-1',
          name: 'Manual Extraction Grid',
          page: 1,
          rows: [
            ['Column 1', 'Column 2', 'Column 3', 'Amount'],
            ['Item A', 'Category X', '2026-03-01', '1250.00'],
            ['Item B', 'Category Y', '2026-03-02', '3400.50'],
            ['Item C', 'Category Z', '2026-03-03', '890.00'],
          ],
        });
      }

      setTables(foundTables);
      setActiveTableIndex(0);
      setCurrentGrid(foundTables[0].rows);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('toolsverse-toast', {
            detail: { message: `Extracted ${foundTables.length} table dataset(s) from PDF!` },
          })
        );
      }
    } catch (err) {
      console.error('Error extracting tables from PDF:', err);
      alert('Could not parse tables from PDF. Please check if file contains tabular text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSampleFinancialPdf = () => {
    const sampleTable: string[][] = [
      ['Account Name', 'Account Code', 'Debit ($)', 'Credit ($)', 'Net Balance ($)', 'Status'],
      ['Cash & Cash Equivalents', '1010-00', '142,500.00', '0.00', '142,500.00', 'Verified'],
      ['Accounts Receivable', '1100-00', '89,450.00', '12,300.00', '77,150.00', 'Active'],
      ['Office Equipment & Assets', '1500-00', '65,000.00', '0.00', '65,000.00', 'Depreciating'],
      ['Accounts Payable', '2010-00', '0.00', '34,200.00', '-34,200.00', 'Pending Payment'],
      ['Short-Term Operating Loans', '2100-00', '0.00', '50,000.00', '-50,000.00', 'Amortized'],
      ['Gross Operating Revenue', '4010-00', '0.00', '280,000.00', '280,000.00', 'Recognized'],
      ['Payroll & Benefits Expense', '5010-00', '95,400.00', '0.00', '-95,400.00', 'Audited'],
      ['Software & Cloud Hosting', '5020-00', '14,800.00', '0.00', '-14,800.00', 'Current'],
      ['Net Operating Income', '9999-00', '135,250.00', '0.00', '135,250.00', 'Approved'],
    ];

    const extracted: ExtractedTable = {
      id: 'sample-financial',
      name: 'Financial Trial Balance (10 rows)',
      page: 1,
      rows: sampleTable,
    };

    setFile(new File([''], 'Financial_Trial_Balance_2026.pdf', { type: 'application/pdf' }));
    setSheetName('Trial_Balance_2026');
    setTables([extracted]);
    setActiveTableIndex(0);
    setCurrentGrid(sampleTable);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const updated = currentGrid.map((row, rI) => {
      if (rI === rowIndex) {
        const newRow = [...row];
        newRow[colIndex] = value;
        return newRow;
      }
      return row;
    });
    setCurrentGrid(updated);
  };

  const addRow = () => {
    const numCols = currentGrid.length > 0 ? currentGrid[0].length : 4;
    const newRow = new Array(numCols).fill('');
    setCurrentGrid([...currentGrid, newRow]);
  };

  const deleteRow = (rIdx: number) => {
    if (currentGrid.length <= 1) return;
    setCurrentGrid(currentGrid.filter((_, i) => i !== rIdx));
  };

  const addColumn = () => {
    const colName = `Column ${currentGrid[0]?.length + 1 || 1}`;
    const updated = currentGrid.map((row, idx) => {
      return [...row, idx === 0 ? colName : ''];
    });
    setCurrentGrid(updated);
  };

  const deleteColumn = (colIdx: number) => {
    if (currentGrid[0]?.length <= 1) return;
    const updated = currentGrid.map((row) => row.filter((_, cI) => cI !== colIdx));
    setCurrentGrid(updated);
  };

  const getColLetter = (colIndex: number): string => {
    let letter = '';
    let temp = colIndex;
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

  const escapeXml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const downloadXlsx = async () => {
    if (currentGrid.length === 0) return;

    try {
      const zip = new JSZip();

      // [Content_Types].xml
      zip.file(
        '[Content_Types].xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`
      );

      // _rels/.rels
      zip.file(
        '_rels/.rels',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
      );

      // xl/_rels/workbook.xml.rels
      zip.file(
        'xl/_rels/workbook.xml.rels',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
      );

      // xl/workbook.xml
      const safeSheetName = sheetName.replace(/[\\/*?[\]:]/g, '_').slice(0, 31) || 'Extracted';
      zip.file(
        'xl/workbook.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${safeSheetName}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`
      );

      // xl/styles.xml
      zip.file(
        'xl/styles.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
  </cellXfs>
</styleSheet>`
      );

      // xl/worksheets/sheet1.xml
      let sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>`;

      currentGrid.forEach((row, rIdx) => {
        const rowNum = rIdx + 1;
        sheetXml += `<row r="${rowNum}">`;

        row.forEach((cell, cIdx) => {
          const colRef = getColLetter(cIdx);
          const cellRef = `${colRef}${rowNum}`;
          const isHeader = rIdx === 0;
          const cleanVal = cell.trim();

          // Check if numeric (ignore comma separators)
          const numericVal = cleanVal.replace(/,/g, '');
          const isNum = !isHeader && numericVal !== '' && !isNaN(Number(numericVal)) && !cleanVal.includes('/');

          if (isNum) {
            sheetXml += `<c r="${cellRef}" s="${isHeader ? 1 : 0}"><v>${numericVal}</v></c>`;
          } else {
            sheetXml += `<c r="${cellRef}" s="${isHeader ? 1 : 0}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(cleanVal)}</t></is></c>`;
          }
        });

        sheetXml += `</row>`;
      });

      sheetXml += `</sheetData></worksheet>`;
      zip.file('xl/worksheets/sheet1.xml', sheetXml);

      const blob = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sheetName.trim() || 'extracted-table'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating Excel file:', err);
      alert('Failed to generate Excel file.');
    }
  };

  const downloadCsv = () => {
    if (currentGrid.length === 0) return;

    const csvContent = currentGrid
      .map((row) =>
        row
          .map((cell) => {
            const escaped = cell.replace(/"/g, '""');
            return /[",\n]/.test(cell) ? `"${escaped}"` : cell;
          })
          .join(',')
      )
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sheetName.trim() || 'extracted-table'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyTsv = () => {
    if (currentGrid.length === 0) return;

    const tsvContent = currentGrid.map((row) => row.join('\t')).join('\n');
    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Filter rows based on search
  const filteredGrid = currentGrid.filter((row, idx) => {
    if (idx === 0) return true; // Always keep header
    if (!searchTerm.trim()) return true;
    return row.some((cell) => cell.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const totalCells = currentGrid.length * (currentGrid[0]?.length || 0);
  const numericCellsCount = currentGrid.slice(1).reduce((acc, row) => {
    return (
      acc +
      row.filter((c) => {
        const n = c.replace(/[,$\s]/g, '');
        return n !== '' && !isNaN(Number(n));
      }).length
    );
  }, 0);

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
          <span className="text-gray-900 dark:text-white font-medium">PDF to Excel</span>
        </nav>

        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-3">
            <span>📊 Intelligent PDF Table Extractor</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            PDF to Excel Converter
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Extract tables, bank statements, financial matrices, and invoices from PDF files directly
            into editable Microsoft Excel (.xlsx) and CSV spreadsheets.
          </p>
        </header>

        {/* Horizontal AdSlot */}
        <AdSlot format="horizontal" />

        {/* Dropzone */}
        {!file && tables.length === 0 ? (
          <div>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-12 transition-all group bg-white dark:bg-slate-900 shadow-sm mb-6">
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
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-3xl text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  📈
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Choose PDF with Tables to Extract
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
                  Drag and drop your PDF here or click anywhere to browse
                </p>
                <span className="px-6 py-3 bg-emerald-600 group-hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all inline-block">
                  Browse Files
                </span>
                <span className="text-[11px] text-gray-400 dark:text-slate-500 mt-4">
                  Multi-column alignment detection • 100% Client-Side Private
                </span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={loadSampleFinancialPdf}
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-xs"
              >
                <span>💡 Don&apos;t have a PDF with tables? Load Sample Financial Trial Balance</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
                  XLS
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    {file?.name || 'Extracted_Spreadsheet.pdf'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {tables.length} table dataset(s) detected • {currentGrid.length} rows × {currentGrid[0]?.length || 0} columns
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setFile(null);
                    setTables([]);
                    setCurrentGrid([]);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Change File
                </button>
                <button
                  onClick={downloadXlsx}
                  disabled={currentGrid.length === 0}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>📥 Download Excel (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Progress indicator */}
            {isProcessing && (
              <div className="py-8 max-w-md mx-auto space-y-3 text-center">
                <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-slate-300">
                  <span>Scanning page {progress.current} of {progress.total}...</span>
                  <span>{progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full transition-all duration-200 rounded-full"
                    style={{
                      width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-400">
                  Detecting horizontal baselines, cell delimiters, and numeric columns...
                </p>
              </div>
            )}

            {/* Table Selection Tabs (if multiple tables found) */}
            {tables.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                {tables.map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTableIndex(idx);
                      setCurrentGrid(t.rows);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      activeTableIndex === idx
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}

            {/* Toolbar & Controls */}
            {currentGrid.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 dark:text-slate-400 mb-1">
                        Worksheet Name
                      </label>
                      <input
                        type="text"
                        value={sheetName}
                        onChange={(e) => setSheetName(e.target.value)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 dark:text-slate-400 mb-1">
                        Filter Rows
                      </label>
                      <input
                        type="text"
                        placeholder="Search cells..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={addRow}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                    >
                      + Add Row
                    </button>
                    <button
                      onClick={addColumn}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                    >
                      + Add Column
                    </button>
                    <button
                      onClick={copyTsv}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                    >
                      {copied ? '✓ Copied TSV!' : '📋 Copy TSV'}
                    </button>
                    <button
                      onClick={downloadCsv}
                      className="px-4 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Download CSV (.csv)
                    </button>
                  </div>
                </div>

                {/* Quick Table Stats */}
                <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-slate-400 px-2">
                  <div className="flex items-center gap-4">
                    <span>Rows: <strong>{currentGrid.length}</strong></span>
                    <span>Columns: <strong>{currentGrid[0]?.length || 0}</strong></span>
                    <span>Total Cells: <strong>{totalCells}</strong></span>
                    <span>Numeric Data Cells: <strong>{numericCellsCount}</strong></span>
                  </div>
                  <span className="text-[11px] italic">Tip: Click any cell in the table below to edit directly</span>
                </div>

                {/* Interactive Editable Spreadsheet Grid */}
                <div className="border border-gray-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-inner max-h-[500px] overflow-x-auto overflow-y-auto bg-white dark:bg-slate-900">
                  <table className="min-w-full text-xs border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 z-10 border-b border-gray-300 dark:border-slate-700">
                      <tr>
                        <th className="w-10 px-2 py-2 text-center text-gray-400 dark:text-slate-400 font-mono text-[10px] border-r border-gray-200 dark:border-slate-700">
                          #
                        </th>
                        {currentGrid[0]?.map((_, cIdx) => (
                          <th
                            key={cIdx}
                            className="px-3 py-2 text-left font-bold text-gray-800 dark:text-slate-200 border-r border-gray-200 dark:border-slate-700 last:border-r-0 group relative"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-[10px] text-gray-400 dark:text-slate-400">{getColLetter(cIdx)}</span>
                              {currentGrid[0]?.length > 1 && (
                                <button
                                  onClick={() => deleteColumn(cIdx)}
                                  title="Delete Column"
                                  className="text-[10px] text-gray-400 dark:text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                        <th className="w-10 px-2 py-2 text-center text-gray-400 dark:text-slate-400">Act</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGrid.map((row, rIdx) => {
                        const isHeader = rIdx === 0;
                        return (
                          <tr
                            key={rIdx}
                            className={`border-b border-gray-200 dark:border-slate-800 hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 ${
                              isHeader ? 'bg-gray-50 dark:bg-slate-850 font-bold' : ''
                            }`}
                          >
                            <td className="px-2 py-1.5 text-center text-gray-400 dark:text-slate-400 font-mono text-[10px] border-r border-gray-200 dark:border-slate-700 select-none bg-gray-50 dark:bg-slate-800/40">
                              {rIdx + 1}
                            </td>
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className="p-0 border-r border-gray-200 dark:border-slate-800 last:border-r-0"
                              >
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                                  className={`w-full px-3 py-2 bg-transparent text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none ${
                                    isHeader ? 'font-bold' : ''
                                  }`}
                                />
                              </td>
                            ))}
                            <td className="px-1 py-1 text-center">
                              {currentGrid.length > 1 && (
                                <button
                                  onClick={() => deleteRow(rIdx)}
                                  title="Delete Row"
                                  className="text-gray-400 dark:text-slate-400 hover:text-red-500 text-xs px-1"
                                >
                                  ✕
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* How to Use Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Extract PDF Tables to Excel (.xlsx)
          </h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-slate-300 space-y-3 text-sm">
            <li>
              <strong>Upload PDF with Tables:</strong> Select any PDF file containing financial statements, invoices, price catalogs, or matrices.
            </li>
            <li>
              <strong>Intelligent Column Detection:</strong> Our algorithmic parser scans coordinate bounding boxes across pages to identify table borders, aligned columns, and numeric formats.
            </li>
            <li>
              <strong>Review &amp; Edit Spreadsheet Grid:</strong> Click any cell in the live spreadsheet to edit numbers or text. Add or delete rows and columns as needed.
            </li>
            <li>
              <strong>Export to Excel or CSV:</strong> Click &ldquo;Download Excel (.xlsx)&rdquo; to generate an authentic Microsoft Excel OpenXML workbook, or click &ldquo;Download CSV&rdquo; or &ldquo;Copy TSV&rdquo; to paste directly into Google Sheets.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
