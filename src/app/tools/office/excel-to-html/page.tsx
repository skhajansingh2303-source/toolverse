import AutoToolSeo from '@/components/AutoToolSeo';
import ExcelToHtml from './ExcelToHtml';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Excel to HTML - Convert Excel Spreadsheets to HTML Online Free',
  description: 'Convert Excel XLSX and XLS files into responsive HTML tables client-side. Fast, secure, and privacy-friendly.',
  keywords: [
    'excel to html',
    'convert excel to html',
    'xlsx to html',
    'spreadsheet to html',
    'convert xlsx online',
    'excel to html converter',
    'sheet to html',
  ],
};

export default function Page() {
  return (
    <>
      <ExcelToHtml />
      <AutoToolSeo slug="excel-to-html" />
    </>
  );
}
