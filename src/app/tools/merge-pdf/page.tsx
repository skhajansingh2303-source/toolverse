import { Metadata } from 'next';
import MergePdf from './MergePdf';

export const metadata: Metadata = {
  title: 'Merge PDF - Combine PDF Files Online Free',
  description: 'Merge multiple PDF files into one document easily and securely in your browser. Free online PDF merger.',
  keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'pdf merger'],
};

export default function MergePdfPage() {
  return <MergePdf />;
}
