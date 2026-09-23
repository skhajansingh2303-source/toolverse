import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import InvoiceGenerator from './InvoiceGenerator';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/office/create-invoice/',
  },
  title: 'Invoice Generator - Create Professional PDF Invoices Online Free',
  description: 'Generate beautiful, professional PDF invoices and receipts online instantly. Add line items, taxes, currency, and download PDF for free with zero signup.',
  keywords: ['invoice generator', 'create invoice pdf', 'online invoice maker', 'free receipt generator', 'pdf24 create invoice'],
};

export default function Page() {
  return (
    <>
      <InvoiceGenerator />
      <AutoToolSeo slug="create-invoice" />
    </>
  );
}
