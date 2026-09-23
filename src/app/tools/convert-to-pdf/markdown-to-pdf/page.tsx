import AutoToolSeo from '@/components/AutoToolSeo';
import MarkdownToPdf from './MarkdownToPdf';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/convert-to-pdf/markdown-to-pdf/',
  },
  title: 'Markdown to PDF - Convert Markdown to PDF Online Free',
  description: 'Render styled Markdown files into beautiful, publication-grade PDF documents instantly.',
  keywords: [
    'markdown to pdf',
    'convert md to pdf',
    'markdown document generator',
    'markdown printable pdf',
    'render markdown to pdf',
    'styled markdown pdf',
    'export markdown to pdf'
  ],
};

export default function Page() {
  return (
    <>
      <MarkdownToPdf />
      <AutoToolSeo slug="markdown-to-pdf" />
    </>
  );
}
