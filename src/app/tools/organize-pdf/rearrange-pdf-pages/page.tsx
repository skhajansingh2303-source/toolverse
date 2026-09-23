import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import RearrangePdfPages from './RearrangePdfPages';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/organize-pdf/rearrange-pdf-pages/',
  },
  title: 'Rearrange PDF Pages - Organize and Sort PDF Pages Online Free',
  description: 'Easily reorder, move, reverse, and organize PDF pages visually online for free. Sort pages before printing or sharing with 100% private in-browser security.',
  keywords: ['rearrange pdf pages', 'reorder pdf pages', 'sort pdf pages', 'organize pdf', 'pdf24 sort pdf pages'],
};

export default function Page() {
  return (
    <>
      <RearrangePdfPages />
      <AutoToolSeo slug="rearrange-pdf-pages" />
    </>
  );
}
