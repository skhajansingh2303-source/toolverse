import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import LoremIpsumGenerator from './LoremIpsumGenerator';

export const metadata: Metadata = {
  title: 'Lorem Ipsum Generator - Generate Placeholder Text Free',
  description: 'Free online Lorem Ipsum generator. Create custom placeholder text by words, sentences, or paragraphs for your design mockups and web projects.',
  keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text', 'lorem ipsum text', 'mockup text'],
};

export default function LoremIpsumPage() {
  return (
    <>
      <LoremIpsumGenerator />
      <AutoToolSeo slug="lorem-ipsum-generator" />
    </>
  );
}
