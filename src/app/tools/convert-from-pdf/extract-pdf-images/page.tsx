import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import ExtractPdfImages from './ExtractPdfImages';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/convert-from-pdf/extract-pdf-images/',
  },
  title: 'Extract Images from PDF - Save PDF Images Online Free',
  description: 'Extract all pictures and pages from PDF files as high-quality PNG images online for free. Fast, private in-browser extraction with zero file limits.',
  keywords: ['extract images from pdf', 'save pdf images', 'pdf to png pictures', 'extract photos from pdf', 'pdf24 extract images'],
};

export default function Page() {
  return (
    <>
      <ExtractPdfImages />
      <AutoToolSeo slug="extract-pdf-images" />
    </>
  );
}
