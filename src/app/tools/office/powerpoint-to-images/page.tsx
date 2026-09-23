import AutoToolSeo from '@/components/AutoToolSeo';
import PowerpointToImages from './PowerpointToImages';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PowerPoint to Images - Convert PPTX to JPG/PNG Online Free',
  description: 'Convert PowerPoint slides into high-quality images (PNG, JPG, WebP).',
  keywords: [
    'powerpoint to image',
    'convert pptx to png',
    'ppt to jpg',
    'powerpoint converter',
  ],
};

export default function Page() {
  return (
    <>
      <PowerpointToImages />
      <AutoToolSeo slug="powerpoint-to-images" />
    </>
  );
}
