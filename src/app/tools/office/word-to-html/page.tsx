import WordToHtml from './WordToHtml';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Word to HTML - Convert Word (.docx) to HTML Online Free',
  description: 'Convert Microsoft Word DOC and DOCX documents into clean, semantic HTML code instantly.',
  keywords: [
    'word to html',
    'convert docx to html',
    'convert doc to html',
    'docx to html converter',
    'office to html',
    'word to html online free',
  ],
};

export default function Page() {
  return <WordToHtml />;
}
