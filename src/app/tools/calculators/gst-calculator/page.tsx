import GstCalculator from './GstCalculator';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/calculators/gst-calculator/',
  },
  title: 'GST Calculator Online - Add or Remove GST, CGST, SGST & IGST',
  description: 'Calculate GST online for free. Add or remove GST from base prices with 5%, 12%, 18%, and 28% slabs. Includes CGST, SGST, and IGST tax invoice breakdowns.',
  keywords: [
    'gst calculator',
    'goods and services tax calculator',
    'reverse gst calculator',
    'remove gst calculator',
    'cgst sgst calculator',
    'online gst calculation',
  ],
};

const STEPS = [
  {
    title: 'Select Calculation Mode',
    description: 'Choose "+ Add GST" to calculate tax from a base amount, or "- Remove GST" to reverse-calculate the pre-tax cost from an inclusive bill.',
  },
  {
    title: 'Enter Amount & Select GST Rate Slab',
    description: 'Type your transaction value and click standard slabs (5%, 12%, 18%, 28%) or type a custom percentage.',
  },
  {
    title: 'Review Full Tax Invoice Breakdown',
    description: 'View the net price, exact tax amount, CGST + SGST or IGST splits, and the total gross invoice value.',
  },
];

const FAQS = [
  {
    question: 'How do I add GST to an amount?',
    answer: 'To add GST: GST Amount = (Base Amount × GST Rate) / 100. Total Price = Base Amount + GST Amount. For example, ₹1,000 at 18% GST adds ₹180 for a total of ₹1,180.',
  },
  {
    question: 'How do I remove GST from an inclusive price (Reverse GST)?',
    answer: 'To remove GST from an inclusive total: Base Amount = (Total Price × 100) / (100 + GST Rate). GST Amount = Total Price – Base Amount. For example, removing 18% GST from ₹1,180 yields exactly ₹1,000 base and ₹180 tax.',
  },
  {
    question: 'What is the difference between CGST, SGST, and IGST?',
    answer: 'For intra-state sales within the same state, GST is split equally into Central GST (CGST) and State GST (SGST). For inter-state sales across state borders, Integrated GST (IGST) is levied in full.',
  },
  {
    question: 'What are the official GST rate slabs?',
    answer: 'Standard GST slabs are 0% (essential foods), 5% (packaged foods, rail tickets), 12% (business class air travel, processed food), 18% (IT software, financial services, standard goods), and 28% (automobiles, luxury goods).',
  },
];

export default function Page() {
  return (
    <>
      <GstCalculator />
      <ToolSeoContent
        toolName="GST Calculator"
        toolSlug="gst-calculator"
        categoryName="Calculators"
        categorySlug="calculators"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['loan-calculator', 'percentage-calculator', 'create-invoice', 'electronic-invoice']}
      />
    </>
  );
}
