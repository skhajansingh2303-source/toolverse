import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import AspectRatioCalculator from './AspectRatioCalculator';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/calculators/aspect-ratio-calculator/',
  },
  title: 'Aspect Ratio Calculator — Image & Video Dimension Ratio Calculator [Free]',
  description: 'Calculate image and video aspect ratios (16:9, 4:3, 1:1, 9:16) and resize dimensions online for free. Ideal for photos, screens, displays, and video resolutions (calculer le ratio d’une image).',
  keywords: [
    'aspect ratio calculator',
    'calculer le ratio d une image',
    'image dimension calculator',
    'calculate aspect ratio',
    'image ratio calculator',
    '16:9 calculator',
    'resize calculator',
    'screen resolution aspect ratio',
  ],
};

export default function Page() {
  return (
    <>
      <AspectRatioCalculator />
      <AutoToolSeo slug="aspect-ratio-calculator" />
    </>
  );
}
