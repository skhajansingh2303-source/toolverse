import CompoundInterestCalculator from './CompoundInterestCalculator';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/calculators/compound-interest-calculator/',
  },
  title: 'Compound Interest Calculator - Daily, Monthly & Annual Growth',
  description: 'Calculate compound interest on your savings, stocks, and investments. Supports daily, monthly, and yearly compounding with recurring contributions. 100% free and private.',
  keywords: [
    'compound interest calculator',
    'investment interest calculator',
    'daily compound interest',
    'monthly compounding calculator',
    'interest on savings calculator',
    'compounding wealth calculator',
  ],
};

const STEPS = [
  {
    title: 'Enter Initial Principal & Monthly Additions',
    description: 'Provide your starting investment balance and any recurring monthly contributions.',
  },
  {
    title: 'Select Rate & Compounding Frequency',
    description: 'Set your expected annual interest rate and pick your compounding interval (Daily, Monthly, Quarterly, or Annually).',
  },
  {
    title: 'Review Compounding Schedule',
    description: 'Inspect your future maturity balance, total earned compound interest, and comprehensive annual accrual schedule.',
  },
];

const FAQS = [
  {
    question: 'What is compound interest and how does it work?',
    answer: 'Compound interest is interest earned on both your initial principal balance and the accumulated interest from previous periods. It creates an exponential snowball effect where your wealth accelerates over time.',
  },
  {
    question: 'What is the compound interest formula?',
    answer: 'The standard compound interest formula is: A = P(1 + r/n)^(nt), where A is final balance, P is initial principal, r is annual interest rate (decimal), n is compounding frequency per year, and t is time in years.',
  },
  {
    question: 'How does compounding frequency impact returns?',
    answer: 'The more frequently interest compounds (e.g. daily vs annually), the faster your balance grows. Daily compounding yields slightly higher effective annual returns than monthly or annual compounding.',
  },
  {
    question: 'What is the Rule of 72 in compounding?',
    answer: 'The Rule of 72 is a quick mental math shortcut: divide 72 by your annual interest rate to find approximately how many years it will take for your money to double (e.g., 72 / 8% = 9 years).',
  },
];

export default function Page() {
  return (
    <>
      <CompoundInterestCalculator />
      <ToolSeoContent
        toolName="Compound Interest Calculator"
        toolSlug="compound-interest-calculator"
        categoryName="Calculators"
        categorySlug="calculators"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['sip-calculator', 'loan-calculator', 'percentage-calculator', 'age-calculator']}
      />
    </>
  );
}
