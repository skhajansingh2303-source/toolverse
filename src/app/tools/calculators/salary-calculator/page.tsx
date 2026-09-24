import SalaryCalculator from './SalaryCalculator';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/calculators/salary-calculator/',
  },
  title: 'Salary Calculator - In-Hand Take Home Pay & Income Tax Calculator',
  description: 'Calculate your exact monthly in-hand take-home salary, income tax (New vs Old Tax Regime), EPF deductions, and annual tax savings. 100% private and accurate.',
  keywords: [
    'salary calculator',
    'in hand salary calculator',
    'take home pay calculator',
    'income tax calculator',
    'ctc to in hand calculator',
    'new tax regime calculator',
    'old vs new tax regime',
    'epf salary calculator',
  ],
};

const STEPS = [
  {
    title: 'Enter Annual CTC or Monthly Pay',
    description: 'Input your total Cost to Company (CTC) or monthly gross compensation amount.',
  },
  {
    title: 'Select Tax Regime',
    description: 'Switch between the New Tax Regime (default with higher rebate) or Old Tax Regime to claim 80C, 80D, and HRA exemptions.',
  },
  {
    title: 'View Instant Pay Slip & Monthly In-Hand Cash',
    description: 'Get an immediate itemized breakdown of your monthly take-home salary, TDS income tax, and retirement savings.',
  },
];

const FAQS = [
  {
    question: 'How is In-Hand (Take-Home) salary calculated from CTC?',
    answer: 'In-Hand Salary is derived by deducting employee statutory contributions from Gross CTC: In-Hand Pay = Gross Salary - (Income Tax / TDS + Employee EPF + Professional Tax + Health Insurance Deductions).',
  },
  {
    question: 'What is the standard deduction in the New Tax Regime?',
    answer: 'For salaried employees, the standard deduction in the latest New Tax Regime has been enhanced to ₹75,000, reducing your taxable gross income before computing tax slabs.',
  },
  {
    question: 'Which regime is better: New Tax Regime or Old Tax Regime?',
    answer: 'The New Tax Regime offers lower tax slab rates and an income tax rebate up to ₹7,75,000 gross with zero tax liability. The Old Tax Regime is typically more beneficial only if you have large deductions exceeding ₹3.5–4 Lakhs across HRA, 80C, 80D, and home loan interest.',
  },
  {
    question: 'How much Provident Fund (EPF) is deducted each month?',
    answer: 'Statutory Employee Provident Fund (EPF) is calculated as 12% of your monthly Basic Salary plus Dearness Allowance, matched equally by your employer towards retirement savings.',
  },
  {
    question: 'Is my salary information uploaded to any server?',
    answer: 'No. ToolsVerse executes 100% in your local web browser. Your financial figures, income, and deductions never leave your device.',
  },
];

export default function Page() {
  return (
    <>
      <SalaryCalculator />
      <ToolSeoContent
        toolName="Salary & Income Tax Calculator"
        toolSlug="salary-calculator"
        categoryName="Calculators"
        categorySlug="calculators"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['sip-calculator', 'compound-interest-calculator', 'gst-calculator', 'loan-calculator']}
      />
    </>
  );
}
