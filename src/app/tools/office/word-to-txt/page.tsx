import AutoToolSeo from '@/components/AutoToolSeo';
import WordToTxt from './WordToTxt';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/office/word-to-txt/',
  },
  title: 'Word to TXT - Convert Word (.docx) to Plain Text Online',
  description: 'Convert Microsoft Word DOC and DOCX documents into raw, plain text files instantly.',
  keywords: [
    'word to txt',
    'convert docx to txt',
    'convert doc to txt',
    'docx to txt converter',
    'word to text',
    'word to plain text',
  ],
};

export default function Page() {
  return (
    <>
      <WordToTxt />
      <AutoToolSeo slug="word-to-txt" />
    </>
  );
}
