import type { Metadata } from 'next';
import AgeCalculator from './AgeCalculator';

export const metadata: Metadata = {
  title: 'Age Calculator - Calculate Exact Age in Years, Months & Days',
  description: 'Free online age calculator. Calculate your exact age from date of birth down to days, hours, and minutes with next birthday countdown.',
  keywords: ['age calculator', 'calculate age', 'date of birth calculator', 'how old am i', 'birthday countdown'],
};

export default function Page() {
  return <AgeCalculator />;
}
