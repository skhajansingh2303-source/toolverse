import { Metadata } from 'next';
import ImageResizer from './ImageResizer';

export const metadata: Metadata = {
  title: 'Image Resizer - Resize Images Online Free',
  description: 'Resize your images by pixels or percentage easily online. Maintain aspect ratio, fast and free in-browser processing.',
  keywords: ['image resizer', 'resize picture', 'change image dimensions', 'scale image online'],
};

export default function Page() {
  return <ImageResizer />;
}
