import PdfToWord from './PdfToWord';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to Word - Convert PDF to Word (.docx) Online Free',
  description: 'Convert PDF documents into editable Microsoft Word (.docx) documents with layout and paragraph preservation.',
  keywords: [
    'pdf to word',
    'convert pdf to docx',
    'pdf to word converter',
    'pdf to docx online free',
    'editable word document',
    'extract word from pdf',
    'pdf to doc',
  ],
};

export default function Page() {
  return <PdfToWord />;
}
