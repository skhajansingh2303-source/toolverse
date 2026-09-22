import PdfToPng from './PdfToPng';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  title: 'PDF to PNG - Convert PDF Pages to High-Res PNG Online Free',
  description: 'Convert PDF pages to lossless PNG images with transparency support and 1-click ZIP download. 100% private in-browser conversion with zero server uploads.',
  keywords: [
    'pdf to png',
    'convert pdf to png',
    'pdf pages to png images',
    'transparent pdf to png',
    'lossless pdf to png',
    'pdf to png zip',
    'high resolution pdf to png',
    'free pdf to png',
  ],
};

const STEPS = [
  {
    title: 'Select your PDF File',
    description: 'Drag and drop your PDF file or click to browse from your device storage.',
  },
  {
    title: 'Choose Render Resolution',
    description: 'Select standard or high-DPI lossless rendering for ultra-sharp diagrams and charts.',
  },
  {
    title: 'Export Lossless PNGs',
    description: 'Save individual high-quality transparent PNG pages or download all pages together in a ZIP file.',
  },
];

const FAQS = [
  {
    question: 'Why choose PNG instead of JPG for PDF conversion?',
    answer: 'PNG uses lossless compression, meaning text, sharp lines, logos, and vector illustrations stay crisp without compression artifacts. PNG also supports transparent backgrounds.',
  },
  {
    question: 'Is my PDF uploaded to any server for rendering?',
    answer: 'No. ToolsVerse uses in-browser canvas and WebAssembly to render each page locally on your device. Your data never touches any remote server.',
  },
  {
    question: 'Can I download all converted PNG pages in one archive?',
    answer: 'Yes, after all pages are rendered, simply click "Download ZIP" to download every page packaged into a single archive.',
  },
];

export default function Page() {
  return (
    <>
      <PdfToPng />
      <ToolSeoContent
        toolName="PDF to PNG Converter"
        toolSlug="pdf-to-png"
        categoryName="Convert from PDF"
        categorySlug="convert-from-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['pdf-to-jpg', 'pdf-to-svg', 'image-to-pdf', 'compress-pdf']}
      />
    </>
  );
}

