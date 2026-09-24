import CompressPdf from '../compress-pdf/CompressPdf';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/optimize-pdf/compress-pdf-to-100kb/',
  },
  title: 'Compress PDF to 100KB Online Free - Reduce Under 100 KB | ToolsVerse',
  description: 'Compress PDF to 100KB or less online for free. Guaranteed file size reduction under 100 KB for government job portals, university admissions, and online forms. 100% private in-browser with zero uploads.',
  keywords: [
    'compress pdf to 100kb',
    'reduce pdf size to 100kb',
    'compress pdf under 100kb',
    'shrink pdf to 100kb online free',
    'pdf 100kb compressor',
    'compress pdf to 100kb online without losing quality',
  ],
};

const STEPS = [
  {
    title: 'Select or Drop Your PDF',
    description: 'Upload your PDF document requiring compression below 100KB.',
  },
  {
    title: 'Automated 100KB Calibration',
    description: 'The engine automatically optimizes resolution, removes bloated metadata, and recompresses stream buffers to target under 100 KB.',
  },
  {
    title: 'Download Portal-Ready PDF',
    description: 'Instantly download your lightweight PDF, ready for immediate upload to government portals, visa forms, and academic applications.',
  },
];

const FAQS = [
  {
    question: 'How do I compress a PDF file to less than 100KB?',
    answer: 'Simply upload your PDF to ToolsVerse. Our client-side optimizer calibrates page DPI and image streams to compress the document under 100KB while keeping text crisp and fully readable.',
  },
  {
    question: 'Is this suitable for government and job portal uploads?',
    answer: 'Yes! Most public portals (UPSC, SSC, State PSCs, DMV, immigration, and visa portals) enforce a strict 100KB or 200KB upload limit. ToolsVerse optimizes specifically for these compliance specifications.',
  },
  {
    question: 'Will text clarity be affected under 100KB?',
    answer: 'No. Vector fonts, signatures, and document layouts remain sharp. The compression engine aggressively removes duplicate color profiles, redundant embedded metadata, and downsamples heavy background raster images.',
  },
  {
    question: 'Are my sensitive documents uploaded to any remote server?',
    answer: 'Never. Unlike iLovePDF or Smallpdf, ToolsVerse runs 100% client-side in your local browser sandbox. Your confidential certificates, transcripts, and tax returns never leave your device.',
  },
];

export default function Page() {
  return (
    <>
      <CompressPdf
        targetKB={100}
        customTitle="Compress PDF to 100KB"
        customSubtitle="Easily shrink your PDF under 100 KB for government portals, job applications, and strict email limits. 100% private in-browser."
      />
      <ToolSeoContent
        toolName="Compress PDF to 100KB"
        toolSlug="compress-pdf-to-100kb"
        categoryName="Optimize PDF"
        categorySlug="optimize-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['compress-pdf-to-200kb', 'compress-pdf', 'merge-pdf', 'pdf-to-jpg']}
      />
    </>
  );
}
