import AutoToolSeo from '@/components/AutoToolSeo';
import PdfToMarkdown from './PdfToMarkdown';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/convert-from-pdf/pdf-to-markdown/',
  },
  title: 'Convert PDF to MD File Online Free — Clean Markdown Converter',
  description: 'Convert PDF documents into clean, structured Markdown (.md) text online for free. Preserves headers, tables, lists, and formatting.',
  keywords: [
    'convert pdf to md file',
    'pdf to markdown online free',
    'pdf to markdown',
    'convert pdf to md',
    'pdf to text markdown',
    'pdf table extraction markdown',
    'extract markdown from pdf',
    'pdf formatting converter',
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
