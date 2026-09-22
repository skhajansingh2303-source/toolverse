import { Metadata } from 'next';
import SplitPdf from './SplitPdf';

export const metadata: Metadata = {
  title: 'Split PDF - Extract Pages from PDF Online Free',
  description: 'Split a PDF file, extract specific pages, or separate every page into a new PDF document. Free online tool.',
  keywords: ['split pdf', 'extract pdf pages', 'separate pdf', 'pdf splitter'],
};

export default function SplitPdfPage() {
  return <SplitPdf />;
}
