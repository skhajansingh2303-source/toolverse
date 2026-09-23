import PdfToJpg from './PdfToJpg';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/convert-from-pdf/pdf-to-jpg/',
  },
  title: 'PDF to JPG - Convert PDF Pages to Images Online Free',
  description: 'Convert your PDF documents into high-quality JPG images online for free. 100% private in-browser rendering with zero server uploads.',
  keywords: ['pdf to jpg', 'convert pdf to image', 'pdf to jpeg', 'extract pdf pages', 'pdf converter'],
};

const STEPS = [
  {
    title: 'Choose or Drag your PDF',
    description: 'Select the PDF document from your device or drag it directly into the conversion box.',
  },
  {
    title: 'Select Quality Mode',
    description: 'Choose between Fast Web resolution or High Definition (HD) rendering for crystal-clear images.',
  },
  {
    title: 'Download JPG or ZIP',
    description: 'Save individual image pages or click "Download All as ZIP" to get all converted pages in one click.',
  },
];

const FAQS = [
  {
    question: 'Are my PDF files uploaded to any server during conversion?',
    answer: 'No. ToolsVerse processes PDF documents entirely inside your browser using client-side WebAssembly and PDF.js. Your files never leave your computer or mobile device.',
  },
  {
    question: 'Can I convert multi-page PDFs to JPG images?',
    answer: 'Yes! You can convert documents with dozens of pages. Every page is rendered into an image, and you can download all of them simultaneously in a single ZIP archive.',
  },
  {
    question: 'What is the difference between Fast and HD quality?',
    answer: 'Fast mode generates standard web-ready JPGs quickly, while HD mode renders at double DPI (300 DPI) for crisp text, sharp diagrams, and high-resolution printing.',
  },
  {
    question: 'Is this PDF to JPG converter really free?',
    answer: 'Yes, 100% free with no hidden subscriptions, no daily conversion limits, and no watermark added to your images.',
  },
];

export default function Page() {
  return (
    <>
      <PdfToJpg />
      <ToolSeoContent
        toolName="PDF to JPG Converter"
        toolSlug="pdf-to-jpg"
        categoryName="Convert from PDF"
        categorySlug="convert-from-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['pdf-to-png', 'pdf-to-word', 'pdf-to-text', 'image-to-pdf']}
      />
    </>
  );
}
