import { Metadata } from 'next';
import MergePdf from './MergePdf';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  title: 'Merge PDF - Combine PDF Files Online Free (No Limit)',
  description: 'Merge multiple PDF files into one single document easily and securely in your browser. 100% private, free online PDF combiner with zero server uploads.',
  keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'pdf merger', 'combine pdf pages'],
};

const STEPS = [
  {
    title: 'Select PDF Documents',
    description: 'Upload two or more PDF files from your computer, phone, or drag and drop them directly into the drop zone.',
  },
  {
    title: 'Reorder Pages & Files',
    description: 'Drag and arrange your documents in the exact order you want them to appear in the combined PDF file.',
  },
  {
    title: 'Combine & Save',
    description: 'Click "Merge PDF" to instantly stitch all pages together into a single document and download it immediately.',
  },
];

const FAQS = [
  {
    question: 'How many PDF files can I merge together?',
    answer: 'There is no artificial limit. Because ToolsVerse runs client-side inside your browser memory, you can merge as many PDF files as your device memory allows without any daily quota.',
  },
  {
    question: 'Are my confidential documents uploaded to a remote server?',
    answer: 'No. Unlike traditional cloud services like iLovePDF or Smallpdf, your files are never transmitted across the internet. All merging operations occur 100% locally in your web browser.',
  },
  {
    question: 'Will merging PDFs reduce document formatting or image quality?',
    answer: 'Not at all. Vector shapes, embedded fonts, hyperlinks, bookmarks, and high-resolution images are preserved with byte-for-byte fidelity.',
  },
  {
    question: 'Can I reorder individual PDF files before merging?',
    answer: 'Yes. You can drag and drop your uploaded files to reorder them prior to initiating the merge.',
  },
];

export default function MergePdfPage() {
  return (
    <>
      <MergePdf />
      <ToolSeoContent
        toolName="Merge PDF Combiner"
        toolSlug="merge-pdf"
        categoryName="Organize PDF"
        categorySlug="organize-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['split-pdf', 'compress-pdf', 'rearrange-pdf-pages', 'rotate-pdf']}
      />
    </>
  );
}
