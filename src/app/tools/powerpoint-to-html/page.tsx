import PowerpointToHtml from './PowerpointToHtml';
import { Metadata } from 'next';

export const metadata: Metadata = {
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
  return <PowerpointToHtml />;
}
