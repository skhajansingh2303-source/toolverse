import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import ImageConverter from './ImageConverter';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/media/image-converter/',
  },
  title: 'Image Converter - Convert PNG JPG WebP Online Free',
  description: 'Convert images between formats online for free. Support for PNG, JPG, WebP with adjustable quality. Fast in-browser processing.',
  keywords: ['image converter', 'convert png to jpg', 'convert to webp', 'image format converter online'],
};

export default function Page() {
  return (
    <>
      <ImageConverter />
      <AutoToolSeo slug="image-converter" />
    </>
  );
}
