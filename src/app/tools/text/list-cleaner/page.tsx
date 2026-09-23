import AutoToolSeo from '@/components/AutoToolSeo';
import type { Metadata } from 'next';
import ListCleaner from './ListCleaner';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/text/list-cleaner/',
  },
  title: 'List Cleaner & Deduplicator - Sort, Filter & Clean Lists',
  description: 'Clean, sort, deduplicate, trim whitespace, and add prefixes/suffixes to list items online for free.',
  keywords: ['list cleaner', 'remove duplicates', 'sort list', 'deduplicate list', 'list sorter'],
};

export default function Page() {
  return (
    <>
      <ListCleaner />
      <AutoToolSeo slug="list-cleaner" />
    </>
  );
}
