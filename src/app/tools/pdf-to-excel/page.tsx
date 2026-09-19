import PdfToExcel from './PdfToExcel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to Excel - Extract PDF Tables to Excel (.xlsx) Online Free',
  description: 'Extract tables, financial statements, and matrices from PDF files into downloadable Excel spreadsheets.',
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

export default function Page() {
  return <PdfToExcel />;
}
