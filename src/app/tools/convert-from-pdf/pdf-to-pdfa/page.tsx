import { Metadata } from 'next';
import PdfToPdfa from './PdfToPdfa';

export const metadata: Metadata = {
  title: 'PDF to PDF/A - Convert to Archival PDF/A Format Online Free',
  description: 'Convert PDF documents to ISO-compliant PDF/A format for long-term legal archiving and institutional compliance with 100% private in-browser processing.',
  keywords: [
    'pdf to pdfa',
    'convert pdf to pdf/a',
    'pdf a 1b converter',
    'pdf a 2b',
    'pdf a 3b',
    'iso 19005 compliant',
    'archival pdf converter',
    'legal pdf archive',
  ],
};

export default function Page() {
  return <PdfToPdfa />;
}
