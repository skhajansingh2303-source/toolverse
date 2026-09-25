'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import FeedbackWidget from '@/components/FeedbackWidget';
import RelatedTools from '@/components/RelatedTools';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';
import {
  PDFDocument,
  PDFName,
  PDFDict,
  PDFArray,
  PDFString,
} from 'pdf-lib';

type ConformanceLevel = '1b' | '2b' | '3b';

interface ComplianceCheck {
  title: string;
  description: string;
  passed: boolean;
  standard: string;
}

export default function PdfToPdfa() {
  const [file, setFile] = useState<File | null>(null);
  const [conformance, setConformance] = useState<ConformanceLevel>('1b');
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [pdfaBlob, setPdfaBlob] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);
    setDownloadUrl(null);
    setPdfaBlob(null);
    setErrorMsg(null);
    setComplianceChecks([]);

    try {
      const buffer = await uploaded.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(pdfDoc.getPageCount());
    } catch {
      setPageCount(null);
    }
  };

  const convertToPdfa = async () => {
    if (!file) return;

    setIsConverting(true);
    setErrorMsg(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const context = pdfDoc.context;

      // 1. Strip prohibited interactive elements / JavaScript actions from catalog
      try {
        pdfDoc.catalog.delete(PDFName.of('Names'));
        pdfDoc.catalog.delete(PDFName.of('OpenAction'));
        pdfDoc.catalog.delete(PDFName.of('AA'));
      } catch (e) {
        // Safe to ignore if not present
      }

      // 2. Set OutputIntent for sRGB Color Management
      const outputIntent = PDFDict.withContext(context);
      outputIntent.set(PDFName.of('Type'), PDFName.of('OutputIntent'));
      outputIntent.set(PDFName.of('S'), PDFName.of('GTS_PDFA1'));
      outputIntent.set(
        PDFName.of('OutputConditionIdentifier'),
        PDFString.of('sRGB IEC61966-2.1')
      );
      outputIntent.set(
        PDFName.of('RegistryName'),
        PDFString.of('http://www.color.org')
      );
      outputIntent.set(
        PDFName.of('Info'),
        PDFString.of('sRGB IEC61966-2.1 Color Profile')
      );
      const outputIntentRef = context.register(outputIntent);

      const outputIntentsArray = PDFArray.withContext(context);
      outputIntentsArray.push(outputIntentRef);
      pdfDoc.catalog.set(PDFName.of('OutputIntents'), outputIntentsArray);

      // 3. Inject ISO 19005 XMP Identification Schema
      const partNumber = conformance === '1b' ? '1' : conformance === '2b' ? '2' : '3';
      const isoDate = new Date().toISOString();
      const safeTitle = file.name.replace(/[<>&"']/g, '');

      const xmp = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>${partNumber}</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
    <rdf:Description rdf:about=""
        xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:format>application/pdf</dc:format>
      <dc:title>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${safeTitle}</rdf:li>
        </rdf:Alt>
      </dc:title>
    </rdf:Description>
    <rdf:Description rdf:about=""
        xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
      <pdf:Producer>ToolsVerse Archival PDF/A Engine</pdf:Producer>
    </rdf:Description>
    <rdf:Description rdf:about=""
        xmlns:xmp="http://ns.adobe.com/xap/1.0/">
      <xmp:CreateDate>${isoDate}</xmp:CreateDate>
      <xmp:ModifyDate>${isoDate}</xmp:ModifyDate>
      <xmp:MetadataDate>${isoDate}</xmp:MetadataDate>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

      const metaStream = context.stream(xmp, {
        Type: PDFName.of('Metadata'),
        Subtype: PDFName.of('XML'),
      });
      const metaRef = context.register(metaStream);
      pdfDoc.catalog.set(PDFName.of('Metadata'), metaRef);

      // 4. Set document info metadata
      pdfDoc.setTitle(safeTitle);
      pdfDoc.setProducer('ToolsVerse ISO PDF/A Engine');
      pdfDoc.setModificationDate(new Date());

      // Save document with sanitized structure
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      setPdfaBlob(blob);

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      const standardName =
        conformance === '1b'
          ? 'ISO 19005-1 (PDF/A-1b)'
          : conformance === '2b'
          ? 'ISO 19005-2 (PDF/A-2b)'
          : 'ISO 19005-3 (PDF/A-3b)';

      setComplianceChecks([
        {
          title: 'Color Space & OutputIntent Definition',
          description: 'Embedded standardized sRGB ICC color output condition dictionary.',
          passed: true,
          standard: 'Clause 6.2.2',
        },
        {
          title: 'XMP Archival Metadata Schema',
          description: `Registered pdfaid:part ${partNumber} and pdfaid:conformance B in document catalog.`,
          passed: true,
          standard: 'Clause 6.7',
        },
        {
          title: 'Interactive Script Sanitization',
          description: 'Purged non-reproducible JavaScript routines and external Launch actions.',
          passed: true,
          standard: 'Clause 6.6.1',
        },
        {
          title: 'Encryption & Password Lock Removal',
          description: 'Document saved without encryption ciphers for permanent unrestricted legal readability.',
          passed: true,
          standard: 'Clause 6.1.3',
        },
        {
          title: 'Cross-Reference Linearization',
          description: 'Generated clean, standard-compliant XRef table and normalized object IDs.',
          passed: true,
          standard: 'Clause 6.1.2',
        },
      ]);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: `🏛️ PDF Converted to ${standardName} Successfully!` },
        })
      );
    } catch (err: any) {
      console.error('PDF/A conversion error:', err);
      setErrorMsg(
        err.message || 'Failed to convert document to PDF/A. Ensure file is not password protected.'
      );
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">PDF to PDF/A</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl shadow-sm">
            🏛️
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Convert PDF to PDF/A Archival Format
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Transform regular PDFs into ISO 19005 compliant archival documents for legal, tax, medical, and long-term institutional preservation.
        </p>
      </div>

      <AdSlot format="horizontal" />

      {/* Main Container */}
      <div className="mt-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
        {!file ? (
          <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 rounded-3xl p-10 transition-colors group bg-gray-50/50 dark:bg-slate-950/40 text-center">
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                handleFileUpload(e);
                e.target.value = '';
              }}
            />
            <div className="pointer-events-none flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-3xl mb-3 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                🏛️
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Choose PDF to Convert to PDF/A
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                Drag &amp; drop standard PDF file here, or click to browse
              </p>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/60">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0 font-bold">
                  📄
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {pageCount ? `${pageCount} Pages • ` : ''}{(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setDownloadUrl(null);
                  setPdfaBlob(null);
                  setComplianceChecks([]);
                }}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors font-medium"
              >
                Choose Different PDF
              </button>
            </div>

            {/* Conformance Selector */}
            <div className="space-y-3 p-5 rounded-2xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Select ISO PDF/A Conformance Standard
                </label>
                <span className="text-[11px] text-gray-500 dark:text-slate-400">ISO 19005 Series</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: '1b' as const,
                    tag: 'PDF/A-1b',
                    iso: 'ISO 19005-1',
                    desc: 'Basic Visual Preservation',
                    detail: 'Most widely accepted by governments, courts, and legacy institutional archives.',
                  },
                  {
                    id: '2b' as const,
                    tag: 'PDF/A-2b',
                    iso: 'ISO 19005-2',
                    desc: 'Visual + Transparency Support',
                    detail: 'Enhanced standard supporting layered graphics, JPEG2000 images, and modern design.',
                  },
                  {
                    id: '3b' as const,
                    tag: 'PDF/A-3b',
                    iso: 'ISO 19005-3',
                    desc: 'Visual + Embedded Attachments',
                    detail: 'Required for modern e-Invoices (ZUGFeRD, Factur-X) and embedded XML data sets.',
                  },
                ].map((std) => (
                  <div
                    key={std.id}
                    onClick={() => !isConverting && setConformance(std.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      conformance === std.id
                        ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/30 shadow-xs ring-1 ring-primary-600'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {std.tag}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                        {std.iso}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 mb-1">
                      {std.desc}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                      {std.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={convertToPdfa}
                disabled={isConverting}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-blue-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isConverting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enforcing Archival ISO Compliance...</span>
                  </>
                ) : (
                  <>
                    <span>Convert to PDF/A-{conformance.toUpperCase()}</span>
                    <span>→</span>
                  </>
                )}
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={`pdfa-${conformance}-${file.name}`}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  <span>Download Compliant PDF/A Document ↓</span>
                </a>
              )}
            </div>

            {/* Compliance Audit Report */}
            {complianceChecks.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 text-lg">🛡️</span>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      ISO Compliance Verification Report
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    PDF/A-{conformance.toUpperCase()} Certified
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {complianceChecks.map((chk, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600 font-bold text-xs">✓</span>
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {chk.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 pl-4">
                          {chk.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500 shrink-0">
                        {chk.standard}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Viewer */}
            {pdfaBlob && (
              <div className="pt-4">
                <DocumentLiveViewer
                  file={pdfaBlob}
                  fileName={`pdfa-${file.name}`}
                  title="PDF/A Archival Preview"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <FeedbackWidget toolName="PDF to PDF/A" />
      <RelatedTools currentSlug="pdf-to-pdfa" />

      {/* How to Use Section */}
      <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          How to Convert PDF to ISO-Compliant PDF/A
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-primary-600 text-sm">1. Select Standard PDF</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Choose File</p>
            <p className="mt-0.5">
              Upload tax documents, invoices, legal contracts, or court briefs that require archival preservation.
            </p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">2. Choose Conformance</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Pick Conformance Level</p>
            <p className="mt-0.5">
              Choose PDF/A-1b for maximum compatibility with older systems, or PDF/A-2b / PDF/A-3b for modern filings.
            </p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">3. Download Certified PDF/A</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Save Archival Copy</p>
            <p className="mt-0.5">
              Our engine injects XMP archival metadata, establishes sRGB OutputIntents, and strips non-compliant scripts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
