import { Metadata } from 'next';
import ImageCompressor from './ImageCompressor';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/media/image-compressor/',
  },
  title: 'Image Compressor - Compress JPG, PNG & WebP Online Free',
  description: 'Reduce image file sizes by up to 80% without visible quality loss. Free, in-browser image compressor with zero server uploads and privacy guaranteed.',
  keywords: ['image compressor', 'compress images', 'reduce image size', 'online image optimizer', 'compress jpeg png', 'compress webp'],
};

const STEPS = [
  {
    title: 'Drop Images to Compress',
    description: 'Select one or multiple JPG, PNG, or WebP images from your device.',
  },
  {
    title: 'Adjust Compression Level',
    description: 'Use the quality slider to find the perfect balance between minimal file size and crisp visual clarity.',
  },
  {
    title: 'Download Optimized Images',
    description: 'Preview the before/after file size savings and download your lightweight images instantly.',
  },
];

const FAQS = [
  {
    question: 'How much can I reduce my image size without losing quality?',
    answer: 'Using smart lossy and lossless browser compression, you can typically reduce file size by 60% to 85% with virtually no noticeable difference to the human eye.',
  },
  {
    question: 'Are my private pictures uploaded to a cloud server?',
    answer: 'No. Compression is computed 100% locally on your device using HTML5 Canvas and modern browser compression APIs. Your photos remain completely private.',
  },
  {
    question: 'Which image formats are supported?',
    answer: 'ToolsVerse Image Compressor supports JPEG, JPG, PNG, and WebP image formats with batch compression support.',
  },
];

export default function ImageCompressorPage() {
  return (
    <>
      <ImageCompressor />
      <ToolSeoContent
        toolName="Image Compressor"
        toolSlug="image-compressor"
        categoryName="Media & Images"
        categorySlug="media"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['image-converter', 'image-resizer', 'heic-to-jpg', 'favicon-generator']}
      />
    </>
  );
}

