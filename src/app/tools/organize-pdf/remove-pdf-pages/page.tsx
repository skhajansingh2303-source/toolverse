import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import RemovePdfPages from './RemovePdfPages';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/organize-pdf/remove-pdf-pages/',
  },
  title: 'Remove Pages from PDF - Delete PDF Pages Online Free',
  description: 'Easily remove specific pages from your PDF documents online for free. Visual page selection, no installation required.',
  keywords: ['remove pdf pages', 'delete pdf pages', 'extract pdf pages', 'pdf editor online'],
};

export default function Page() {
  return (
    <>
      <RemovePdfPages />
      <AutoToolSeo slug="remove-pdf-pages" />
    </>
  );
}
