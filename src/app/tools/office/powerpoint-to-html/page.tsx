import AutoToolSeo from '@/components/AutoToolSeo';
import PowerpointToHtml from './PowerpointToHtml';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/office/powerpoint-to-html/',
  },
  title: 'PowerPoint to HTML - Convert PPTX to Web Presentation Online Free',
  description: 'Convert PowerPoint slides into responsive HTML presentations.',
  keywords: [
    'powerpoint to html',
    'convert pptx to html',
    'ppt to web',
    'powerpoint converter',
  ],
};

export default function Page() {
  return (
    <>
      <PowerpointToHtml />
      <AutoToolSeo slug="powerpoint-to-html" />
    </>
  );
}
