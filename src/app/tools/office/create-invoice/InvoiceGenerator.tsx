'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import FeedbackWidget from '@/components/FeedbackWidget';
import RelatedTools from '@/components/RelatedTools';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export default function InvoiceGenerator() {
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState('$');

  // Business info
  const [fromName, setFromName] = useState('Your Company / Name');
  const [fromEmail, setFromEmail] = useState('billing@example.com');
  const [fromAddress, setFromAddress] = useState('123 Business St, City, Country');

  // Client info
  const [toName, setToName] = useState('Client Name');
  const [toEmail, setToEmail] = useState('client@example.com');
  const [toAddress, setToAddress] = useState('456 Client Ave, City, Country');

  // Line items
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Web Development Services', quantity: 1, rate: 500 },
    { id: '2', description: 'UI/UX Design Mockups', quantity: 2, rate: 150 },
  ]);

  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [notes, setNotes] = useState('Payment is due within 15 days of invoice date. Thank you for your business!');
  const [isGenerating, setIsGenerating] = useState(false);

  // Live calculation (0ms instantaneous)
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const taxAmount = useMemo(() => {
    return ((subtotal - discountAmount) * taxPercent) / 100;
  }, [subtotal, discountAmount, taxPercent]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), description: 'New Service / Item', quantity: 1, rate: 100 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, val: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Header Banner
      page.drawRectangle({
        x: 0,
        y: height - 100,
        width: width,
        height: 100,
        color: rgb(0.08, 0.12, 0.22),
      });

      page.drawText('INVOICE', {
        x: 40,
        y: height - 60,
        size: 28,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      page.drawText(`${invoiceNumber}`, {
        x: width - 200,
        y: height - 55,
        size: 16,
        font: fontBold,
        color: rgb(0.8, 0.85, 1),
      });

      let currentY = height - 130;

      // Dates
      page.drawText(`Date: ${invoiceDate}`, { x: width - 200, y: currentY, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
      if (dueDate) {
        page.drawText(`Due: ${dueDate}`, { x: width - 200, y: currentY - 14, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
      }

      // From & To Columns
      page.drawText('FROM:', { x: 40, y: currentY, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(fromName || 'Your Name', { x: 40, y: currentY - 15, size: 11, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(fromEmail || '', { x: 40, y: currentY - 28, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(fromAddress || '', { x: 40, y: currentY - 40, size: 9, font, color: rgb(0.4, 0.4, 0.4) });

      page.drawText('BILL TO:', { x: 250, y: currentY, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(toName || 'Client Name', { x: 250, y: currentY - 15, size: 11, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(toEmail || '', { x: 250, y: currentY - 28, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(toAddress || '', { x: 250, y: currentY - 40, size: 9, font, color: rgb(0.4, 0.4, 0.4) });

      currentY -= 80;

      // Table Header
      page.drawRectangle({
        x: 40,
        y: currentY,
        width: width - 80,
        height: 24,
        color: rgb(0.94, 0.96, 0.98),
      });

      page.drawText('Item / Description', { x: 50, y: currentY + 7, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText('Qty', { x: 330, y: currentY + 7, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText('Rate', { x: 410, y: currentY + 7, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText('Amount', { x: 485, y: currentY + 7, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

      currentY -= 20;

      // Table Rows
      items.forEach((item) => {
        page.drawText(item.description.slice(0, 45), { x: 50, y: currentY, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(`${item.quantity}`, { x: 335, y: currentY, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(`${currency}${item.rate.toFixed(2)}`, { x: 410, y: currentY, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(`${currency}${(item.quantity * item.rate).toFixed(2)}`, { x: 485, y: currentY, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
        currentY -= 20;
      });

      currentY -= 15;

      // Totals Box
      const totalsX = 380;
      page.drawText('Subtotal:', { x: totalsX, y: currentY, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(`${currency}${subtotal.toFixed(2)}`, { x: 485, y: currentY, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      currentY -= 16;

      if (discountPercent > 0) {
        page.drawText(`Discount (${discountPercent}%):`, { x: totalsX, y: currentY, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
        page.drawText(`-${currency}${discountAmount.toFixed(2)}`, { x: 485, y: currentY, size: 10, font, color: rgb(0.8, 0.2, 0.2) });
        currentY -= 16;
      }

      if (taxPercent > 0) {
        page.drawText(`Tax (${taxPercent}%):`, { x: totalsX, y: currentY, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
        page.drawText(`+${currency}${taxAmount.toFixed(2)}`, { x: 485, y: currentY, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
        currentY -= 16;
      }

      // Final Total Highlight
      page.drawRectangle({
        x: totalsX - 10,
        y: currentY - 5,
        width: width - totalsX - 30,
        height: 25,
        color: rgb(0.9, 0.95, 1),
      });
      page.drawText('Total Due:', { x: totalsX, y: currentY + 2, size: 12, font: fontBold, color: rgb(0.08, 0.12, 0.22) });
      page.drawText(`${currency}${total.toFixed(2)}`, { x: 485, y: currentY + 2, size: 12, font: fontBold, color: rgb(0.08, 0.12, 0.22) });

      // Notes
      if (notes) {
        page.drawText('Terms & Notes:', { x: 40, y: 120, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(notes.slice(0, 150), { x: 40, y: 105, size: 8, font, color: rgb(0.4, 0.4, 0.4) });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber || 'invoice'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.dispatchEvent(new CustomEvent('toolsverse-toast', { detail: { message: '📄 Invoice PDF generated & downloaded!' } }));
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF invoice.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Invoice Generator</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-sm">
              🧾
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Professional Invoice Generator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
            Create and download elegant PDF invoices and receipts in real time. 100% private in-browser.
          </p>
        </div>

        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-primary-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
        >
          {isGenerating ? (
            <span>Generating PDF...</span>
          ) : (
            <>
              <span>Download PDF Invoice</span>
              <span>↓</span>
            </>
          )}
        </button>
      </div>

      <AdSlot format="horizontal" />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        
        {/* Left Column: Form Controls */}
        <div className="space-y-6">
          
          {/* Metadata Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-xs uppercase font-extrabold text-primary-600 dark:text-primary-400 tracking-wider">
              Invoice Details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">Invoice #</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none font-bold"
                >
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="₹">₹ (INR)</option>
                  <option value="¥">¥ (JPY/CNY)</option>
                  <option value="A$">A$ (AUD)</option>
                  <option value="C$">C$ (CAD)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Parties Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* From */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-2.5">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Your Info (From)</h3>
              <input
                type="text"
                placeholder="Your Business / Full Name"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none"
              />
              <textarea
                placeholder="Street Address, City, Country"
                rows={2}
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none resize-none"
              />
            </div>

            {/* To */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-2.5">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Client Info (Bill To)</h3>
              <input
                type="text"
                placeholder="Client Name / Company"
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none"
              />
              <input
                type="email"
                placeholder="Client Email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none"
              />
              <textarea
                placeholder="Client Address, City, Country"
                rows={2}
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none resize-none"
              />
            </div>
          </div>

          {/* Line Items Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-extrabold text-primary-600 dark:text-primary-400 tracking-wider">
                Line Items
              </h3>
              <button
                onClick={addItem}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                <span>+ Add Item</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.description}
                    placeholder="Description"
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none font-medium"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    placeholder="Qty"
                    onChange={(e) => updateItem(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-center font-semibold"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    placeholder="Rate"
                    onChange={(e) => updateItem(item.id, 'rate', Math.max(0, Number(e.target.value)))}
                    className="w-24 px-2 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-right font-semibold"
                  />
                  <span className="w-20 text-right text-xs font-bold text-gray-900 dark:text-white">
                    {currency}{(item.quantity * item.rate).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 dark:text-slate-400 hover:text-rose-500 p-1 text-sm transition-colors"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Taxes & Discounts */}
            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-600 dark:text-slate-400">Discount %:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-14 px-2 py-1 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-center font-bold"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-600 dark:text-slate-400">Tax %:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-14 px-2 py-1 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-center font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-gray-900 dark:text-white">Payment Terms &amp; Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none resize-none font-medium"
            />
          </div>

        </div>

        {/* Right Column: Live Instant Invoice Document Preview */}
        <div className="sticky top-20">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden">
            
            {/* Live Invoice Preview Sheet */}
            <div className="p-8 text-gray-800 dark:text-slate-200 space-y-6">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-slate-800 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-950 dark:text-white tracking-tight">INVOICE</h3>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-bold mt-0.5">{invoiceNumber}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-gray-400 dark:text-slate-400">Date: <strong className="text-gray-900 dark:text-white">{invoiceDate}</strong></p>
                  {dueDate && <p className="text-gray-400 dark:text-slate-400 mt-0.5">Due: <strong className="text-gray-900 dark:text-white">{dueDate}</strong></p>}
                </div>
              </div>

              {/* From / Bill To */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-gray-400 dark:text-slate-400 tracking-wider">From</span>
                  <p className="font-bold text-gray-950 dark:text-white mt-1">{fromName || 'Your Business'}</p>
                  <p className="text-gray-500 dark:text-slate-400 text-[11px]">{fromEmail}</p>
                  <p className="text-gray-500 dark:text-slate-400 text-[11px] whitespace-pre-line">{fromAddress}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-gray-400 dark:text-slate-400 tracking-wider">Billed To</span>
                  <p className="font-bold text-gray-950 dark:text-white mt-1">{toName || 'Client Name'}</p>
                  <p className="text-gray-500 dark:text-slate-400 text-[11px]">{toEmail}</p>
                  <p className="text-gray-500 dark:text-slate-400 text-[11px] whitespace-pre-line">{toAddress}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-800/70 text-gray-600 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {items.map((it) => (
                      <tr key={it.id}>
                        <td className="p-3 font-medium text-gray-900 dark:text-slate-100">{it.description}</td>
                        <td className="p-3 text-center text-gray-500 dark:text-slate-400">{it.quantity}</td>
                        <td className="p-3 text-right text-gray-500 dark:text-slate-400">{currency}{it.rate.toFixed(2)}</td>
                        <td className="p-3 text-right font-bold text-gray-900 dark:text-white">{currency}{(it.quantity * it.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Calculations */}
              <div className="flex justify-end">
                <div className="w-56 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-500 dark:text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{currency}{subtotal.toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount ({discountPercent}%):</span>
                      <span>-{currency}{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {taxPercent > 0 && (
                    <div className="flex justify-between text-gray-500 dark:text-slate-400">
                      <span>Tax ({taxPercent}%):</span>
                      <span className="font-semibold text-gray-900 dark:text-white">+{currency}{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-gray-950 dark:text-white pt-2 border-t border-gray-200 dark:border-slate-800">
                    <span>Total Due:</span>
                    <span className="text-primary-600 dark:text-primary-400">{currency}{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {notes && (
                <div className="pt-4 border-t border-gray-100 dark:border-slate-800 text-[11px] text-gray-500 dark:text-slate-400">
                  <span className="font-bold text-gray-700 dark:text-slate-300">Notes: </span>
                  {notes}
                </div>
              )}

            </div>

            {/* Quick Action in Card */}
            <div className="p-4 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 dark:text-slate-400 font-medium">Auto-calculated in real time</span>
              <button
                onClick={generatePDF}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                <span>Save &amp; Download PDF</span>
                <span>→</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      <FeedbackWidget toolName="Invoice Generator" />
      <RelatedTools currentSlug="create-invoice" />

      {/* How to Use Section */}
      <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          How to Generate a Free PDF Invoice
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-primary-600 text-sm">1.</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Fill Details</p>
            <p className="mt-0.5">Enter your business details, client name, invoice number, and currency.</p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">2.</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Add Items &amp; Taxes</p>
            <p className="mt-0.5">Add line items, quantities, and hourly or unit rates. Subtotals and discounts calculate live.</p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">3.</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Download PDF</p>
            <p className="mt-0.5">Click &ldquo;Download PDF Invoice&rdquo; to instantly receive an A4 print-ready PDF file.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
