'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function SqlFormatter() {
  const [inputSql, setInputSql] = useState('');
  const [outputSql, setOutputSql] = useState('');
  const [copied, setCopied] = useState(false);

  const formatSql = () => {
    let formatted = inputSql
      .replace(/\s+/g, ' ')
      .trim();

    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
      'GROUP BY', 'ORDER BY', 'HAVING', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
      'LIMIT', 'OFFSET', 'UNION', 'ON'
    ];

    // Uppercase keywords and add newlines before them
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, `\n${keyword}`);
    });

    // Add indentations and clean up
    const lines = formatted.split('\n').filter(line => line.trim() !== '');
    let result = '';
    
    lines.forEach(line => {
      let trimmed = line.trim();
      if (keywords.some(k => trimmed.startsWith(k))) {
        result += trimmed + '\n';
      } else {
        result += '    ' + trimmed + '\n';
      }
    });

    // Clean up commas in SELECT
    result = result.replace(/,\s+/g, ',\n    ');

    setOutputSql(result.trim());
  };

  const minifySql = () => {
    const minified = inputSql
      .replace(/\s+/g, ' ')
      .trim();
    setOutputSql(minified);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    setInputSql(`select e.name, d.department_name, sum(s.amount) from employees e inner join departments d on e.dept_id = d.id left join sales s on e.id = s.emp_id where e.status = 'active' group by e.name, d.department_name order by sum(s.amount) desc limit 10`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800 bg-gray-50 min-h-screen">
      <nav className="text-sm mb-6 text-gray-500">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">SQL Formatter</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SQL Formatter</h1>
        <p className="text-gray-600">Beautify, indent, and format messy SQL queries to make them readable.</p>
      </header>

      <AdSlot format="horizontal" />

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">Input SQL Query</label>
              <button onClick={loadSample} className="text-sm text-primary-600 hover:text-primary-700">Load Sample</button>
            </div>
            <textarea
              value={inputSql}
              onChange={(e) => setInputSql(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 font-mono text-sm min-h-[350px]"
              placeholder="Paste your unformatted SQL query here..."
            />
            <div className="flex gap-3 mt-4">
              <button 
                onClick={formatSql}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
              >
                Format SQL
              </button>
              <button 
                onClick={minifySql}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl px-6 py-3 font-semibold transition-colors"
              >
                Minify SQL
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">Output SQL Query</label>
              {outputSql && (
                <button onClick={handleCopy} className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg">
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              )}
            </div>
            <textarea
              value={outputSql}
              readOnly
              className="w-full rounded-2xl border border-gray-300 bg-gray-50 p-4 font-mono text-sm min-h-[350px] whitespace-pre-wrap"
              placeholder="Formatted output will appear here..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use the SQL Formatter</h2>
        <ol className="list-decimal pl-5 space-y-3 text-gray-700">
          <li>Paste your raw or minified SQL query into the <strong>Input SQL Query</strong> box.</li>
          <li>Click the <strong>Format SQL</strong> button to beautify the query. It will uppercase keywords and add logical line breaks and indents.</li>
          <li>If you want to compress a formatted query into a single line, click <strong>Minify SQL</strong>.</li>
          <li>Use the <strong>Copy to Clipboard</strong> button to grab the final output.</li>
        </ol>
      </div>
    </div>
  );
}
