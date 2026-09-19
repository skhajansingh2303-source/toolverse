import PdfToJpg from './PdfToJpg';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to JPG - Convert PDF Pages to Images Online Free',
  description: 'Convert your PDF documents into high-quality JPG images online for free. Extract individual pages or the entire document.',
  keywords: ['pdf to jpg', 'convert pdf to image', 'pdf to jpeg', 'extract pdf pages', 'pdf converter'],
};

export default function Page() {
  return <PdfToJpg />;
}
