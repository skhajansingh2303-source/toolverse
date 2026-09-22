import CompressPdf from './CompressPdf';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compress PDF - Reduce PDF File Size Online Free',
  description: 'Compress PDF files online for free. Reduce PDF file size while maintaining quality with our optimized compression levels.',
  keywords: ['compress pdf', 'reduce pdf size', 'shrink pdf', 'pdf compressor'],
};

export default function Page() {
  return <CompressPdf />;
}
