import AutoToolSeo from '@/components/AutoToolSeo';
import ExcelToJson from './ExcelToJson';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Excel to JSON - Convert Excel Spreadsheets to JSON Online Free',
  description: 'Convert Excel XLSX and XLS files into JSON format client-side. Fast, secure, and privacy-friendly.',
  keywords: [
    'excel to json',
    'convert excel to json',
    'xlsx to json',
    'spreadsheet to json',
    'convert xlsx online',
    'excel to json converter',
    'sheet to json',
  ],
};

export default function Page() {
  return (
    <>
      <ExcelToJson />
      <AutoToolSeo slug="excel-to-json" />
    </>
  );
}
