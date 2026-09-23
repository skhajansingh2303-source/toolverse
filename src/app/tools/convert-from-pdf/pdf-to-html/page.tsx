import AutoToolSeo from '@/components/AutoToolSeo';
import PdfToHtml from './PdfToHtml';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/convert-from-pdf/pdf-to-html/',
  },
  title: 'PDF to HTML - Convert PDF Pages to Responsive Webpage Online',
  description: 'Convert PDF documents into clean, responsive HTML web pages with layout preservation.',
  keywords: [
    'pdf to html',
    'convert pdf to webpage',
    'pdf html5 converter',
    'pdf to web page',
    'extract html from pdf',
    'pdf responsive html',
    'pdf to clean html',
    'export pdf to web'
  ],
};

export default function Page() {
  return (
    <>
      <PdfToHtml />
      <AutoToolSeo slug="pdf-to-html" />
    </>
  );
}
