import PdfToExcel from './PdfToExcel';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  title: 'PDF to Excel - Extract PDF Tables to Excel (.xlsx) Online Free',
  description: 'Extract tables, financial statements, and matrices from PDF files into downloadable Excel spreadsheets. 100% private in-browser conversion.',
  keywords: [
    'pdf to excel',
    'convert pdf to xlsx',
    'extract pdf tables',
    'pdf to spreadsheet',
    'pdf to csv',
    'free pdf to excel',
    'pdf table extractor',
  ],
};

const STEPS = [
  {
    title: 'Drop PDF with Tables',
    description: 'Upload your bank statement, invoice, report, or any PDF containing tabular data.',
  },
  {
    title: 'Detect Columns & Rows',
    description: 'ToolsVerse automatically detects cell boundaries, rows, and numbers right inside your browser.',
  },
  {
    title: 'Export to Excel (.xlsx)',
    description: 'Download the cleanly organized Microsoft Excel file ready for formulas, calculations, and analysis.',
  },
];

const FAQS = [
  {
    question: 'How does ToolsVerse extract tables from PDF without uploading to a server?',
    answer: 'Using client-side PDF parsing algorithms, the tool reads text coordinates and line positions to reconstruct table cells locally in your browser memory.',
  },
  {
    question: 'Can I extract multi-page tables into a single Excel file?',
    answer: 'Yes! Multi-page documents will be processed and structured into clean, editable spreadsheet rows.',
  },
  {
    question: 'Is it safe to use for sensitive bank statements and accounting files?',
    answer: 'Yes, 100% secure. Because no file is ever transmitted over the network or saved on remote servers, your private financial data remains completely confidential.',
  },
];

export default function Page() {
  return (
    <>
      <PdfToExcel />
      <ToolSeoContent
        toolName="PDF to Excel Converter"
        toolSlug="pdf-to-excel"
        categoryName="Convert from PDF"
        categorySlug="convert-from-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['excel-to-pdf', 'pdf-to-word', 'pdf-to-text', 'pdf-to-jpg']}
      />
    </>
  );
}

