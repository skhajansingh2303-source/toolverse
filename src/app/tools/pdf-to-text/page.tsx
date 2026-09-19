import PdfToText from './PdfToText';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to Text - Extract Text from PDF Online Free',
  description: 'Easily extract plain text from your PDF documents. Copy or download the extracted text instantly with our free online tool.',
  keywords: ['pdf to text', 'extract text from pdf', 'pdf text extractor', 'convert pdf to txt'],
};

export default function Page() {
  return <PdfToText />;
}
