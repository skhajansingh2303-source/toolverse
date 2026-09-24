import CompressPdf from '../compress-pdf/CompressPdf';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/optimize-pdf/compress-pdf-to-200kb/',
  },
  title: 'Compress PDF to 200KB Online Free - Reduce Under 200 KB | ToolsVerse',
  description: 'Compress PDF to 200KB or less online for free. Maintain high clarity while shrinking file size under 200 KB for job portals, exams, and university submissions. 100% private in-browser.',
  keywords: [
    'compress pdf to 200kb',
    'reduce pdf size to 200kb',
    'compress pdf under 200kb',
    'shrink pdf to 200kb online free',
    'pdf 200kb compressor',
    'compress pdf 200kb without losing quality',
  ],
};

const STEPS = [
  {
    title: 'Upload Your PDF Document',
    description: 'Select or drag your PDF document into the 200KB compressor workspace.',
  },
  {
    title: 'Optimized 200KB Compression',
    description: 'Our engine balances visual image clarity with strict stream compression to guarantee the file stays below 200 KB.',
  },
  {
    title: 'Download Optimized Document',
    description: 'Your lightweight, compliant PDF is ready for immediate submission to online recruitment systems and application portals.',
  },
];

const FAQS = [
  {
    question: 'How can I compress a PDF under 200KB?',
    answer: 'Upload your document to ToolsVerse Compress PDF to 200KB. The tool intelligently optimizes embedded graphics and clears redundant structure trees so your output stays strictly within the 200KB threshold.',
  },
  {
    question: 'Why do application portals require PDFs under 200KB?',
    answer: 'Government recruitment portals, colleges, and visa agencies set a 200KB ceiling to prevent server database overload when handling millions of candidate submissions.',
  },
  {
    question: 'Is this 200KB compressor completely free?',
    answer: 'Yes! Unlike competitors who limit you to 2 conversions or demand credit cards, ToolsVerse offers unlimited free compressions with no watermarks and no daily limits.',
  },
  {
    question: 'Are my confidential documents protected?',
    answer: 'Completely. All compression runs locally inside your browser sandbox via WebAssembly and HTML5 Canvas. No data is ever transmitted to an external server.',
  },
];

export default function Page() {
  return (
    <>
      <CompressPdf
        targetKB={200}
        customTitle="Compress PDF to 200KB"
        customSubtitle="Shrink your PDF document under 200 KB for job portals, university applications, and online submissions. 100% private in-browser."
      />
      <ToolSeoContent
        toolName="Compress PDF to 200KB"
        toolSlug="compress-pdf-to-200kb"
        categoryName="Optimize PDF"
        categorySlug="optimize-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['compress-pdf-to-100kb', 'compress-pdf', 'merge-pdf', 'pdf-to-word']}
      />
    </>
  );
}
