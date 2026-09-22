import { Metadata } from 'next';
import ExtractPdfPages from './ExtractPdfPages';

export const metadata: Metadata = {
  title: 'Extract PDF Pages - Extract Pages from PDF Online Free',
  description: 'Visually select and extract specific pages from your PDF file into a new PDF or ZIP archive.',
  keywords: [
    'extract pdf pages',
    'extract pages from pdf',
    'pdf page extractor',
    'split pdf pages',
    'select pdf pages',
    'save specific pdf pages',
    'cut pdf pages',
  ],
};

export default function ExtractPdfPagesPage() {
  return <ExtractPdfPages />;
}
