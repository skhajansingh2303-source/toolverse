import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import BookmarkPdf from './BookmarkPdf';

export const metadata: Metadata = {
  title: 'Bookmark PDF - Create & Edit PDF Table of Contents Online',
  description: 'Add, edit, and organize hierarchical bookmarks and outlines in PDF files for fast navigation with 100% private in-browser processing.',
  keywords: [
    'bookmark pdf',
    'add bookmarks to pdf',
    'create pdf table of contents',
    'edit pdf outlines',
    'pdf bookmark editor',
    'hierarchical pdf bookmarks',
    'pdf navigation outlines',
    'pdf toc maker',
  ],
};

export default function Page() {
  return (
    <>
      <BookmarkPdf />
      <AutoToolSeo slug="bookmark-pdf" />
    </>
  );
}
