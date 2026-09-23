import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import PdfOcr from './PdfOcr';

export const metadata: Metadata = {
  title: 'PDF OCR - Recognize Text from Scanned PDF Online Free',
  description: 'Extract and recognize text from scanned PDFs and document images with free browser-based OCR.',
  keywords: ['pdf ocr', 'recognize text pdf', 'scanned pdf to text', 'searchable pdf', 'ocr pdf online', 'extract text from image pdf', 'ocr scanner online free'],
};

export default function PdfOcrPage() {
  return (
    <>
      <PdfOcr />
      <AutoToolSeo slug="pdf-ocr" />
    </>
  );
}
