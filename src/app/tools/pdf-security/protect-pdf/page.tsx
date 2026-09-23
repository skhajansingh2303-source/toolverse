import { Metadata } from 'next';
import ProtectPdf from './ProtectPdf';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/pdf-security/protect-pdf/',
  },
  title: 'Protect PDF - Encrypt and Password Protect PDF Online Free',
  description: 'Encrypt your PDF documents with military-grade passwords and AES encryption. Restrict unauthorized opening, printing, and copying. 100% private in-browser.',
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

const STEPS = [
  {
    title: 'Select PDF Document',
    description: 'Choose the confidential PDF file you want to lock and encrypt.',
  },
  {
    title: 'Set Strong Password & Permissions',
    description: 'Enter your password and choose whether to restrict document printing, text copying, or editing.',
  },
  {
    title: 'Download Encrypted PDF',
    description: 'Download your securely locked PDF. Anyone opening the file will be prompted for your password.',
  },
];

const FAQS = [
  {
    question: 'What encryption standard is used to protect my PDF?',
    answer: 'ToolsVerse applies standard AES-128 and AES-256 bit encryption compatible with Adobe Acrobat and all standard PDF readers.',
  },
  {
    question: 'Does ToolsVerse save or know my password?',
    answer: 'Never. Encryption happens entirely within your device browser using client-side cryptographic libraries. Neither your document nor your password is ever sent over the internet.',
  },
  {
    question: 'Can the password protection be bypassed without the password?',
    answer: 'No. AES-encrypted PDFs cannot be opened without entering the correct password.',
  },
];

export default function ProtectPdfPage() {
  return (
    <>
      <ProtectPdf />
      <ToolSeoContent
        toolName="Protect PDF"
        toolSlug="protect-pdf"
        categoryName="PDF Security"
        categorySlug="pdf-security"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['unlock-pdf', 'sign-pdf', 'redact-pdf', 'compress-pdf']}
      />
    </>
  );
}

