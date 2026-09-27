import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import PdfOcr from './PdfOcr';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/optimize-pdf/pdf-ocr/',
  },
  title: 'PDF OCR - Optical Character Recognition | Make Scanned PDF Searchable',
  description: 'Convert scanned non-searchable PDFs into readable, selectable, and searchable documents with free in-browser Optical Character Recognition (OCR).',
  keywords: [
    'pdf ocr',
    'optical character recognition',
    'optical character reader',
    'make pdf text readable',
    'make pdf searchable',
    'scanned pdf to text',
    'searchable pdf converter',
    'extract text from scanned pdf',
    'read text from pdf',
    'recognize text in scanned pdf',
    'unsearchable pdf to searchable',
    'turn scanned pdf into text'
  ],
};

export default function PdfOcrPage() {
  return (
    <>
      <PdfOcr />
      <AutoToolSeo slug="pdf-ocr" />
    </>
  );
}
