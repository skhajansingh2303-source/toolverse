import { Metadata } from 'next';
import UnlockPdf from './UnlockPdf';

export const metadata: Metadata = {
  title: 'Unlock PDF - Remove PDF Password & Restrictions Online Free',
  description: 'Unlock password-protected PDF files and remove document printing and copying restrictions.',
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

export default function UnlockPdfPage() {
  return <UnlockPdf />;
}
