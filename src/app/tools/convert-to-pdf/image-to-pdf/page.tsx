import { Metadata } from 'next';
import ImageToPdf from './ImageToPdf';

export const metadata: Metadata = {
  title: 'Image to PDF - Convert JPG PNG to PDF Online Free',
  description: 'Convert JPG, PNG, and WebP images to PDF documents. Customize page size, orientation, and margins.',
  keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert image to pdf'],
};

export default function ImageToPdfPage() {
  return <ImageToPdf />;
}
