import { Metadata } from 'next';
import ImageToPdf from './ImageToPdf';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  title: 'Image to PDF - Convert JPG PNG to PDF Online Free',
  description: 'Convert JPG, PNG, and WebP images to high-quality PDF documents online for free. 100% private in-browser conversion with zero server uploads.',
  keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert image to pdf', 'photos to pdf', 'combine images to pdf'],
};

const STEPS = [
  {
    title: 'Select or Drop Images',
    description: 'Upload your JPG, PNG, WebP, or BMP images. You can select multiple images at once to combine them.',
  },
  {
    title: 'Customize Layout & Order',
    description: 'Reorder pages, set page orientation (portrait/landscape), paper size (A4, Letter), and margin spacing.',
  },
  {
    title: 'Generate & Download PDF',
    description: 'Click "Convert to PDF" to instantly compile all your photos into a crisp, single PDF document in your browser.',
  },
];

const FAQS = [
  {
    question: 'Can I combine multiple JPG and PNG images into a single PDF?',
    answer: 'Yes! You can select and arrange as many images as you need. They will be ordered and merged into one single, clean PDF file.',
  },
  {
    question: 'Are my private photos uploaded to any remote server?',
    answer: 'No. All processing happens entirely inside your web browser. Your private pictures and photos never touch any server or cloud storage.',
  },
  {
    question: 'What image formats are supported for PDF conversion?',
    answer: 'ToolsVerse supports JPG, JPEG, PNG, WebP, SVG, and BMP images with high-resolution output preservation.',
  },
  {
    question: 'Is there a limit on how many pictures I can convert?',
    answer: 'No limits. Unlike other online converters that cap free users to 2 or 3 files, ToolsVerse is 100% free and unlimited.',
  },
];

export default function ImageToPdfPage() {
  return (
    <>
      <ImageToPdf />
      <ToolSeoContent
        toolName="Image to PDF Converter"
        toolSlug="image-to-pdf"
        categoryName="Convert to PDF"
        categorySlug="convert-to-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['pdf-to-jpg', 'pdf-to-png', 'compress-pdf', 'merge-pdf']}
      />
    </>
  );
}

