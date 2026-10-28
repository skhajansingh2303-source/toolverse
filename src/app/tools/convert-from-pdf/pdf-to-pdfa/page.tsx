import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import PdfToPdfa from './PdfToPdfa';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/convert-from-pdf/pdf-to-pdfa/',
  },
  title: 'Convert PDF to PDF/A Online Free — ISO Archival Standard (PDF/A-1b, 2b)',
  description: 'Convert PDF documents to ISO-compliant PDF/A format online free for long-term legal archiving and institutional compliance with 100% private in-browser processing.',
  keywords: [
    'convert pdf to pdfa online free',
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
  return (
    <>
      <PdfToPdfa />
      <AutoToolSeo slug="pdf-to-pdfa" />
    </>
  );
}
