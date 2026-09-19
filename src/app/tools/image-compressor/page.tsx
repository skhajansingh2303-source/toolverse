import { Metadata } from 'next';
import ImageCompressor from './ImageCompressor';

export const metadata: Metadata = {
  title: 'Image Compressor - Compress Images Online Free',
  description: 'Free online image compressor. Reduce image file sizes for PNG, WebP, and JPEG without losing quality right in your browser.',
  keywords: ['image compressor', 'compress images', 'reduce image size', 'online image optimizer', 'compress jpeg png'],
};

export default function ImageCompressorPage() {
  return <ImageCompressor />;
}
