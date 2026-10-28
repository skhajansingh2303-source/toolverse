import AutoToolSeo from '@/components/AutoToolSeo';
import type { Metadata } from 'next';
import GpaCalculator from './GpaCalculator';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/calculators/gpa-calculator/',
  },
  title: 'GPA Calculator (4.0 Scale) — College & High School Grade Calculator Online Free',
  description: 'Free online GPA calculator for college and high school. Calculate 4.0 scale semester and cumulative GPA, weighted grades, credits, and honors distinctions instantly.',
  keywords: [
    'gpa calculator',
    'gpa calculator online',
    'college gpa calculator',
    'gpa generator college',
    'grade calculator',
    'high school gpa tracker',
    'gpa converter online',
    'cumulative gpa calculator',
    'weighted gpa calculator 4.0',
  ],
};

export default function Page() {
  return (
    <>
      <GpaCalculator />
      <AutoToolSeo slug="gpa-calculator" />
    </>
  );
}
