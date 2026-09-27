import AutoToolSeo from '@/components/AutoToolSeo';
import SignPdf from './SignPdf';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/pdf-security/sign-pdf/',
  },
  title: 'Sign PDF - Sign PDF Documents Online Free with E-Signature',
  description: 'Upload your PDF and add your electronic signature online for free. Draw, type, or upload your signature, then drag it to the exact position on any page — live preview included.',
  keywords: ['sign pdf', 'e-signature', 'sign pdf online', 'draw signature', 'add signature to pdf', 'place signature on pdf', 'drag signature pdf'],
};

export default function Page() {
  return (
    <>
      <SignPdf />
      <AutoToolSeo slug="sign-pdf" />
    </>
  );
}
