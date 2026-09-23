import AutoToolSeo from '@/components/AutoToolSeo';
import SignPdf from './SignPdf';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign PDF - Sign PDF Documents Online Free with E-Signature',
  description: 'Upload your PDF and add your electronic signature online for free. Draw or type your signature and place it securely on your PDF pages.',
  keywords: ['sign pdf', 'e-signature', 'sign pdf online', 'draw signature', 'add signature to pdf'],
};

export default function Page() {
  return (
    <>
      <SignPdf />
      <AutoToolSeo slug="sign-pdf" />
    </>
  );
}
