import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import RasterizePdf from './RasterizePdf';

export const metadata: Metadata = {
  title: 'Rasterize PDF - Flatten Vectors to Image PDF Online Free',
  description: 'Rasterize PDF pages into secure, uncopyable images. Eliminate selectable text and hidden vector scripts with 100% private browser processing.',
  keywords: [
    'rasterize pdf',
    'flatten pdf to image',
    'convert vector pdf to raster',
    'lock pdf text',
    'make pdf uncopyable',
    'secure pdf image',
    'rasterize pdf online',
  ],
};

export default function Page() {
  return (
    <>
      <RasterizePdf />
      <AutoToolSeo slug="rasterize-pdf" />
    </>
  );
}
