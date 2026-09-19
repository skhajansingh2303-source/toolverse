import { Metadata } from 'next';
import WatermarkPdf from './WatermarkPdf';

export const metadata: Metadata = {
  title: 'Add Watermark to PDF - PDF Watermark Tool Online Free',
  description: 'Add text watermarks to your PDF documents easily. Customize font size, color, opacity, and position. Free online tool.',
  keywords: ['watermark pdf', 'add watermark to pdf', 'pdf watermark tool', 'stamp pdf'],
};

export default function WatermarkPdfPage() {
  return <WatermarkPdf />;
}
