import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import EditPdf from './EditPdf';

export const metadata: Metadata = {
  title: 'Edit PDF - Free Online PDF Editor',
  description: 'Edit PDF files online for free. Add text, shapes, signatures, and annotations directly to your PDF documents.',
  keywords: [
    'edit pdf',
    'online pdf editor',
    'pdf annotator',
    'add text to pdf',
    'draw on pdf',
    'pdf editor free',
    'annotate pdf',
  ],
};

export default function EditPdfPage() {
  return (
    <>
      <EditPdf />
      <AutoToolSeo slug="edit-pdf" />
    </>
  );
}
