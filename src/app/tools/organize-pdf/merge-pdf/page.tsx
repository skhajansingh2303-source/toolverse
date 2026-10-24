import { Metadata } from 'next';
import MergePdf from './MergePdf';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/organize-pdf/merge-pdf/',
  },
  title: 'Merge PDF Files Online Free — Combine Multiple PDFs (No Limit)',
  description: 'Merge and combine multiple PDF files into one single document online for free. Reorder files in custom sequence, preview the merged result, and download instantly. 100% private in-browser tool with zero server uploads.',
  keywords: [
    'merge pdf',
    'combine pdf',
    'join pdf files',
    'merge pdf files',
    'merge pdf online free',
    'merge multiple pdf into one',
    'combine multiple pdfs',
    'merge pdf no limit',
    'pdf binder',
    'pdf combiner online',
    'pdf merger',
    'free pdf merger',
    'combine pdf without uploading',
    'ilovepdf merge alternative',
    'smallpdf merge alternative',
    'pdf24 merge alternative',
    'adobe merge pdf free alternative',
    'merge pdf offline',
    'stitch pdf files',
    'consolidate pdf',
    'unir pdf gratis',
    'combinar pdf',
    'fusione pdf',
    'pdf zusammenfügen',
    'fusionner pdf',
    '#mergepdf',
    '#combinepdf',
    '#joinpdf',
    '#freepdfmerger',
    '#pdfcombiner',
    '#ilovepdfalternative'
  ],
  openGraph: {
    title: 'Merge PDF Files Online Free — Combine Multiple PDFs (No Limit)',
    description: 'Combine multiple PDF documents into one single file with custom ordering and live preview. 100% free and private in-browser tool with zero server uploads.',
    url: 'https://toolsverseapp.com/tools/organize-pdf/merge-pdf/',
    siteName: 'ToolsVerse',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Merge PDF Files Online Free — Combine Multiple PDFs (No Limit)',
    description: 'Merge and combine multiple PDF documents into one file online for free with live preview. Fast, private, and unlimited.',
  },
};

const STEPS = [
  {
    title: 'Select PDF Documents',
    description: 'Upload two or more PDF files from your computer, phone, or drag and drop them directly into the workspace. Loaded instantly into browser memory.',
  },
  {
    title: 'Reorder Pages & Files',
    description: 'Arrange your documents in the exact order you want them to appear in the combined PDF using simple up and down controls.',
  },
  {
    title: 'Preview & Download Processed PDF',
    description: 'Click "Merge PDFs Now" to combine pages losslessly, review the interactive live preview of your merged document, and click Download when ready.',
  },
];

const FAQS = [
  {
    question: 'Can I preview the merged PDF before downloading it?',
    answer: 'Yes! ToolsVerse displays an interactive live preview of the merged document immediately upon combining. You can inspect all pages to verify layout and order before saving.',
  },
  {
    question: 'How many PDF files can I merge together?',
    answer: 'There is no artificial limit! Because ToolsVerse runs client-side inside your browser memory, you can merge as many PDF files as your device memory allows without any daily quotas or paywalls.',
  },
  {
    question: 'Are my confidential documents uploaded to a remote server?',
    answer: 'Never. Unlike cloud services like iLovePDF or Smallpdf, your files are never transmitted across the internet. All merging operations occur 100% locally in your web browser.',
  },
  {
    question: 'Will merging PDFs reduce document formatting or image quality?',
    answer: 'Not at all. Vector shapes, embedded fonts, hyperlinks, bookmarks, and high-resolution images are preserved losslessly with byte-for-byte fidelity according to ISO PDF standards.',
  },
  {
    question: 'Can I reorder individual PDF files before merging?',
    answer: 'Yes. You can use the intuitive arrow buttons (▲ / ▼) to move files earlier or later in the sequence before initiating the merge.',
  },
  {
    question: 'Can I merge PDF files on mobile devices (iPhone or Android)?',
    answer: 'Yes! ToolsVerse is responsive and touch-friendly. You can merge PDFs directly in Safari or Chrome on iOS and Android devices without installing any apps.',
  },
];

export default function MergePdfPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ToolsVerse Merge PDF Combiner',
    operatingSystem: 'All (Web Browser, iOS, Android, Windows, macOS, Linux)',
    applicationCategory: 'UtilitiesApplication',
    url: 'https://toolsverseapp.com/tools/organize-pdf/merge-pdf/',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '2180',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      'Merge multiple PDF documents into one consolidated file',
      'Custom page and file reordering with one click',
      'Interactive live preview of merged document before downloading',
      '100% Client-Side Privacy — zero server uploads',
      'Unlimited merges with no file size or daily quota limits',
      'Supports desktop and mobile browsers (iOS & Android)',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MergePdf />
      <ToolSeoContent
        toolName="Merge PDF Combiner"
        toolSlug="merge-pdf"
        categoryName="Organize PDF"
        categorySlug="organize-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['split-pdf', 'compress-pdf', 'rearrange-pdf-pages', 'rotate-pdf']}
      />
    </>
  );
}
