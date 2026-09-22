import type { Metadata } from 'next';
import ScanToPdf from './ScanToPdf';

export const metadata: Metadata = {
  title: 'Scan to PDF - Scanner Document to PDF Online Free',
  description: 'Use your camera or upload photos to scan documents and convert them to a clean PDF.',
  keywords: ['scan to pdf', 'photo to pdf', 'online document scanner', 'pdf scanner'],
};

export default function Page() {
  return <ScanToPdf />;
}
