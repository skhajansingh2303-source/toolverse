import type { Metadata } from 'next';
import LoanCalculator from './LoanCalculator';

export const metadata: Metadata = {
  title: 'Loan & Mortgage EMI Calculator - Monthly Payments & Amortization',
  description: 'Calculate monthly loan EMI payments, total interest payable, and full yearly amortization schedules for mortgages and auto loans.',
  keywords: ['loan calculator', 'mortgage calculator', 'emi calculator', 'amortization schedule', 'monthly payment calculator'],
};

export default function Page() {
  return <LoanCalculator />;
}
