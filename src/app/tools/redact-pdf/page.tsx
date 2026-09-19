import type { Metadata } from 'next';
import RedactPdf from './RedactPdf';

export const metadata: Metadata = {
  title: 'Redact PDF - Blackout Sensitive Info on PDF Online Free',
  description: 'Easily redact sensitive information from your PDF files. Blackout text and areas securely in your browser.',
  keywords: ['redact pdf', 'blackout pdf', 'hide sensitive info pdf', 'pdf redactor'],
};

export default function Page() {
  return <RedactPdf />;
}
