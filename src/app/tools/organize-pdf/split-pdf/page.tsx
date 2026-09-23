import { Metadata } from 'next';
import SplitPdf from './SplitPdf';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/organize-pdf/split-pdf/',
  },
  title: 'Split PDF - Extract Pages from PDF Online Free',
  description: 'Split a PDF file, extract specific pages, or separate every page into a new PDF document. 100% private in-browser splitting with zero server uploads.',
  keywords: ['split pdf', 'extract pdf pages', 'separate pdf', 'pdf splitter', 'split pdf online'],
};

const STEPS = [
  {
    title: 'Upload your PDF File',
    description: 'Select the document you wish to split or extract pages from.',
  },
  {
    title: 'Select Pages or Split Mode',
    description: 'Choose page ranges (e.g. 1-5, 8, 11-14) or choose to split every single page into individual files.',
  },
  {
    title: 'Download Extracted PDFs',
    description: 'Instantly download your trimmed PDF file or get all split pages packaged in a ZIP archive.',
  },
];

const FAQS = [
  {
    question: 'Can I split PDF pages without losing quality?',
    answer: 'Yes! Splitting PDF files in ToolsVerse extracts the exact native byte objects and vector streams without re-encoding, so there is zero loss of quality.',
  },
  {
    question: 'Are my private PDF documents uploaded anywhere?',
    answer: 'Never. The entire operation is handled in your local browser sandbox. No file chunks or data packets ever travel over the network.',
  },
  {
    question: 'Can I extract non-consecutive pages (e.g. page 2, 5, and 9)?',
    answer: 'Yes. You can specify custom page ranges and comma-separated page numbers to extract exactly the pages you need.',
  },
  {
    question: 'Is there a page limit for splitting?',
    answer: 'No. You can split documents with hundreds of pages smoothly on your desktop or mobile browser.',
  },
];

export default function SplitPdfPage() {
  return (
    <>
      <SplitPdf />
      <ToolSeoContent
        toolName="Split PDF Tool"
        toolSlug="split-pdf"
        categoryName="Organize PDF"
        categorySlug="organize-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['merge-pdf', 'remove-pdf-pages', 'rearrange-pdf-pages', 'compress-pdf']}
      />
    </>
  );
}
