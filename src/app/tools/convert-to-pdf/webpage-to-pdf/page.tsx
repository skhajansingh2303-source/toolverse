import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import WebpageToPdf from './WebpageToPdf';

export const metadata: Metadata = {
  title: 'Webpage to PDF - Convert HTML & Web Pages to PDF Online',
  description: 'Convert any webpage or HTML code into a clean, formatted PDF document instantly.',
  keywords: [
    'webpage to pdf',
    'convert url to pdf',
    'html to pdf',
    'save website as pdf',
    'web to pdf converter',
    'online html to pdf',
    'webpage to pdf free',
  ],
};

export default function WebpageToPdfPage() {
  return (
    <>
      <WebpageToPdf />
      <AutoToolSeo slug="webpage-to-pdf" />
    </>
  );
}
