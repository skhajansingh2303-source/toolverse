import { Metadata } from 'next';
import WatermarkPdf from './WatermarkPdf';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/edit-pdf/watermark-pdf/',
  },
  title: 'Add Watermark to PDF - PDF Watermark Tool Online Free',
  description: 'Add custom text and image watermarks to your PDF documents easily. Customize font size, color, opacity, rotation, and position. 100% private in-browser.',
  keywords: ['watermark pdf', 'add watermark to pdf', 'pdf watermark tool', 'stamp pdf', 'confidential watermark pdf', 'free pdf watermark'],
};

const STEPS = [
  {
    title: 'Upload your PDF Document',
    description: 'Select the PDF document you want to stamp or brand.',
  },
  {
    title: 'Customize Watermark Text & Position',
    description: 'Type your custom watermark text (e.g., CONFIDENTIAL, DRAFT), set opacity, font size, rotation angle, and placement.',
  },
  {
    title: 'Download Watermarked PDF',
    description: 'Apply the watermark instantly across all pages and download the secured PDF document.',
  },
];

const FAQS = [
  {
    question: 'Can I add watermarks across all pages simultaneously?',
    answer: 'Yes! The watermark is applied across all pages of your PDF document in a single click with uniform position and styling.',
  },
  {
    question: 'Can the watermark be easily erased or removed by unauthorized parties?',
    answer: 'The watermark is rendered directly into the PDF content stream, making it a permanent part of the document layout.',
  },
  {
    question: 'Are my confidential documents uploaded to any remote server?',
    answer: 'No. The stamping process executes 100% locally in your browser memory. Your documents never touch any cloud server.',
  },
];

export default function WatermarkPdfPage() {
  return (
    <>
      <WatermarkPdf />
      <ToolSeoContent
        toolName="Watermark PDF"
        toolSlug="watermark-pdf"
        categoryName="Edit PDF"
        categorySlug="edit-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['edit-pdf', 'protect-pdf', 'sign-pdf', 'number-pdf']}
      />
    </>
  );
}

