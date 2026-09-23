import { Metadata } from 'next';
import UnlockPdf from './UnlockPdf';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/pdf-security/unlock-pdf/',
  },
  title: 'Unlock PDF - Remove PDF Password & Restrictions Online Free',
  description: 'Unlock password-protected PDF files and remove document printing, copying, and editing restrictions permanently. 100% private in-browser.',
  keywords: [
    'unlock pdf',
    'remove pdf password',
    'pdf password remover',
    'decrypt pdf',
    'unlock protected pdf',
    'remove pdf restrictions',
    'pdf decrypter',
  ],
};

const STEPS = [
  {
    title: 'Select Locked PDF',
    description: 'Upload your password-protected PDF file from your device.',
  },
  {
    title: 'Enter Correct Password',
    description: 'Provide the document password to authenticate decryption and strip restrictions.',
  },
  {
    title: 'Download Unrestricted PDF',
    description: 'Save your unlocked PDF file. It can now be opened, printed, and edited without any future passwords.',
  },
];

const FAQS = [
  {
    question: 'Can ToolsVerse remove printing and copying restrictions?',
    answer: 'Yes! Once unlocked, all permissions are restored so you can freely print, annotate, copy text, and modify your PDF.',
  },
  {
    question: 'Are my private files or passwords stored anywhere?',
    answer: 'No. The entire decryption process takes place in your browser session using WebAssembly. No files or passwords are ever logged or uploaded.',
  },
  {
    question: 'Can I unlock a PDF if I forgot the owner password?',
    answer: 'For strongly encrypted user passwords, modern AES cryptography requires the correct passphrase to decrypt document content.',
  },
];

export default function UnlockPdfPage() {
  return (
    <>
      <UnlockPdf />
      <ToolSeoContent
        toolName="Unlock PDF"
        toolSlug="unlock-pdf"
        categoryName="PDF Security"
        categorySlug="pdf-security"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['protect-pdf', 'sign-pdf', 'edit-pdf', 'compress-pdf']}
      />
    </>
  );
}

