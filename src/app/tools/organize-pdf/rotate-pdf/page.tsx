import { Metadata } from 'next';
import RotatePdf from './RotatePdf';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  title: 'Rotate PDF - Rotate PDF Pages 90 180 Degrees Online Free',
  description: 'Rotate specific or all pages of a PDF document permanently (90°, 180°, 270°). 100% private in-browser orientation tool with zero server uploads.',
  keywords: ['rotate pdf', 'rotate pdf pages', 'pdf rotator', 'turn pdf pages', 'rotate pdf 90 degrees', 'permanent pdf rotation'],
};

const STEPS = [
  {
    title: 'Upload your PDF Document',
    description: 'Select the PDF file that has upside-down or sideways pages.',
  },
  {
    title: 'Rotate Individual or All Pages',
    description: 'Click individual rotate buttons on any page thumbnail or rotate the entire document 90° clockwise or counter-clockwise.',
  },
  {
    title: 'Download Corrected PDF',
    description: 'Save the permanently oriented PDF document in one click right from your browser.',
  },
];

const FAQS = [
  {
    question: 'Does rotating pages reduce PDF quality or alter text?',
    answer: 'No. ToolsVerse updates internal page rotation metadata directly, preserving 100% of original vector clarity, crisp fonts, and image resolution.',
  },
  {
    question: 'Can I rotate only a single page inside a multi-page document?',
    answer: 'Yes! Each page thumbnail has individual rotate controls so you can rotate only the upside-down pages while leaving the rest untouched.',
  },
  {
    question: 'Is the page rotation permanent in all PDF readers?',
    answer: 'Yes, the saved PDF writes standard orientation tags that are respected by Adobe Acrobat, Apple Preview, web browsers, and printers.',
  },
];

export default function RotatePdfPage() {
  return (
    <>
      <RotatePdf />
      <ToolSeoContent
        toolName="Rotate PDF"
        toolSlug="rotate-pdf"
        categoryName="Organize PDF"
        categorySlug="organize-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['rearrange-pdf-pages', 'split-pdf', 'merge-pdf', 'remove-pdf-pages']}
      />
    </>
  );
}

