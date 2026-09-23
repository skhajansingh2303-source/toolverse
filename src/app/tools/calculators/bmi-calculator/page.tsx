import AutoToolSeo from '@/components/AutoToolSeo';
import type { Metadata } from 'next';
import BmiCalculator from './BmiCalculator';

export const metadata: Metadata = {
  title: 'BMI Calculator - Body Mass Index & Healthy Weight Calculator',
  description: 'Free online BMI calculator. Calculate your Body Mass Index (BMI) in metric or imperial units with health classification and ideal weight range.',
  keywords: ['bmi calculator', 'body mass index', 'weight calculator', 'ideal weight', 'healthy weight range'],
};

export default function Page() {
  return (
    <>
      <BmiCalculator />
      <AutoToolSeo slug="bmi-calculator" />
    </>
  );
}
