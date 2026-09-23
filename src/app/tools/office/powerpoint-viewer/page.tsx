import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import PowerpointViewer from './PowerpointViewer';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/office/powerpoint-viewer/',
  },
  title: 'PowerPoint Viewer & Slideshow - Present PPTX Online Free',
  description: 'Open, view, and present Microsoft PowerPoint (.pptx) presentation slides directly in your browser. Full-screen presentation mode, thumbnails, and 100% private.',
  keywords: [
    'powerpoint viewer',
    'pptx viewer',
    'view pptx online',
    'powerpoint slideshow online',
    'open pptx free',
    'online presentation viewer'
  ],
};

export default function Page() {
  return (
    <>
      <PowerpointViewer />
      <AutoToolSeo slug="powerpoint-viewer" />
    </>
  );
}
