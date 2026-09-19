'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

interface SheetData {
  name: string;
  rows: string[][];
  maxCols: number;
}

// Same parsing logic from reference
function colLetterToIndex(colStr: string): number {
  let index = 0;
  const upper = colStr.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    index = index * 26 + (upper.charCodeAt(i) - 64);
  }
  return index - 1;
}

const SAMPLE_SHEET_DATA: SheetData[] = [
  {
    name: 'Sales Data',
    rows: [
      ['Region', 'Product', 'Units', 'Revenue', 'Target'],
      ['North America', 'Enterprise Software', '1,450', '1232500.00', '1100000.00'],
      ['Europe', 'Consulting Services', '320', '480000.00', '400000.00'],
    ],
    maxCols: 5,
  },
  {
    name: 'Employee Directory',
    rows: [
      ['Emp ID', 'Full Name', 'Department', 'Location'],
      ['TV-1001', 'Alexander Wright', 'Engineering', 'San Francisco, CA'],
      ['TV-1002', 'Elena Rostova', 'Design', 'London, UK'],
    ],
    maxCols: 4,
  },
];

export default function ExcelToCsv() {
  const [fileName, setFileName] = useState<string>('sample-data.xlsx');
  const [fileSize, setFileSize] = useState<number>(14520);
  const [sheets, setSheets] = useState<SheetData[]>(SAMPLE_SHEET_DATA);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Options
  const [delimiter, setDelimiter] = useState<string>(',');
  const [quoteStyle, setQuoteStyle] = useState<'as-needed' | 'always'>('as-needed');
  const [includeHeader, setIncludeHeader] = useState<boolean>(true);
  const [lineEnding, setLineEnding] = useState<'CRLF' | 'LF'>('CRLF');
  const [encoding, setEncoding] = useState<'UTF-8' | 'ASCII'>('UTF-8');

  const activeSheet = sheets[activeSheetIndex] || sheets[0];

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setFileName(file.name);
    setFileSize(file.size);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'xlsx') {
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

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

        const workbookFile = zip.file('xl/workbook.xml');
        if (!workbookFile) throw new Error('Invalid Excel file format: missing xl/workbook.xml');

        const wbXmlText = await workbookFile.async('text');
        const parser = new DOMParser();
        const wbDoc = parser.parseFromString(wbXmlText, 'text/xml');
        const sheetNodes = wbDoc.getElementsByTagName('sheet');

        const relsFile = zip.file('xl/_rels/workbook.xml.rels');
        const relsMap: Record<string, string> = {};
        if (relsFile) {
          const relsXml = await relsFile.async('text');
          const relsDoc = parser.parseFromString(relsXml, 'text/xml');
          const relNodes = relsDoc.getElementsByTagName('Relationship');
          for (let i = 0; i < relNodes.length; i++) {
            relsMap[relNodes[i].getAttribute('Id') || ''] = relNodes[i].getAttribute('Target') || '';
          }
        }

        const extractedSheets: SheetData[] = [];

        for (let s = 0; s < sheetNodes.length; s++) {
          const sNode = sheetNodes[s];
          const sheetName = sNode.getAttribute('name') || `Sheet${s + 1}`;
          const rId = sNode.getAttribute('r:id') || sNode.getAttribute('id') || `rId${s + 1}`;
          let targetPath = relsMap[rId] || `worksheets/sheet${s + 1}.xml`;
          if (!targetPath.startsWith('xl/')) targetPath = `xl/${targetPath}`;

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
              const colIndex = colLetters ? colLetterToIndex(colLetters) : cIdx;
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

          while (
            rowsList.length > 0 &&
            rowsList[rowsList.length - 1].every((cell) => !cell || cell.trim() === '')
          ) {
            rowsList.pop();
          }

          if (rowsList.length > 0) {
            extractedSheets.push({ name: sheetName, rows: rowsList, maxCols: totalCols });
          }
        }

        if (extractedSheets.length === 0) throw new Error('No data found in worksheets.');

        setSheets(extractedSheets);
        setActiveSheetIndex(0);
      } else {
        throw new Error('Please upload an .xlsx file');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Failed to parse spreadsheet file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSampleData = () => {
    setFileName('sample-data.xlsx');
    setFileSize(14520);
    setSheets(SAMPLE_SHEET_DATA);
    setActiveSheetIndex(0);
    setErrorMessage(null);
  };

  const getCsvContent = (sheet: SheetData) => {
    let rowsToProcess = sheet.rows;
    if (!includeHeader && rowsToProcess.length > 0) {
      rowsToProcess = rowsToProcess.slice(1);
    }
    const EOL = lineEnding === 'CRLF' ? '\r\n' : '\n';
    
    return rowsToProcess.map(row => {
      return row.map(cell => {
        let val = cell.replace(/"/g, '""');
        if (quoteStyle === 'always' || val.includes(delimiter) || val.includes('\n') || val.includes('"')) {
          return `"${val}"`;
        }
        return val;
      }).join(delimiter);
    }).join(EOL);
  };

  const copyToClipboard = () => {
    if (!activeSheet) return;
    const content = getCsvContent(activeSheet);
    navigator.clipboard.writeText(content);
    window.dispatchEvent(new CustomEvent('toolsverse-toast', { detail: { message: 'Copied to clipboard!', type: 'success' } }));
  };

  const downloadSheet = (sheet: SheetData) => {
    const content = getCsvContent(sheet);
    const blob = new Blob([content], { type: `text/csv;charset=${encoding === 'UTF-8' ? 'utf-8' : 'ascii'}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sheet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllAsZip = async () => {
    if (sheets.length === 0) return;
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      sheets.forEach(sheet => {
        zip.file(`${sheet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`, getCsvContent(sheet));
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace(/\.[^/.]+$/, '')}_all_sheets.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="text-sm mb-8 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-green-600 dark:hover:text-green-400">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/tools" className="hover:text-green-600 dark:hover:text-green-400">Tools</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Excel to CSV</span>
        </nav>

        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/60 border border-green-200 dark:border-green-800 text-xs font-semibold text-green-700 dark:text-green-300 mb-3">
            <span>📊 Multi-Sheet Excel to CSV</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Excel to CSV Converter
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Convert Excel (.xlsx, .xls) spreadsheets to CSV format with custom delimiters and quote styles.
          </p>
        </header>

        <AdSlot format="horizontal" />

        <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 rounded-3xl p-8 sm:p-12 transition-all group bg-white dark:bg-slate-900 shadow-sm mb-8 text-center">
          <input type="file" accept=".xlsx,.xls" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFile} />
          <div className="pointer-events-none flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/60 flex items-center justify-center text-3xl text-green-600 dark:text-green-400 mb-4 group-hover:scale-110 transition-transform">
              📄
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Choose Excel File</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Drag & drop your .xlsx, .xls file here, or click to browse</p>
            <span className="px-6 py-3 bg-green-600 group-hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all inline-block">Browse Files</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl mb-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                Loaded: <span className="text-green-600 dark:text-green-400">{fileName}</span> ({((fileSize || 0) / 1024).toFixed(1)} KB)
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {sheets.length} sheet{sheets.length > 1 ? 's' : ''} detected • {activeSheet.rows.length} rows, {activeSheet.maxCols} columns
              </p>
            </div>
          </div>
          <button onClick={loadSampleData} className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg font-medium transition-colors">
            Reset to Sample Data
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 mb-8 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
            <span>⚠️ {errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-xs underline font-semibold ml-4 hover:text-red-900">Dismiss</button>
          </div>
        )}

        {sheets.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 mr-2 whitespace-nowrap">Sheets:</span>
            {sheets.map((sheet, idx) => (
              <button key={idx} onClick={() => setActiveSheetIndex(idx)} className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${activeSheetIndex === idx ? 'bg-green-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:border-green-400'}`}>
                <span>{sheet.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-slate-800">
              <span>⚙️</span> CSV Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 block mb-2">Delimiter</label>
                <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} className="w-full text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 p-2.5">
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\t">Tab (\t)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 block mb-2">Quote Style</label>
                <select value={quoteStyle} onChange={(e) => setQuoteStyle(e.target.value as any)} className="w-full text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 p-2.5">
                  <option value="as-needed">As Needed (Standard)</option>
                  <option value="always">Always Quote All Fields</option>
                </select>
              </div>
              <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={includeHeader} onChange={(e) => setIncludeHeader(e.target.checked)} className="rounded text-green-600" />
                <span>Include header row</span>
              </label>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 block mb-2">Line Ending</label>
                <select value={lineEnding} onChange={(e) => setLineEnding(e.target.value as any)} className="w-full text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 p-2.5">
                  <option value="CRLF">CRLF (Windows)</option>
                  <option value="LF">LF (Unix/Mac)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 block mb-2">Encoding</label>
                <select value={encoding} onChange={(e) => setEncoding(e.target.value as any)} className="w-full text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 p-2.5">
                  <option value="UTF-8">UTF-8</option>
                  <option value="ASCII">ASCII</option>
                </select>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-slate-800 space-y-2.5">
              <button onClick={() => downloadSheet(activeSheet)} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-3 font-bold shadow-md transition-all text-sm">
                Download Active Sheet (CSV)
              </button>
              {sheets.length > 1 && (
                <button onClick={downloadAllAsZip} className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-4 py-3 font-bold shadow-md transition-all text-sm">
                  Download All as ZIP
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Data Preview: {activeSheet.name}</h3>
              <button onClick={copyToClipboard} className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 transition-colors">
                📋 Copy CSV
              </button>
            </div>
            <div className="mt-4 flex-1 overflow-x-auto overflow-y-auto max-h-[500px] border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50 dark:bg-slate-950 p-4">
              <pre className="text-xs font-mono text-gray-800 dark:text-slate-300 whitespace-pre-wrap">
                {getCsvContent(activeSheet)}
              </pre>
            </div>
          </div>
        </div>

        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to Convert Excel to CSV</h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-slate-300 space-y-3 text-sm">
            <li><strong>Upload your spreadsheet:</strong> Drag and drop your Excel workbook into the area above.</li>
            <li><strong>Select Options:</strong> Adjust delimiter, line endings, and quote styles.</li>
            <li><strong>Preview:</strong> Check the preview window to see exactly how your data will look.</li>
            <li><strong>Download:</strong> Export just the active sheet, or download a ZIP archive containing all sheets.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
