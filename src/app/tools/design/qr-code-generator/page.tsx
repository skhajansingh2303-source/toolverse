import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import QrCodeGenerator from './QrCodeGenerator';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/design/qr-code-generator/',
  },
  title: 'QR Code Generator - Create QR Codes Free Online',
  description: 'Create custom QR codes instantly. Enter text or a URL and download your QR code as a PNG image.',
  keywords: ['qr code generator', 'create qr code', 'free qr code', 'qr code png']
};

export default function Page() {
  return (
    <>
      <QrCodeGenerator />
      <AutoToolSeo slug="qr-code-generator" />
    </>
  );
}
