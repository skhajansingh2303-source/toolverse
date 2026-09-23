import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import WordCounter from './WordCounter';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/text/word-counter/',
  },
  title: 'Word Counter - Count Words, Characters & Reading Time',
  description: 'Free online word counter and character counter. Calculate reading time, speaking time, sentences, and paragraphs in real-time.',
  keywords: ['word counter', 'character counter', 'reading time calculator', 'text stats']
};

export default function Page() {
  return (
    <>
      <WordCounter />
      <AutoToolSeo slug="word-counter" />
    </>
  );
}
