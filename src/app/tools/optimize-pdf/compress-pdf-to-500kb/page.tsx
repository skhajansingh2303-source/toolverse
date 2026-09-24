import CompressPdf from '../compress-pdf/CompressPdf';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/optimize-pdf/compress-pdf-to-500kb/',
  },
  title: 'Compress PDF to 500KB Online Free - Reduce Under 500 KB | ToolsVerse',
  description: 'Compress PDF to 500KB or less online for free. Maintain high print-ready quality while shrinking oversized PDF files under 500 KB. 100% private in-browser.',
  keywords: [
    'compress pdf to 500kb',
    'reduce pdf size to 500kb',
    'compress pdf under 500kb',
    'shrink pdf to 500kb online free',
    'pdf 500kb compressor',
    'compress pdf 500kb without losing quality',
  ],
};

const STEPS = [
  {
    title: 'Drop Your Heavy PDF File',
    description: 'Select or drop your large multi-page PDF document into the tool area.',
  },
  {
    title: 'High-Fidelity 500KB Optimization',
    description: 'The engine strips unneeded metadata objects while retaining higher DPI text and graphics under 500 KB.',
  },
  {
    title: 'Download Optimized PDF',
    description: 'Instantly download your reduced PDF file, perfect for email attachments, client presentations, and academic papers.',
  },
];

const FAQS = [
  {
    question: 'How do I compress a large PDF to under 500KB?',
    answer: 'Upload your document to ToolsVerse. Our browser engine recompresses image layers and strips bloated document trees to fit the file within the 500KB limit with minimal visual loss.',
  },
  {
    question: 'Why choose 500KB compression?',
    answer: 'A 500KB target gives the ideal balance between maximum visual clarity for scanned multi-page documents and small file size for swift email delivery.',
  },
  {
    question: 'Are there file size or usage restrictions?',
    answer: 'None at all. ToolsVerse provides 100% free, unlimited compression without any paywalls or daily caps.',
  },
  {
    question: 'Is my data safe?',
    answer: 'Completely private. Compression runs entirely within your device browser using WebAssembly. No files are ever sent to a remote server.',
  },
];

export default function Page() {
  return (
    <>
      <CompressPdf
        targetKB={500}
        customTitle="Compress PDF to 500KB"
        customSubtitle="Reduce large PDF documents under 500 KB while preserving crisp text and graphics. 100% private in-browser."
      />
      <ToolSeoContent
        toolName="Compress PDF to 500KB"
        toolSlug="compress-pdf-to-500kb"
        categoryName="Optimize PDF"
        categorySlug="optimize-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['compress-pdf-to-100kb', 'compress-pdf-to-200kb', 'compress-pdf', 'merge-pdf']}
      />
    </>
  );
}
