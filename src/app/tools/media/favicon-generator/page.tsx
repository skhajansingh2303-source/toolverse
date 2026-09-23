import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import FaviconGenerator from './FaviconGenerator';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/media/favicon-generator/',
  },
  title: 'Favicon Generator - Create Multi-Size Favicons Online Free',
  description: 'Generate standard favicons for all devices online. Create 16x16, 32x32, Apple Touch Icons, and Android PWA icons from your logo.',
  keywords: ['favicon generator', 'create favicon', 'apple touch icon', 'android icon generator', 'ico generator'],
};

export default function Page() {
  return (
    <>
      <FaviconGenerator />
      <AutoToolSeo slug="favicon-generator" />
    </>
  );
}
