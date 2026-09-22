import { Metadata } from 'next';
import RotatePdf from './RotatePdf';

export const metadata: Metadata = {
  title: 'Rotate PDF - Rotate PDF Pages Online Free',
  description: 'Rotate specific or all pages of a PDF document permanently. Free online PDF rotator.',
  keywords: ['rotate pdf', 'rotate pdf pages', 'pdf rotator', 'turn pdf pages'],
};

export default function RotatePdfPage() {
  return <RotatePdf />;
}
