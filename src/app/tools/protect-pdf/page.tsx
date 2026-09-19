import { Metadata } from 'next';
import ProtectPdf from './ProtectPdf';

export const metadata: Metadata = {
  title: 'Protect PDF - Encrypt and Password Protect PDF Online Free',
  description: 'Protect your PDF documents with passwords and encryption. Restrict unauthorized access securely.',
  keywords: [
    'protect pdf',
    'password protect pdf',
    'encrypt pdf',
    'lock pdf',
    'secure pdf online',
    'pdf permissions',
    'restrict pdf printing',
  ],
};

export default function ProtectPdfPage() {
  return <ProtectPdf />;
}
