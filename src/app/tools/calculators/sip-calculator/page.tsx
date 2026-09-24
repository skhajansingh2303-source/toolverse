import SipCalculator from './SipCalculator';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/calculators/sip-calculator/',
  },
  title: 'SIP Calculator - Mutual Fund SIP Return & Maturity Wealth Calculator',
  description: 'Calculate monthly SIP and mutual fund returns, total investment growth, and compounding wealth accumulation with inflation adjustments. 100% free and private.',
  keywords: [
    'sip calculator',
    'mutual fund calculator',
    'sip return calculator',
    'systematic investment plan calculator',
    'sip interest calculator',
    'lumpsum vs sip calculator',
  ],
};

const STEPS = [
  {
    title: 'Choose Investment Mode',
    description: 'Select Monthly SIP for disciplined periodic investing or Lumpsum for one-time capital growth.',
  },
  {
    title: 'Enter Amount & Expected Return',
    description: 'Adjust the monthly contribution slider and set your expected annual CAGR return percentage.',
  },
  {
    title: 'View Wealth Growth & Compounding Schedule',
    description: 'Inspect your total invested amount, projected wealth gains, and full annual compounding breakdown.',
  },
];

const FAQS = [
  {
    question: 'What is a Systematic Investment Plan (SIP)?',
    answer: 'A Systematic Investment Plan (SIP) allows investors to invest a fixed sum of money periodically (typically monthly) into mutual funds, dollar-cost averaging market volatility and harnessing compounding growth.',
  },
  {
    question: 'What formula is used to calculate SIP returns?',
    answer: 'The SIP return formula is: M = P × ({[1 + i]^n – 1} / i) × (1 + i), where M is maturity amount, P is monthly investment, i is periodic interest rate (annual rate / 12), and n is total number of monthly payments.',
  },
  {
    question: 'What is the difference between SIP and Lumpsum?',
    answer: 'A SIP divides your investment across monthly installments to average market peaks and valleys (Rupee/Dollar Cost Averaging). A Lumpsum deposits the entire principal upfront at the current market valuation.',
  },
  {
    question: 'What is a realistic expected return rate for equity mutual funds?',
    answer: 'Historically, broad-market index funds and diversified equity mutual funds have yielded between 11% and 15% annualized returns over long 7–15 year horizons.',
  },
  {
    question: 'How does inflation affect my future SIP wealth?',
    answer: 'Inflation decreases purchasing power over time. Using our Inflation Adjuster toggle, you can see what your future corpus will actually be worth in terms of today’s living costs.',
  },
];

export default function Page() {
  return (
    <>
      <SipCalculator />
      <ToolSeoContent
        toolName="SIP Calculator"
        toolSlug="sip-calculator"
        categoryName="Calculators"
        categorySlug="calculators"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['loan-calculator', 'percentage-calculator', 'age-calculator', 'bmi-calculator']}
      />
    </>
  );
}
