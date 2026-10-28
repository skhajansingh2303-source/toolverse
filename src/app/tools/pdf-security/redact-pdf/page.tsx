import AutoToolSeo from '@/components/AutoToolSeo';
import type { Metadata } from 'next';
import RedactPdf from './RedactPdf';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/pdf-security/redact-pdf/',
  },
  title: 'Redact PDF Online Free — Blackout & Mask Sensitive Text in PDF',
  description: 'Permanently redact and blackout sensitive text, SSNs, numbers, and private info in PDF documents online for free. 100% private in-browser with zero server uploads.',
  keywords: [
    'redact pdf online free',
    'redact pdf online for free',
    'blackout pdf online',
    'blackout text pdf',
    'mask document online',
    'hide sensitive info pdf',
    'pdf redactor online',
    'permanently censor pdf',
  ],
};

export default function Page() {
  return (
    <>
      <RedactPdf />
      <AutoToolSeo slug="redact-pdf" />
    </>
  );
}
