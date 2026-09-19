import TextToPdf from './TextToPdf';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text to PDF Converter - Convert Notes & Text to PDF Online Free',
  description: 'Convert your text, notes, essays, and assignments into a clean, formatted PDF document online for free.',
  keywords: ['text to pdf', 'convert text to pdf', 'txt to pdf', 'create pdf from text'],
};

export default function Page() {
  return <TextToPdf />;
}
