import CompressPdf from './CompressPdf';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/optimize-pdf/compress-pdf/',
  },
  title: 'Compress PDF - Reduce PDF File Size Online Free',
  description: 'Compress PDF files online for free. Reduce PDF file size while maintaining document clarity. 100% private in-browser optimization with zero server uploads.',
  keywords: ['compress pdf', 'reduce pdf size', 'shrink pdf', 'pdf compressor', 'compress pdf online'],
};

const STEPS = [
  {
    title: 'Upload your PDF File',
    description: 'Select your heavy PDF document or drop it into the compressor tool area.',
  },
  {
    title: 'Choose Compression Level',
    description: 'Pick Extreme Compression (smallest file size) or Recommended Compression (optimal quality and size balance).',
  },
  {
    title: 'Download Optimized PDF',
    description: 'Get your lightweight PDF ready for email attachments, government portal uploads, and web sharing.',
  },
];

const FAQS = [
  {
    question: 'How much can I reduce my PDF file size?',
    answer: 'Depending on the images and fonts inside your original document, compression typically reduces PDF file size by 40% to 85% without sacrificing text readability.',
  },
  {
    question: 'Are my private documents safe from data harvesting?',
    answer: '100% safe. ToolsVerse uses in-browser stream compression. Your documents never reach our servers or any cloud database.',
  },
  {
    question: 'Will text in my PDF become blurry after compression?',
    answer: 'No. Vector text and fonts remain sharp and crisp. The compressor primarily optimizes oversized embedded images, removes duplicate metadata, and compresses stream objects.',
  },
  {
    question: 'Is there a limit on file size or daily compressions?',
    answer: 'No limits. You can compress as many PDFs as you need, completely free without any paywalls or daily caps.',
  },
];

export default function Page() {
  return (
    <>
      <CompressPdf />
      <ToolSeoContent
        toolName="PDF Compressor"
        toolSlug="compress-pdf"
        categoryName="Optimize PDF"
        categorySlug="optimize-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['merge-pdf', 'pdf-to-jpg', 'repair-pdf', 'optimize-pdf-web']}
      />
    </>
  );
}
