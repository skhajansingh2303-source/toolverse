import AutoToolSeo from '@/components/AutoToolSeo';
import type { Metadata } from 'next';
import PercentageCalculator from './PercentageCalculator';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/calculators/percentage-calculator/',
  },
  title: 'Percentage Calculator - Calculate % Increase, Decrease & Discounts',
  description: 'Free online percentage calculator. What is X% of Y, percentage difference, markup, and discount calculation.',
  keywords: ['percentage calculator', 'percent of', 'percentage change', 'discount calculator', 'percent increase'],
};

export default function Page() {
  return (
    <>
      <PercentageCalculator />
      <AutoToolSeo slug="percentage-calculator" />
    </>
  );
}
