import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import AspectRatioCalculator from './AspectRatioCalculator';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/calculators/aspect-ratio-calculator/',
  },
  title: 'Aspect Ratio Calculator - Calculate Dimensions & Ratios Online Free',
  description: 'Calculate aspect ratios and resize dimensions online. Free aspect ratio calculator for video, image, and screen resolutions.',
  keywords: ['aspect ratio calculator', 'image dimension calculator', 'calculate aspect ratio', '16:9 calculator', 'resize calculator'],
};

export default function Page() {
  return (
    <>
      <AspectRatioCalculator />
      <AutoToolSeo slug="aspect-ratio-calculator" />
    </>
  );
}
