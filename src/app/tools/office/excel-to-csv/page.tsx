import AutoToolSeo from '@/components/AutoToolSeo';
import ExcelToCsv from './ExcelToCsv';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Excel to CSV - Convert Excel Spreadsheets to CSV Online Free',
  description: 'Convert Excel XLSX and XLS files into CSV format client-side. Fast, secure, and privacy-friendly.',
  keywords: [
    'excel to csv',
    'convert excel to csv',
    'xlsx to csv',
    'spreadsheet to csv',
    'convert xlsx online',
    'excel to csv converter',
    'sheet to csv',
  ],
};

export default function Page() {
  return (
    <>
      <ExcelToCsv />
      <AutoToolSeo slug="excel-to-csv" />
    </>
  );
}
