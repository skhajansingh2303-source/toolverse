import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import MarkdownPreview from './MarkdownPreview';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/developer/markdown-preview/',
  },
  title: 'Markdown Preview - Live Markdown Editor & Previewer',
  description: 'Free online markdown editor with live preview. Write, edit, and preview markdown files directly in your browser.',
  keywords: ['markdown editor', 'markdown preview', 'live markdown', 'online markdown tool', 'markdown to html'],
};

export default function MarkdownPage() {
  return (
    <>
      <MarkdownPreview />
      <AutoToolSeo slug="markdown-preview" />
    </>
  );
}
