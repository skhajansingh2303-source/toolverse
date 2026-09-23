import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import HalvePdfPages from './HalvePdfPages';

export const metadata: Metadata = {
  title: 'Halve PDF Pages - Split Double-Page Spreads Online Free',
  description: 'Split two-page book scans and magazine spreads into individual single pages automatically with 100% private in-browser processing.',
  keywords: [
    'halve pdf pages',
    'split double page pdf',
    'split scanned book pdf',
    'cut pdf pages in half',
    'split two page spreads',
    'halve pdf online',
    'split book scan pdf',
    'de-spread pdf',
  ],
};

export default function Page() {
  return (
    <>
      <HalvePdfPages />
      <AutoToolSeo slug="halve-pdf-pages" />
    </>
  );
}
