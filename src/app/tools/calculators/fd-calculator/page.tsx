import FdCalculator from './FdCalculator';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/calculators/fd-calculator/',
  },
  title: 'FD Calculator - Fixed Deposit & RD Maturity Return Calculator',
  description: 'Calculate bank Fixed Deposit (FD) and Recurring Deposit (RD) maturity amount, quarterly interest compounding, and senior citizen bonus returns. 100% free and accurate.',
  keywords: [
    'fd calculator',
    'fixed deposit calculator',
    'rd calculator',
    'recurring deposit calculator',
    'bank fd interest calculator',
    'fixed deposit maturity calculator',
    'post office fd calculator',
    'senior citizen fd rates calculator',
  ],
};

const STEPS = [
  {
    title: 'Choose Deposit Type',
    description: 'Select Fixed Deposit (FD) for a lump sum investment or Recurring Deposit (RD) for disciplined monthly deposits.',
  },
  {
    title: 'Enter Amount, Tenure & Interest Rate',
    description: 'Provide your deposit value, tenure in years/months, and bank annual interest rate. Toggle senior citizen for 0.50% extra interest.',
  },
  {
    title: 'Check Maturity Value & Compounding Schedule',
    description: 'Inspect total maturity payout, guaranteed interest earned, effective annual yield, and the yearly growth schedule.',
  },
];

const FAQS = [
  {
    question: 'How is Fixed Deposit (FD) interest calculated?',
    answer: 'Most banks compound FD interest quarterly. The standard compounding formula used is: A = P × (1 + r / n)^(n × t), where A is maturity amount, P is principal, r is annual interest rate, n is compounding frequency (4 for quarterly), and t is tenure in years.',
  },
  {
    question: 'What is the difference between FD and RD?',
    answer: 'In a Fixed Deposit (FD), you invest a lump sum amount once for a fixed tenure. In a Recurring Deposit (RD), you deposit a fixed monthly installment every month over the chosen period.',
  },
  {
    question: 'Do Senior Citizens get higher FD interest rates?',
    answer: 'Yes! Most public and private banks offer an additional 0.50% (50 basis points) higher interest rate to senior citizens (aged 60 and above) across almost all tenures.',
  },
  {
    question: 'Are bank Fixed Deposits safe and guaranteed?',
    answer: 'Yes, Fixed Deposits offer guaranteed returns unaffected by stock market fluctuations. Furthermore, deposits in scheduled banks are insured up to statutory deposit insurance limits (e.g. up to ₹5 Lakhs by DICGC in India, or $250,000 by FDIC in the USA).',
  },
  {
    question: 'What is effective annual yield?',
    answer: 'Because of quarterly compounding, the effective annual yield earned on an FD is slightly higher than the stated nominal interest rate.',
  },
];

export default function Page() {
  return (
    <>
      <FdCalculator />
      <ToolSeoContent
        toolName="Fixed Deposit & RD Calculator"
        toolSlug="fd-calculator"
        categoryName="Calculators"
        categorySlug="calculators"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['sip-calculator', 'compound-interest-calculator', 'salary-calculator', 'loan-calculator']}
      />
    </>
  );
}
