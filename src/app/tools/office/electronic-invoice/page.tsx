import ElectronicInvoice from './ElectronicInvoice';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Electronic Invoice (Factur-X / ZUGFeRD) - Create & Validate E-Invoices Online',
  description: 'Create and validate electronic invoices with embedded Factur-X and ZUGFeRD XML compliant with e-invoicing regulations.',
  keywords: [
    'electronic invoice',
    'factur-x generator',
    'zugferd pdf',
    'ubl invoice validator',
    'e-invoicing compliance',
    'pdf a3 electronic invoice',
    'embed invoice xml',
    'en16931 invoice'
  ],
};

export default function Page() {
  return <ElectronicInvoice />;
}
