import AutoToolSeo from '@/components/AutoToolSeo';
import PdfToMarkdown from './PdfToMarkdown';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/convert-from-pdf/pdf-to-markdown/',
  },
  title: 'PDF to Markdown - Convert PDF to Markdown (.md) Online Free',
  description: 'Convert PDF documents into clean, structured Markdown text with headers, tables, and lists.',
  keywords: [
    'pdf to markdown',
    'convert pdf to md',
    'pdf to text markdown',
    'pdf table extraction',
    'extract markdown from pdf',
    'pdf formatting converter',
    'pdf to formatted markdown'
  ],
};

export default function Page() {
  return (
    <>
      <PdfToMarkdown />
      <AutoToolSeo slug="pdf-to-markdown" />
    </>
  );
}
