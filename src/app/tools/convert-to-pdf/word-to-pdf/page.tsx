import WordToPdf from './WordToPdf';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Word to PDF - Convert Word (.docx) to PDF Online Free',
  description: 'Convert Microsoft Word DOC and DOCX documents into clean, standardized PDF files instantly.',
  keywords: [
    'word to pdf',
    'convert docx to pdf',
    'convert doc to pdf',
    'docx to pdf converter',
    'office to pdf',
    'word to pdf online free',
    'doc to pdf converter',
  ],
};

export default function Page() {
  return <WordToPdf />;
}
