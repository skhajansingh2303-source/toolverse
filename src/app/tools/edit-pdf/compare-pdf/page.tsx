import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import ComparePdf from './ComparePdf';

export const metadata: Metadata = {
  title: 'Compare PDF - Compare Two PDF Files for Differences Online',
  description: 'Compare two PDF documents side by side to highlight visual and text differences between revisions.',
  keywords: ['compare pdf', 'pdf diff tool', 'pdf difference', 'compare two pdfs online', 'visual pdf diff', 'text pdf compare', 'pdf revision compare'],
};

export default function ComparePdfPage() {
  return (
    <>
      <ComparePdf />
      <AutoToolSeo slug="compare-pdf" />
    </>
  );
}
