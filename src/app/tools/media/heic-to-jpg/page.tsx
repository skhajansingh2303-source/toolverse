import AutoToolSeo from '@/components/AutoToolSeo';
import HeicToJpg from './HeicToJpg';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/media/heic-to-jpg/',
  },
  title: 'HEIC to JPG Converter - Convert Apple HEIC to JPG Online Free',
  description: 'Convert iPhone HEIC and HEIF photos to high quality JPG or PNG images instantly in your browser.',
  keywords: [
    'heic to jpg',
    'convert heic to jpg',
    'apple heic converter',
    'heif to jpg',
    'iphone photos to jpg',
    'heic to png',
    'batch heic converter',
    'heic converter online',
  ],
};

export default function Page() {
  return (
    <>
      <HeicToJpg />
      <AutoToolSeo slug="heic-to-jpg" />
    </>
  );
}
