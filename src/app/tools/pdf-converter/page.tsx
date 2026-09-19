import { Metadata } from 'next';
import PdfConverter from './PdfConverter';

export const metadata: Metadata = {
  title: 'PDF Converter - Convert PDF to Word, Text, HTML, Images Online',
  description: 'Convert PDF to Word, Text, HTML, and Images, or convert documents into PDF 100% free.',
  keywords: [
    'pdf converter',
    'convert pdf to word',
    'pdf to docx',
    'pdf to text',
    'pdf to html',
    'pdf to images',
    'convert to pdf',
    'free pdf converter',
  ],
};

export default function PdfConverterPage() {
  return <PdfConverter />;
}
