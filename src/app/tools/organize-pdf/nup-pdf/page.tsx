import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import NupPdf from './NupPdf';

export const metadata: Metadata = {
  title: 'Pages Per Sheet - Combine Multiple PDF Pages on One Sheet Online',
  description: 'Print multiple PDF pages on a single sheet (2-up or 4-up) online for free. Save paper and ink when printing handouts, lecture slides, and notes.',
  keywords: ['pages per sheet', 'n-up pdf', '2 pages per sheet pdf', '4 pages per sheet pdf', 'pdf24 pages per sheet'],
};

export default function Page() {
  return (
    <>
      <NupPdf />
      <AutoToolSeo slug="nup-pdf" />
    </>
  );
}
