import PdfToSvg from './PdfToSvg';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to SVG - Convert PDF to Scalable Vector Graphics Online Free',
  description: 'Convert PDF documents into scalable vector SVG graphics for web design, logos, and crisp scaling.',
  keywords: [
    'pdf to svg',
    'convert pdf to svg',
    'pdf vector graphics',
    'pdf to scalable vector',
    'pdf page to svg',
    'vectorize pdf online',
    'pdf svg extractor',
    'free pdf to svg'
  ],
};

export default function Page() {
  return <PdfToSvg />;
}
