import ExcelToPdf from './ExcelToPdf';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Excel to PDF - Convert Excel Spreadsheets to PDF Online Free',
  description: 'Convert Excel XLSX, XLS, and CSV files into professional, paginated PDF documents client-side.',
  keywords: [
    'excel to pdf',
    'convert excel to pdf',
    'xlsx to pdf',
    'csv to pdf',
    'spreadsheet to pdf',
    'convert xlsx online',
    'excel to pdf converter',
    'sheet to pdf',
  ],
};

export default function Page() {
  return <ExcelToPdf />;
}
