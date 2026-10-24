import AutoToolSeo from '@/components/AutoToolSeo';
import SignPdf from './SignPdf';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/pdf-security/sign-pdf/',
  },
  title: 'Sign PDF Online Free — Place, Resize & Rotate E-Signature',
  description: 'Upload your PDF and add your electronic signature online for free. Draw, type, or upload your signature, drag to any page, rotate to any angle, and resize with live visual preview. 100% private in-browser signature tool.',
  keywords: [
    'sign pdf',
    'e-signature',
    'sign pdf online',
    'rotate signature',
    'rotate signature in pdf',
    'rotate signature online',
    'draw signature',
    'type signature',
    'upload signature to pdf',
    'add signature to pdf',
    'place signature on pdf',
    'drag signature pdf',
    'fill and sign pdf',
    'digital signature pdf',
    'electronic signature online free',
    'docusign free alternative',
    'ilovepdf sign alternative',
    'smallpdf sign free',
    'sign contract online free',
    'pdf signature maker',
    'free pdf signer',
    'sign agreement online',
    'firmar pdf gratis',
    'assinador de pdf',
    'signer un pdf en ligne',
    'unterschreiben pdf online',
    '#signpdf',
    '#esignature',
    '#rotatesignature',
    '#digitalsignature',
    '#freepdfsigner'
  ],
  openGraph: {
    title: 'Sign PDF Online Free — Place, Resize & Rotate E-Signature',
    description: 'Add legal electronic signatures to PDF files online for free. Draw, type, or upload, then place, resize, and rotate your signature on any page. 100% private in-browser tool.',
    url: 'https://toolsverseapp.com/tools/pdf-security/sign-pdf/',
    siteName: 'ToolsVerse',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign PDF Online Free — Place, Resize & Rotate E-Signature',
    description: 'Free online tool to add, place, and rotate your electronic signature on any PDF page with live preview. Zero server uploads.',
  },
};

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ToolsVerse Sign PDF with Signature Rotation',
    operatingSystem: 'All (Web Browser, iOS, Android, Windows, macOS, Linux)',
    applicationCategory: 'BusinessApplication',
    url: 'https://toolsverseapp.com/tools/pdf-security/sign-pdf/',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1540',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      'Draw signature with mouse or touch screen',
      'Type signature in cursive typography',
      'Upload signature PNG with transparent background',
      'Drag and reposition signature anywhere on any page',
      'Rotate signature 0 to 360 degrees with interactive rotate handle',
      'One-click 90-degree and 15-degree signature rotation presets',
      'Multi-page navigation and live rendering preview',
      '100% Client-Side Privacy — zero cloud uploads',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SignPdf />
      <AutoToolSeo slug="sign-pdf" />
    </>
  );
}
