import ExcelToPdf from './ExcelToPdf';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/convert-to-pdf/excel-to-pdf/',
  },
  title: 'Excel to PDF - Convert Excel Spreadsheets to PDF Online Free',
  description: 'Convert Excel XLSX, XLS, and CSV files into professional, paginated PDF documents client-side. 100% private in-browser conversion with zero server uploads.',
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

const STEPS = [
  {
    title: 'Upload Excel Spreadsheet',
    description: 'Select your .xlsx, .xls, or .csv spreadsheet file from your computer or mobile device.',
  },
  {
    title: 'Configure Layout & Grid',
    description: 'Preview rows and columns, adjust table boundaries, and set auto-fit page scaling.',
  },
  {
    title: 'Export Paginated PDF',
    description: 'Generate a clean, print-ready PDF document preserving your table structure and formatting.',
  },
];

const FAQS = [
  {
    question: 'Can I convert Excel files with multiple sheets or tables?',
    answer: 'Yes! ToolsVerse parses all worksheets and formats them cleanly into sequential PDF pages with intact columns and rows.',
  },
  {
    question: 'Is my financial data uploaded to any third-party server?',
    answer: 'Never. Financial statements, spreadsheets, and private formulas remain 100% inside your browser. No files are uploaded to any server.',
  },
  {
    question: 'What Excel formats are supported?',
    answer: 'ToolsVerse supports modern XLSX, legacy XLS, and universal CSV files for conversion into PDF.',
  },
];

export default function Page() {
  return (
    <>
      <ExcelToPdf />
      <ToolSeoContent
        toolName="Excel to PDF Converter"
        toolSlug="excel-to-pdf"
        categoryName="Convert to PDF"
        categorySlug="convert-to-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['word-to-pdf', 'pdf-to-excel', 'image-to-pdf', 'compress-pdf']}
      />
    </>
  );
}

