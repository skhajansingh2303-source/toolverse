import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import FlattenPdf from './FlattenPdf';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/optimize-pdf/flatten-pdf/',
  },
  title: 'Flatten PDF - Lock Form Fields & Make PDF Read-Only Online Free',
  description: 'Flatten PDF forms, annotations, and electronic signatures into static read-only content. Prevent tampering and changes with 100% private in-browser processing.',
  keywords: ['flatten pdf', 'lock pdf form', 'make pdf read only', 'freeze pdf form', 'pdf24 flatten pdf'],
};

export default function Page() {
  return (
    <>
      <FlattenPdf />
      <AutoToolSeo slug="flatten-pdf" />
    </>
  );
}
