import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import OptimizePdfWeb from './OptimizePdfWeb';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/optimize-pdf/optimize-pdf-web/',
  },
  title: 'Optimize PDF for Web - Linearize and Compress PDF for Fast Web View',
  description: 'Optimize your PDF files for fast web viewing, streaming, and sharing. Reduce file size client-side.',
  keywords: ['optimize pdf web', 'fast web view pdf', 'linearize pdf', 'compress pdf streams', 'clean pdf metadata', 'shrink pdf for web', 'web ready pdf'],
};

export default function OptimizePdfWebPage() {
  return (
    <>
      <OptimizePdfWeb />
      <AutoToolSeo slug="optimize-pdf-web" />
    </>
  );
}
