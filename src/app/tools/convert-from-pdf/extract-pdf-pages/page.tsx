import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import ExtractPdfPages from './ExtractPdfPages';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/convert-from-pdf/extract-pdf-pages/',
  },
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
  return (
    <>
      <ExtractPdfPages />
      <AutoToolSeo slug="extract-pdf-pages" />
    </>
  );
}
