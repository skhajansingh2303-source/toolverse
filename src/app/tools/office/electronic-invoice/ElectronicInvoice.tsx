'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import { PDFDocument, rgb, StandardFonts, AFRelationship } from 'pdf-lib';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number; // e.g. 20 for 20%
}

interface ValidationReport {
  isValid: boolean;
  standardDetected: string;
  guidelineId: string;
  invoiceNumber: string;
  issueDate: string;
  currency: string;
  sellerName: string;
  sellerVat: string;
  buyerName: string;
  buyerVat: string;
  lineItems: { description: string; quantity: number; price: number; total: number }[];
  netTotal: number;
  taxTotal: number;
  grandTotal: number;
  arithmeticCheckPassed: boolean;
  warnings: string[];
  extractedXml: string;
}

export default function ElectronicInvoice() {
  const [activeMode, setActiveMode] = useState<'create' | 'validate'>('create');

  // Generator form states
  const [sellerName, setSellerName] = useState('Acme Technologies GmbH');
  const [sellerVat, setSellerVat] = useState('DE123456789');
  const [sellerAddress, setSellerAddress] = useState('Friedrichstraße 45');
  const [sellerCity, setSellerCity] = useState('Berlin');
  const [sellerZip, setSellerZip] = useState('10117');
  const [sellerCountry, setSellerCountry] = useState('DE');
  const [sellerEmail, setSellerEmail] = useState('billing@acme-tech.de');
  const [sellerIban, setSellerIban] = useState('DE89370400440532013000');
  const [sellerBic, setSellerBic] = useState('COBADEFFXXX');

  const [buyerName, setBuyerName] = useState('Global Logistics SAS');
  const [buyerVat, setBuyerVat] = useState('FR987654321');
  const [buyerAddress, setBuyerAddress] = useState('12 Rue de la Paix');
  const [buyerCity, setBuyerCity] = useState('Paris');
  const [buyerZip, setBuyerZip] = useState('75002');
  const [buyerCountry, setBuyerCountry] = useState('FR');
  const [buyerEmail, setBuyerEmail] = useState('finance@globallogistics.fr');

  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-0042');
  const [issueDate, setIssueDate] = useState('2026-09-11');
  const [dueDate, setDueDate] = useState('2026-10-11');
  const [currency, setCurrency] = useState('EUR');

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: 'Cloud Infrastructure & API Hosting', quantity: 1, unitPrice: 850.0, vatRate: 19 },
    { id: '2', description: 'Software Development Consulting (Hours)', quantity: 12, unitPrice: 95.0, vatRate: 19 },
    { id: '3', description: 'Enterprise SSL & Security Audit', quantity: 1, unitPrice: 350.0, vatRate: 19 },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [createdPdfUrl, setCreatedPdfUrl] = useState<string | null>(null);
  const [createdXmlUrl, setCreatedXmlUrl] = useState<string | null>(null);

  // Validation / Parser states
  const [parseFile, setParseFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [copiedXml, setCopiedXml] = useState(false);

  // Math calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;

    lineItems.forEach((item) => {
      const lineNet = item.quantity * item.unitPrice;
      const lineTax = lineNet * (item.vatRate / 100);
      subtotal += lineNet;
      taxTotal += lineTax;
    });

    const grandTotal = subtotal + taxTotal;
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxTotal: parseFloat(taxTotal.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    };
  };

  const totals = calculateTotals();

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: 'New Billable Service',
        quantity: 1,
        unitPrice: 100,
        vatRate: 19,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, val: any) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  // Generate compliant Factur-X / ZUGFeRD 2.2 XML
  const generateFacturXXml = () => {
    const formattedIssue = issueDate.replace(/-/g, '');
    const formattedDue = dueDate.replace(/-/g, '');

    const linesXml = lineItems
      .map(
        (item, index) => `
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>${index + 1}</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:Name>${escapeXml(item.description)}</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${item.unitPrice.toFixed(2)}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="C62">${item.quantity}</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>S</ram:CategoryCode>
          <ram:RateApplicablePercent>${item.vatRate}</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>${(item.quantity * item.unitPrice).toFixed(2)}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100"
  xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${escapeXml(invoiceNumber)}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${formattedIssue}</udt:DateTimeString>
    </ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>${linesXml}
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty>
        <ram:Name>${escapeXml(sellerName)}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${escapeXml(sellerZip)}</ram:PostcodeCode>
          <ram:LineOne>${escapeXml(sellerAddress)}</ram:LineOne>
          <ram:CityName>${escapeXml(sellerCity)}</ram:CityName>
          <ram:CountryID>${escapeXml(sellerCountry)}</ram:CountryID>
        </ram:PostalTradeAddress>
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${escapeXml(sellerVat)}</ram:ID>
        </ram:SpecifiedTaxRegistration>
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${escapeXml(buyerName)}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${escapeXml(buyerZip)}</ram:PostcodeCode>
          <ram:LineOne>${escapeXml(buyerAddress)}</ram:LineOne>
          <ram:CityName>${escapeXml(buyerCity)}</ram:CityName>
          <ram:CountryID>${escapeXml(buyerCountry)}</ram:CountryID>
        </ram:PostalTradeAddress>
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${escapeXml(buyerVat)}</ram:ID>
        </ram:SpecifiedTaxRegistration>
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery>
      <ram:ActualDeliverySupplyChainEvent>
        <ram:OccurrenceDateTime>
          <udt:DateTimeString format="102">${formattedIssue}</udt:DateTimeString>
        </ram:OccurrenceDateTime>
      </ram:ActualDeliverySupplyChainEvent>
    </ram:ApplicableHeaderTradeDelivery>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>${currency}</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradeSettlementPaymentMeans>
        <ram:TypeCode>58</ram:TypeCode>
        <ram:PayeePartyCreditorFinancialAccount>
          <ram:IBANID>${escapeXml(sellerIban)}</ram:IBANID>
        </ram:PayeePartyCreditorFinancialAccount>
        <ram:PayeeSpecifiedCreditorFinancialInstitution>
          <ram:BICID>${escapeXml(sellerBic)}</ram:BICID>
        </ram:PayeeSpecifiedCreditorFinancialInstitution>
      </ram:SpecifiedTradeSettlementPaymentMeans>
      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>${totals.taxTotal.toFixed(2)}</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:BasisAmount>${totals.subtotal.toFixed(2)}</ram:BasisAmount>
        <ram:CategoryCode>S</ram:CategoryCode>
        <ram:RateApplicablePercent>19.00</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>
      <ram:SpecifiedTradePaymentTerms>
        <ram:DueDateDateTime>
          <udt:DateTimeString format="102">${formattedDue}</udt:DateTimeString>
        </ram:DueDateDateTime>
      </ram:SpecifiedTradePaymentTerms>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${totals.subtotal.toFixed(2)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${totals.subtotal.toFixed(2)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="${currency}">${totals.taxTotal.toFixed(2)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${totals.grandTotal.toFixed(2)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${totals.grandTotal.toFixed(2)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
  };

  const escapeXml = (str: string) => {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // Create Hybrid PDF with Embedded Factur-X XML
  const generateEInvoicePdf = async () => {
    setIsGenerating(true);
    setCreatedPdfUrl(null);
    setCreatedXmlUrl(null);

    try {
      const pdfDoc = await PDFDocument.create();
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const page = pdfDoc.addPage([595.28, 841.89]); // A4
      const primaryColor = rgb(0.31, 0.27, 0.9); // Indigo 600

      // Top banner
      page.drawRectangle({
        x: 0,
        y: 780,
        width: 595.28,
        height: 62,
        color: primaryColor,
      });

      page.drawText('ELECTRONIC INVOICE (FACTUR-X / EN16931)', {
        x: 40,
        y: 804,
        size: 16,
        font: boldFont,
        color: rgb(1, 1, 1),
      });

      page.drawText('Compliant Hybrid PDF/A-3 Document with Embedded XML', {
        x: 40,
        y: 790,
        size: 9.5,
        font: regularFont,
        color: rgb(0.85, 0.88, 1),
      });

      // Invoice Details Block (Right top)
      page.drawText(`Invoice No: ${invoiceNumber}`, {
        x: 370,
        y: 745,
        size: 11,
        font: boldFont,
        color: rgb(0.1, 0.15, 0.2),
      });
      page.drawText(`Issue Date: ${issueDate}`, {
        x: 370,
        y: 728,
        size: 9.5,
        font: regularFont,
        color: rgb(0.4, 0.45, 0.5),
      });
      page.drawText(`Due Date: ${dueDate}`, {
        x: 370,
        y: 712,
        size: 9.5,
        font: regularFont,
        color: rgb(0.4, 0.45, 0.5),
      });
      page.drawText(`Currency: ${currency}`, {
        x: 370,
        y: 696,
        size: 9.5,
        font: regularFont,
        color: rgb(0.4, 0.45, 0.5),
      });

      // Seller Block
      page.drawText('FROM / SELLER:', { x: 40, y: 745, size: 9, font: boldFont, color: primaryColor });
      page.drawText(sellerName, { x: 40, y: 730, size: 11, font: boldFont, color: rgb(0.1, 0.15, 0.2) });
      page.drawText(`${sellerAddress}, ${sellerZip} ${sellerCity}`, {
        x: 40,
        y: 714,
        size: 9,
        font: regularFont,
        color: rgb(0.3, 0.35, 0.4),
      });
      page.drawText(`Tax/VAT ID: ${sellerVat}`, {
        x: 40,
        y: 700,
        size: 9,
        font: regularFont,
        color: rgb(0.3, 0.35, 0.4),
      });
      page.drawText(`Email: ${sellerEmail}`, {
        x: 40,
        y: 686,
        size: 9,
        font: regularFont,
        color: rgb(0.3, 0.35, 0.4),
      });

      // Buyer Block
      page.drawText('BILL TO / BUYER:', { x: 40, y: 650, size: 9, font: boldFont, color: primaryColor });
      page.drawText(buyerName, { x: 40, y: 635, size: 11, font: boldFont, color: rgb(0.1, 0.15, 0.2) });
      page.drawText(`${buyerAddress}, ${buyerZip} ${buyerCity}`, {
        x: 40,
        y: 620,
        size: 9,
        font: regularFont,
        color: rgb(0.3, 0.35, 0.4),
      });
      page.drawText(`Tax/VAT ID: ${buyerVat}`, {
        x: 40,
        y: 606,
        size: 9,
        font: regularFont,
        color: rgb(0.3, 0.35, 0.4),
      });

      // Table Header
      const tableY = 565;
      page.drawRectangle({
        x: 40,
        y: tableY,
        width: 515,
        height: 24,
        color: rgb(0.94, 0.95, 0.98),
      });

      page.drawText('Description', { x: 50, y: tableY + 7, size: 9, font: boldFont, color: rgb(0.2, 0.25, 0.3) });
      page.drawText('Qty', { x: 310, y: tableY + 7, size: 9, font: boldFont, color: rgb(0.2, 0.25, 0.3) });
      page.drawText('Unit Price', { x: 360, y: tableY + 7, size: 9, font: boldFont, color: rgb(0.2, 0.25, 0.3) });
      page.drawText('VAT %', { x: 440, y: tableY + 7, size: 9, font: boldFont, color: rgb(0.2, 0.25, 0.3) });
      page.drawText('Total', { x: 500, y: tableY + 7, size: 9, font: boldFont, color: rgb(0.2, 0.25, 0.3) });

      let currentY = tableY - 20;
      lineItems.forEach((item, idx) => {
        const lineNet = item.quantity * item.unitPrice;
        page.drawText(item.description.slice(0, 48), {
          x: 50,
          y: currentY,
          size: 9,
          font: regularFont,
          color: rgb(0.2, 0.25, 0.3),
        });
        page.drawText(`${item.quantity}`, {
          x: 310,
          y: currentY,
          size: 9,
          font: regularFont,
          color: rgb(0.2, 0.25, 0.3),
        });
        page.drawText(`${item.unitPrice.toFixed(2)}`, {
          x: 360,
          y: currentY,
          size: 9,
          font: regularFont,
          color: rgb(0.2, 0.25, 0.3),
        });
        page.drawText(`${item.vatRate}%`, {
          x: 440,
          y: currentY,
          size: 9,
          font: regularFont,
          color: rgb(0.2, 0.25, 0.3),
        });
        page.drawText(`${lineNet.toFixed(2)} ${currency}`, {
          x: 500,
          y: currentY,
          size: 9,
          font: boldFont,
          color: rgb(0.1, 0.15, 0.2),
        });

        page.drawLine({
          start: { x: 40, y: currentY - 6 },
          end: { x: 555, y: currentY - 6 },
          thickness: 0.5,
          color: rgb(0.9, 0.92, 0.95),
        });
        currentY -= 24;
      });

      // Totals Box
      const summaryY = currentY - 15;
      page.drawText('Subtotal (Net):', {
        x: 350,
        y: summaryY,
        size: 9.5,
        font: regularFont,
        color: rgb(0.4, 0.45, 0.5),
      });
      page.drawText(`${totals.subtotal.toFixed(2)} ${currency}`, {
        x: 470,
        y: summaryY,
        size: 9.5,
        font: boldFont,
        color: rgb(0.1, 0.15, 0.2),
      });

      page.drawText('VAT Total:', {
        x: 350,
        y: summaryY - 18,
        size: 9.5,
        font: regularFont,
        color: rgb(0.4, 0.45, 0.5),
      });
      page.drawText(`${totals.taxTotal.toFixed(2)} ${currency}`, {
        x: 470,
        y: summaryY - 18,
        size: 9.5,
        font: boldFont,
        color: rgb(0.1, 0.15, 0.2),
      });

      page.drawRectangle({
        x: 340,
        y: summaryY - 50,
        width: 215,
        height: 26,
        color: rgb(0.92, 0.94, 0.99),
      });
      page.drawText('Total Due (Gross):', {
        x: 350,
        y: summaryY - 42,
        size: 10,
        font: boldFont,
        color: primaryColor,
      });
      page.drawText(`${totals.grandTotal.toFixed(2)} ${currency}`, {
        x: 465,
        y: summaryY - 42,
        size: 11,
        font: boldFont,
        color: primaryColor,
      });

      // Bank Payment Info Box
      const bankY = 120;
      page.drawRectangle({
        x: 40,
        y: bankY,
        width: 515,
        height: 55,
        color: rgb(0.98, 0.98, 1),
        borderColor: rgb(0.85, 0.88, 0.95),
        borderWidth: 1,
      });
      page.drawText('PAYMENT INFORMATION / WIRE TRANSFER', {
        x: 55,
        y: bankY + 38,
        size: 8.5,
        font: boldFont,
        color: primaryColor,
      });
      page.drawText(`IBAN: ${sellerIban}   |   BIC/SWIFT: ${sellerBic}`, {
        x: 55,
        y: bankY + 22,
        size: 8.5,
        font: regularFont,
        color: rgb(0.2, 0.25, 0.3),
      });
      page.drawText(`Reference: ${invoiceNumber}`, {
        x: 55,
        y: bankY + 8,
        size: 8.5,
        font: boldFont,
        color: rgb(0.2, 0.25, 0.3),
      });

      // Footer notice
      page.drawText(
        'Factur-X / ZUGFeRD 2.2 compliant electronic invoice. The embedded XML file factur-x.xml contains the machine-readable invoice record.',
        {
          x: 40,
          y: 45,
          size: 7.5,
          font: regularFont,
          color: rgb(0.5, 0.55, 0.6),
        }
      );

      // Generate XML and Attach to PDF
      const xmlString = generateFacturXXml();
      const xmlBytes = new TextEncoder().encode(xmlString);

      await pdfDoc.attach(xmlBytes, 'factur-x.xml', {
        mimeType: 'text/xml',
        description: 'Factur-X / ZUGFeRD Electronic Invoice XML',
        afRelationship: AFRelationship.Data,
      });

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const pUrl = URL.createObjectURL(pdfBlob);
      setCreatedPdfUrl(pUrl);

      const xmlBlob = new Blob([xmlString], { type: 'text/xml;charset=utf-8' });
      const xUrl = URL.createObjectURL(xmlBlob);
      setCreatedXmlUrl(xUrl);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: 'Factur-X E-Invoice generated with embedded XML!' },
        })
      );
    } catch (err) {
      console.error('Error generating e-invoice:', err);
      alert('Could not compile electronic invoice.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Parser & Validator Mode Execution
  const handleParseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setParseFile(selected);
    setIsValidating(true);
    setValidationReport(null);

    try {
      const buffer = await selected.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      let extractedXml = '';

      // Check if it's already an XML file
      if (selected.name.endsWith('.xml')) {
        extractedXml = decoder.decode(buffer);
      } else {
        // It's a PDF: scan binary buffer for XML stream or inspect PDF
        const pdfText = decoder.decode(buffer);

        // Check for Factur-X / CrossIndustryInvoice
        const rsmStart = pdfText.indexOf('<rsm:CrossIndustryInvoice');
        const rsmEnd = pdfText.indexOf('</rsm:CrossIndustryInvoice>');

        if (rsmStart !== -1 && rsmEnd !== -1) {
          extractedXml = pdfText.substring(rsmStart, rsmEnd + '</rsm:CrossIndustryInvoice>'.length);
        } else {
          // Check for UBL Invoice
          const ublStart = pdfText.indexOf('<Invoice');
          const ublEnd = pdfText.indexOf('</Invoice>');
          if (ublStart !== -1 && ublEnd !== -1) {
            extractedXml = pdfText.substring(ublStart, ublEnd + '</Invoice>'.length);
          }
        }
      }

      if (!extractedXml) {
        setValidationReport({
          isValid: false,
          standardDetected: 'None',
          guidelineId: 'No embedded Factur-X, ZUGFeRD, or UBL XML found',
          invoiceNumber: 'N/A',
          issueDate: 'N/A',
          currency: 'N/A',
          sellerName: 'N/A',
          sellerVat: 'N/A',
          buyerName: 'N/A',
          buyerVat: 'N/A',
          lineItems: [],
          netTotal: 0,
          taxTotal: 0,
          grandTotal: 0,
          arithmeticCheckPassed: false,
          warnings: [
            'No standard e-invoice XML stream was detected in this PDF document catalog.',
            'Ensure the document is a valid PDF/A-3 file with an attached factur-x.xml or zugferd-invoice.xml.',
          ],
          extractedXml: '',
        });
        return;
      }

      // Parse XML with DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(extractedXml, 'text/xml');

      const isCrossIndustry = !!doc.querySelector('CrossIndustryInvoice');
      const standardName = isCrossIndustry ? 'Factur-X / ZUGFeRD 2.x (CII)' : 'UBL 2.1 E-Invoice';

      const getText = (selector: string) => {
        const el = doc.querySelector(selector);
        return el?.textContent?.trim() || '';
      };

      const guideline =
        getText('GuidelineSpecifiedDocumentContextParameter ID') ||
        getText('CustomizationID') ||
        'urn:cen.eu:en16931:2017';

      const invNo =
        getText('ExchangedDocument ID') ||
        getText('ID') ||
        'N/A';

      const rawIssue =
        getText('IssueDateTime DateTimeString') ||
        getText('IssueDate') ||
        'N/A';

      const curr =
        getText('InvoiceCurrencyCode') ||
        getText('DocumentCurrencyCode') ||
        'EUR';

      const sName =
        getText('SellerTradeParty Name') ||
        getText('AccountingSupplierParty PartyName Name') ||
        'N/A';

      const sVat =
        getText('SellerTradeParty SpecifiedTaxRegistration ID') ||
        getText('AccountingSupplierParty CompanyID') ||
        'N/A';

      const bName =
        getText('BuyerTradeParty Name') ||
        getText('AccountingCustomerParty PartyName Name') ||
        'N/A';

      const bVat =
        getText('BuyerTradeParty SpecifiedTaxRegistration ID') ||
        getText('AccountingCustomerParty CompanyID') ||
        'N/A';

      // Parse line items
      const parsedItems: { description: string; quantity: number; price: number; total: number }[] = [];
      const itemNodes = doc.querySelectorAll('IncludedSupplyChainTradeLineItem, InvoiceLine');

      itemNodes.forEach((node) => {
        const desc =
          node.querySelector('SpecifiedTradeProduct Name, Item Name, Description')?.textContent?.trim() ||
          'Line Item';
        const qty = parseFloat(
          node.querySelector('BilledQuantity, InvoicedQuantity')?.textContent?.trim() || '1'
        );
        const price = parseFloat(
          node.querySelector('ChargeAmount, PriceAmount')?.textContent?.trim() || '0'
        );
        const total = parseFloat(
          node.querySelector('LineTotalAmount, LineExtensionAmount')?.textContent?.trim() ||
            (qty * price).toFixed(2)
        );

        parsedItems.push({ description: desc, quantity: qty, price, total });
      });

      const net = parseFloat(
        getText('LineTotalAmount') ||
        getText('TaxBasisTotalAmount') ||
        getText('TaxExclusiveAmount') ||
        '0'
      );
      const tax = parseFloat(
        getText('TaxTotalAmount') ||
        getText('TaxAmount') ||
        '0'
      );
      const grand = parseFloat(
        getText('GrandTotalAmount') ||
        getText('DuePayableAmount') ||
        getText('TaxInclusiveAmount') ||
        '0'
      );

      // Arithmetic check
      const sumLineItems = parsedItems.reduce((acc, it) => acc + it.total, 0);
      const diffNet = Math.abs(sumLineItems - net);
      const diffGrand = Math.abs(net + tax - grand);
      const mathOk = diffNet < 0.05 && diffGrand < 0.05;

      const warnings: string[] = [];
      if (!mathOk) {
        warnings.push(
          `Arithmetic mismatch: Computed sum of line items (${sumLineItems.toFixed(2)}) does not match declared total (${net.toFixed(2)}).`
        );
      }
      if (!sVat || sVat === 'N/A') {
        warnings.push('Seller VAT Registration ID is missing or not formatted in accordance with EN16931.');
      }

      setValidationReport({
        isValid: true,
        standardDetected: standardName,
        guidelineId: guideline,
        invoiceNumber: invNo,
        issueDate: rawIssue,
        currency: curr,
        sellerName: sName,
        sellerVat: sVat,
        buyerName: bName,
        buyerVat: bVat,
        lineItems: parsedItems,
        netTotal: net,
        taxTotal: tax,
        grandTotal: grand,
        arithmeticCheckPassed: mathOk,
        warnings,
        extractedXml,
      });

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `E-Invoice parsed: ${standardName} detected!` },
        })
      );
    } catch (err) {
      console.error('Validation error:', err);
      alert('Could not parse electronic invoice.');
    } finally {
      setIsValidating(false);
    }
  };

  const copyExtractedXml = () => {
    if (!validationReport?.extractedXml) return;
    navigator.clipboard.writeText(validationReport.extractedXml);
    setCopiedXml(true);
    setTimeout(() => setCopiedXml(false), 2500);
    window.dispatchEvent(
      new CustomEvent('toolsverse-toast', {
        detail: { message: 'Invoice XML copied to clipboard!' },
      })
    );
  };

  const downloadExtractedXmlFile = () => {
    if (!validationReport?.extractedXml) return;
    const blob = new Blob([validationReport.extractedXml], { type: 'text/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factur-x_${validationReport.invoiceNumber || 'invoice'}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">Electronic Invoice</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Electronic Invoice (Factur-X / ZUGFeRD) Builder &amp; Validator
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Generate compliant Hybrid PDF/A-3 electronic invoices with embedded Factur-X EN16931 XML, or inspect and validate existing e-invoices directly in your browser.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex justify-center">
          <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
            <button
              onClick={() => setActiveMode('create')}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeMode === 'create'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Mode 1: Create Compliant E-Invoice
            </button>

            <button
              onClick={() => setActiveMode('validate')}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeMode === 'validate'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mode 2: Parse &amp; Validate E-Invoice
            </button>
          </div>
        </div>

        {/* MODE 1: CREATE E-INVOICE */}
        {activeMode === 'create' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Invoice Metadata &amp; Parties
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Compliant with European Norm EN16931 &amp; Factur-X / ZUGFeRD 2.2 Basic Profile
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-primary-600 dark:text-primary-400 border border-indigo-200 dark:border-indigo-800">
                  EN16931 Basic
                </span>
              </div>

              {/* Invoice Specifics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-gray-900 dark:text-gray-100"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
              </div>

              {/* Seller & Buyer 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-slate-800">
                {/* Seller Box */}
                <div className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                    Seller (Creditor / Beneficiary)
                  </h3>
                  <div>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Tax / VAT ID (e.g. DE123456789)"
                      value={sellerVat}
                      onChange={(e) => setSellerVat(e.target.value)}
                      className="rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800"
                    />
                    <input
                      type="email"
                      placeholder="Contact Email"
                      value={sellerEmail}
                      onChange={(e) => setSellerEmail(e.target.value)}
                      className="rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={sellerAddress}
                      onChange={(e) => setSellerAddress(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={sellerZip}
                      onChange={(e) => setSellerZip(e.target.value)}
                      className="rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={sellerCity}
                      onChange={(e) => setSellerCity(e.target.value)}
                      className="rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Country Code (DE)"
                      value={sellerCountry}
                      onChange={(e) => setSellerCountry(e.target.value)}
                      className="rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200 dark:border-slate-700">
                    <input
                      type="text"
                      placeholder="Bank IBAN"
                      value={sellerIban}
                      onChange={(e) => setSellerIban(e.target.value)}
                      className="rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="BIC / SWIFT"
                      value={sellerBic}
                      onChange={(e) => setSellerBic(e.target.value)}
                      className="rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                </div>

                {/* Buyer Box */}
                <div className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                    Buyer (Debtor / Customer)
                  </h3>
                  <div>
                    <input
                      type="text"
                      placeholder="Customer / Business Name"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Buyer VAT ID (e.g. FR987654321)"
                      value={buyerVat}
                      onChange={(e) => setBuyerVat(e.target.value)}
                      className="rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800"
                    />
                    <input
                      type="email"
                      placeholder="Billing Email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={buyerZip}
                      onChange={(e) => setBuyerZip(e.target.value)}
                      className="rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={buyerCity}
                      onChange={(e) => setBuyerCity(e.target.value)}
                      className="rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Country Code (FR)"
                      value={buyerCountry}
                      onChange={(e) => setBuyerCountry(e.target.value)}
                      className="rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Invoice Line Items
                  </h3>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-primary-600 dark:text-primary-400 transition-colors"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 font-bold">
                        <th className="text-left pb-2 w-1/2">Description</th>
                        <th className="text-center pb-2 w-16">Qty</th>
                        <th className="text-right pb-2 w-28">Unit Price</th>
                        <th className="text-right pb-2 w-20">VAT %</th>
                        <th className="text-right pb-2 w-28">Line Total</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {lineItems.map((item) => (
                        <tr key={item.id} className="py-2">
                          <td className="py-2 pr-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800"
                            />
                          </td>
                          <td className="py-2 px-1">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                              className="w-full rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs text-center bg-white dark:bg-slate-800"
                            />
                          </td>
                          <td className="py-2 px-1">
                            <input
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs text-right bg-white dark:bg-slate-800"
                            />
                          </td>
                          <td className="py-2 px-1">
                            <input
                              type="number"
                              step="1"
                              value={item.vatRate}
                              onChange={(e) => updateLineItem(item.id, 'vatRate', parseFloat(e.target.value) || 0)}
                              className="w-full rounded-lg border border-gray-300 dark:border-slate-700 p-2 text-xs text-right bg-white dark:bg-slate-800"
                            />
                          </td>
                          <td className="py-2 pl-2 text-right font-bold text-gray-900 dark:text-white">
                            {(item.quantity * item.unitPrice).toFixed(2)} {currency}
                          </td>
                          <td className="py-2 text-center">
                            <button
                              onClick={() => removeLineItem(item.id)}
                              disabled={lineItems.length <= 1}
                              className="text-gray-400 dark:text-slate-400 hover:text-red-500 disabled:opacity-30 p-1"
                              title="Delete Item"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Row */}
                <div className="flex justify-end pt-4">
                  <div className="w-64 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Subtotal (Net):</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {totals.subtotal.toFixed(2)} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Total VAT:</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {totals.taxTotal.toFixed(2)} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-primary-600 dark:text-primary-400 pt-2 border-t border-gray-200 dark:border-slate-700">
                      <span>Grand Total:</span>
                      <span>
                        {totals.grandTotal.toFixed(2)} {currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-200 dark:border-slate-800 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={generateEInvoicePdf}
                  disabled={isGenerating}
                  className="px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Embedding XML &amp; Compiling PDF...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Generate Hybrid E-Invoice PDF
                    </>
                  )}
                </button>

                {createdPdfUrl && (
                  <a
                    href={createdPdfUrl}
                    download={`${invoiceNumber}_Factur-X.pdf`}
                    className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Hybrid PDF
                  </a>
                )}

                {createdXmlUrl && (
                  <a
                    href={createdXmlUrl}
                    download="factur-x.xml"
                    className="px-5 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Download Standalone factur-x.xml
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: PARSE & VALIDATE E-INVOICE */}
        {activeMode === 'validate' && (
          <div className="space-y-6">
            {/* Upload Zone */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-10">
              <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-400 rounded-3xl p-8 sm:p-12 text-center transition-colors group">
                <input
                  type="file"
                  accept=".pdf,.xml,application/pdf,text/xml"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    handleParseUpload(e);
                    e.target.value = '';
                  }}
                />
                <div className="pointer-events-none flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-105 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Upload PDF Invoice or XML to Validate
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Scans embedded streams for Factur-X / ZUGFeRD / UBL XML schemas, verifies tax totals, and extracts line items.
                  </p>
                  <span className="inline-flex items-center px-6 py-3 rounded-xl bg-primary-600 group-hover:bg-primary-700 text-white font-semibold shadow-md transition-all">
                    Browse Files
                  </span>
                </div>
              </div>
            </div>

            {isValidating && (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Scanning PDF binary stream for embedded electronic invoice metadata...
                </p>
              </div>
            )}

            {/* Validation Results Report */}
            {validationReport && !isValidating && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
                {/* Validation Status Banner */}
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    validationReport.isValid && validationReport.arithmeticCheckPassed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                      : validationReport.isValid
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                      : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        validationReport.isValid && validationReport.arithmeticCheckPassed
                          ? 'bg-emerald-600 text-white'
                          : validationReport.isValid
                          ? 'bg-amber-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {validationReport.isValid && validationReport.arithmeticCheckPassed
                        ? '✓'
                        : validationReport.isValid
                        ? '!'
                        : '✕'}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                        {validationReport.isValid
                          ? `${validationReport.standardDetected} Detected`
                          : 'No Electronic Invoice XML Detected'}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {validationReport.guidelineId}
                      </p>
                    </div>
                  </div>

                  {validationReport.extractedXml && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyExtractedXml}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-xs font-semibold shadow-xs border border-gray-200 dark:border-slate-700"
                      >
                        {copiedXml ? 'Copied!' : 'Copy XML'}
                      </button>
                      <button
                        onClick={downloadExtractedXmlFile}
                        className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold shadow-xs"
                      >
                        Download XML
                      </button>
                    </div>
                  )}
                </div>

                {/* Warnings / Checklist */}
                {validationReport.warnings.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1">
                    <span className="font-bold text-amber-800 dark:text-amber-400 block">
                      Compliance Inspection Notices:
                    </span>
                    {validationReport.warnings.map((w, idx) => (
                      <p key={idx} className="text-amber-700 dark:text-amber-300">
                        • {w}
                      </p>
                    ))}
                  </div>
                )}

                {/* Structured Invoice Summary */}
                {validationReport.isValid && (
                  <div className="space-y-6">
                    {/* Key Attributes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                        <span className="text-gray-500 dark:text-slate-400 block">Invoice Number</span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {validationReport.invoiceNumber}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                        <span className="text-gray-500 dark:text-slate-400 block">Issue Date</span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {validationReport.issueDate}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                        <span className="text-gray-500 dark:text-slate-400 block">Currency</span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {validationReport.currency}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                        <span className="text-gray-500 dark:text-slate-400 block">Arithmetic Check</span>
                        <span
                          className={`font-bold text-sm ${
                            validationReport.arithmeticCheckPassed ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {validationReport.arithmeticCheckPassed ? 'Passed ✓' : 'Mismatch'}
                        </span>
                      </div>
                    </div>

                    {/* Parties Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-200 dark:border-slate-800">
                        <span className="font-bold text-primary-600 uppercase block mb-1">Seller Party</span>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {validationReport.sellerName}
                        </p>
                        <p className="text-gray-500 dark:text-slate-400 mt-1">VAT ID: {validationReport.sellerVat}</p>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-200 dark:border-slate-800">
                        <span className="font-bold text-primary-600 uppercase block mb-1">Buyer Party</span>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {validationReport.buyerName}
                        </p>
                        <p className="text-gray-500 dark:text-slate-400 mt-1">VAT ID: {validationReport.buyerVat}</p>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    {validationReport.lineItems.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                          Parsed Line Items ({validationReport.lineItems.length})
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border border-gray-200 dark:border-slate-700 divide-y divide-gray-200 dark:divide-slate-700 rounded-xl">
                            <thead className="bg-gray-50 dark:bg-slate-800">
                              <tr>
                                <th className="p-2 text-left">Description</th>
                                <th className="p-2 text-center">Qty</th>
                                <th className="p-2 text-right">Unit Price</th>
                                <th className="p-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                              {validationReport.lineItems.map((it, idx) => (
                                <tr key={idx}>
                                  <td className="p-2 text-gray-900 dark:text-gray-100">{it.description}</td>
                                  <td className="p-2 text-center text-gray-600 dark:text-gray-400">{it.quantity}</td>
                                  <td className="p-2 text-right font-mono">{it.price.toFixed(2)}</td>
                                  <td className="p-2 text-right font-bold font-mono">
                                    {it.total.toFixed(2)} {validationReport.currency}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Financial Totals */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 flex justify-end">
                      <div className="w-64 space-y-1.5 text-xs">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Net Tax Basis:</span>
                          <span className="font-bold text-gray-900 dark:text-white font-mono">
                            {validationReport.netTotal.toFixed(2)} {validationReport.currency}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Total Tax / VAT:</span>
                          <span className="font-bold text-gray-900 dark:text-white font-mono">
                            {validationReport.taxTotal.toFixed(2)} {validationReport.currency}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-extrabold text-primary-600 dark:text-primary-400 pt-2 border-t border-gray-200 dark:border-slate-700">
                          <span>Grand Total Due:</span>
                          <span className="font-mono">
                            {validationReport.grandTotal.toFixed(2)} {validationReport.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Ad Slot */}
        <AdSlot format="horizontal" />

        {/* How to Use Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How Electronic Invoicing (Factur-X / ZUGFeRD) Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                1
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">What is Factur-X / ZUGFeRD?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Factur-X is a Franco-German and European standard for hybrid invoices. It combines a human-readable visual PDF with a machine-readable XML invoice embedded in the document catalog.
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                2
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Creating E-Invoices</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your company, customer, and billing line items. ToolsVerse compiles the human-readable PDF layout and embeds the standardized XML structure compliant with EN16931 regulations.
              </p>
            </div>

            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-sm mb-3">
                3
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Validation &amp; Extraction</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload any received PDF invoice to check if it contains valid e-invoice XML. Verify VAT and line arithmetic, and download the isolated XML invoice for accounting software integration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
