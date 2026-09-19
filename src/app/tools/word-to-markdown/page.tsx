import WordToMarkdown from './WordToMarkdown';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Word to Markdown - Convert Word (.docx) to MD Online',
  description: 'Convert Microsoft Word DOC and DOCX documents into clean Markdown (.md) format instantly.',
  keywords: [
    'word to markdown',
    'convert docx to md',
    'convert doc to md',
    'docx to markdown converter',
    'word to md',
  ],
};

export default function Page() {
  return <WordToMarkdown />;
}
