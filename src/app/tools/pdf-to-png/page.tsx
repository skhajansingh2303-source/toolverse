import PdfToPng from './PdfToPng';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to PNG - Convert PDF Pages to High-Res PNG Online Free',
  description: 'Convert PDF pages to lossless PNG images with transparency support and 1-click ZIP download.',
  keywords: [
    'pdf to png',
    'convert pdf to png',
    'pdf pages to png images',
    'transparent pdf to png',
    'lossless pdf to png',
    'pdf to png zip',
    'high resolution pdf to png',
    'free pdf to png'
  ],
};

export default function Page() {
  return <PdfToPng />;
}
