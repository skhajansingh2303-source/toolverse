import { Metadata } from 'next';
import WordEditor from './WordEditor';

export const metadata: Metadata = {
  title: 'Online Word Document Editor - Create & Edit Word Files Free',
  description: 'Full-featured in-browser Word document editor. Open, edit, format typography, and export to DOCX, HTML, or PDF with zero server uploads.',
  keywords: [
    'online word editor',
    'word document editor',
    'edit docx online',
    'free word processor',
    'online docx editor',
    'word to docx'
  ],
};

export default function Page() {
  return <WordEditor />;
}
