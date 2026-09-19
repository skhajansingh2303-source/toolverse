'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

interface SheetData {
  name: string;
  rows: string[][];
  maxCols: number;
}

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
    name: 'Products',
    rows: [
      ['id', 'name', 'price', 'inStock', 'category'],
      ['101', 'Wireless Mouse', '29.99', 'true', 'Electronics'],
      ['102', 'Desk Lamp', '45.50', 'false', 'Home'],
    ],
    maxCols: 5,
  },
  {
    name: 'Users',
    rows: [
      ['userId', 'email', 'role', 'active'],
      ['1', 'admin@example.com', 'Admin', 'true'],
      ['2', 'user@example.com', 'User', 'true'],
    ],
    maxCols: 4,
  },
];

export default function ExcelToJson() {
  const [fileName, setFileName] = useState<string>('sample-data.xlsx');
  const [fileSize, setFileSize] = useState<number>(14520);
  const [sheets, setSheets] = useState<SheetData[]>(SAMPLE_SHEET_DATA);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Options
  const [format, setFormat] = useState<'objects' | 'arrays' | 'nested'>('objects');
  const [prettyPrint, setPrettyPrint] = useState<boolean>(true);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [includeEmpty, setIncludeEmpty] = useState<boolean>(true);
  const [detectNumbers, setDetectNumbers] = useState<boolean>(true);

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
        if (!workbookFile) throw new Error('Invalid Excel format');

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
                cellValue = vNode?.textContent === '1' ? 'true' : 'false';
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

        if (extractedSheets.length === 0) throw new Error('No data found');

        setSheets(extractedSheets);
        setActiveSheetIndex(0);
      } else {
        throw new Error('Please upload an .xlsx file');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Failed to parse file.');
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

  const parseValue = (val: string) => {
    if (!detectNumbers) return val;
    if (val.toLowerCase() === 'true') return true;
    if (val.toLowerCase() === 'false') return false;
    if (val === '' || val === null) return null;
    const num = Number(val);
    if (!isNaN(num)) return num;
    return val;
  };

  const generateJsonData = () => {
    if (format === 'nested') {
      const result: Record<string, any> = {};
      sheets.forEach(sheet => {
        if (sheet.rows.length === 0) {
          result[sheet.name] = [];
          return;
        }
        const headers = sheet.rows[0];
        const data = sheet.rows.slice(1).map(row => {
          const obj: Record<string, any> = {};
          headers.forEach((h, i) => {
            const val = parseValue(row[i] || '');
            if (includeEmpty || val !== null && val !== '') {
              obj[h || `Column${i}`] = val;
            }
          });
          return obj;
        });
        result[sheet.name] = data;
      });
      return result;
    }

    const currentRows = activeSheet.rows;
    if (currentRows.length === 0) return [];

    if (format === 'arrays') {
      return currentRows.map(row => 
        row.map(cell => parseValue(cell))
      );
    }

    // Default: Objects
    const headers = currentRows[0];
    return currentRows.slice(1).map(row => {
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => {
        const val = parseValue(row[i] || '');
        if (includeEmpty || val !== null && val !== '') {
          obj[h || `Column${i}`] = val;
        }
      });
      return obj;
    });
  };

  const getJsonString = () => {
    const data = generateJsonData();
    return prettyPrint ? JSON.stringify(data, null, indentSize) : JSON.stringify(data);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getJsonString());
    window.dispatchEvent(new CustomEvent('toolsverse-toast', { detail: { message: 'JSON copied to clipboard!', type: 'success' } }));
  };

  const downloadJson = () => {
    const content = getJsonString();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = format === 'nested' ? 'all_sheets.json' : `${activeSheet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Syntax highlighting
  const renderHighlightedJson = (jsonStr: string) => {
    return jsonStr.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-blue-600 dark:text-blue-400';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-amber-700 dark:text-amber-500 font-semibold';
          } else {
            cls = 'text-green-600 dark:text-green-400';
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-orange-600 dark:text-orange-400 font-bold';
        } else if (/null/.test(match)) {
          cls = 'text-gray-500 dark:text-gray-400 italic';
        } else {
          cls = 'text-purple-600 dark:text-purple-400';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="text-sm mb-8 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/tools" className="hover:text-amber-600 dark:hover:text-amber-400">Tools</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Excel to JSON</span>
        </nav>

        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-700 dark:text-amber-300 mb-3">
            <span>💻 Excel to JSON Converter</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Excel to JSON Converter
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Convert Excel spreadsheets directly to JSON format. Configurable object mapping, typing, and pretty-printing.
          </p>
        </header>

        <AdSlot format="horizontal" />

        <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 rounded-3xl p-8 sm:p-12 transition-all group bg-white dark:bg-slate-900 shadow-sm mb-8 text-center">
          <input type="file" accept=".xlsx,.xls" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFile} />
          <div className="pointer-events-none flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-3xl text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              {'{ }'}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Choose Excel File</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Drag & drop your .xlsx, .xls file here, or click to browse</p>
            <span className="px-6 py-3 bg-amber-600 group-hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all inline-block">Browse Files</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl mb-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                Loaded: <span className="text-amber-600 dark:text-amber-400">{fileName}</span> ({((fileSize || 0) / 1024).toFixed(1)} KB)
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {sheets.length} sheet{sheets.length > 1 ? 's' : ''} detected
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

        {sheets.length > 1 && format !== 'nested' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 mr-2 whitespace-nowrap">Sheets:</span>
            {sheets.map((sheet, idx) => (
              <button key={idx} onClick={() => setActiveSheetIndex(idx)} className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${activeSheetIndex === idx ? 'bg-amber-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:border-amber-400'}`}>
                <span>{sheet.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-slate-800">
              <span>⚙️</span> JSON Options
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 block mb-2">Output Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="w-full text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 p-2.5">
                  <option value="objects">Array of Objects (1st row = keys)</option>
                  <option value="arrays">Array of Arrays</option>
                  <option value="nested">Nested Object by Sheet Name</option>
                </select>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={prettyPrint} onChange={(e) => setPrettyPrint(e.target.checked)} className="rounded text-amber-600" />
                <span>Pretty Print JSON</span>
              </label>

              {prettyPrint && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 block mb-2">Indent Size</label>
                  <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))} className="w-full text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 p-2.5">
                    <option value={2}>2 Spaces</option>
                    <option value={4}>4 Spaces</option>
                  </select>
                </div>
              )}

              <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={includeEmpty} onChange={(e) => setIncludeEmpty(e.target.checked)} className="rounded text-amber-600" />
                <span>Include Empty Cells (as null)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={detectNumbers} onChange={(e) => setDetectNumbers(e.target.checked)} className="rounded text-amber-600" />
                <span>Auto-detect Numbers & Booleans</span>
              </label>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-slate-800 space-y-2.5">
              <button onClick={downloadJson} className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-4 py-3 font-bold shadow-md transition-all text-sm">
                Download JSON File
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Live JSON Preview</h3>
              <button onClick={copyToClipboard} className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 transition-colors">
                📋 Copy
              </button>
            </div>
            <div className="mt-4 flex-1 overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50 dark:bg-slate-950 p-4">
              <pre 
                className="text-xs font-mono whitespace-pre"
                dangerouslySetInnerHTML={{ __html: renderHighlightedJson(getJsonString()) }}
              />
            </div>
          </div>
        </div>

        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to Convert Excel to JSON</h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-slate-300 space-y-3 text-sm">
            <li><strong>Upload your spreadsheet:</strong> Drag and drop your .xlsx or .xls file above.</li>
            <li><strong>Choose JSON Structure:</strong> Generate an array of objects using headers, an array of arrays, or combine all sheets into a single nested JSON object.</li>
            <li><strong>Type Casting:</strong> The tool can automatically convert numeric strings to Numbers and "true"/"false" strings to Booleans.</li>
            <li><strong>Export:</strong> Copy the JSON to your clipboard instantly or download it as a .json file.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
