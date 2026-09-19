import type { Metadata } from 'next';
import GpaCalculator from './GpaCalculator';

export const metadata: Metadata = {
  title: 'GPA Calculator - College & High School Grade Calculator Online Free',
  description: 'Calculate your cumulative GPA for high school or college. Track grades, credits, and honors distinction easily.',
  keywords: ['gpa calculator', 'grade calculator', 'college gpa', 'high school gpa tracker'],
};

export default function Page() {
  return <GpaCalculator />;
}
