import AutoToolSeo from '@/components/AutoToolSeo';
import type { Metadata } from 'next';
import CalorieBmrCalculator from './CalorieBmrCalculator';

export const metadata: Metadata = {
  title: 'Weight, Calorie & BMR Calculator - Daily Calorie Needs',
  description: 'Calculate your Basal Metabolic Rate (BMR) and daily calorie intake for weight loss, maintenance, or muscle gain based on activity level.',
  keywords: ['calorie calculator', 'bmr calculator', 'weight loss calculator', 'daily calories', 'tdee calculator'],
};

export default function Page() {
  return (
    <>
      <CalorieBmrCalculator />
      <AutoToolSeo slug="calorie-bmr-calculator" />
    </>
  );
}
