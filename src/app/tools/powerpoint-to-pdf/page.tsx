import PowerpointToPdf from './PowerpointToPdf';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PowerPoint to PDF - Convert PPTX to PDF Online Free',
  description: 'Convert PowerPoint slides into high-quality PDF documents.',
  keywords: [
    'powerpoint to pdf',
    'convert pptx to pdf',
    'ppt to pdf',
    'powerpoint converter',
  ],
};

export default function Page() {
  return <PowerpointToPdf />;
}
