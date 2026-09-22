import PdfToPowerpoint from './PdfToPowerpoint';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to PowerPoint - Convert PDF to PPTX Presentation Online Free',
  description: 'Convert PDF slides into editable Microsoft PowerPoint (.pptx) presentation decks.',
  keywords: [
    'pdf to powerpoint',
    'convert pdf to pptx',
    'pdf to ppt',
    'pdf slides to powerpoint',
    'pdf to pptx converter',
    'turn pdf into presentation',
    'online presentation converter',
    'pdf to slides',
  ],
};

export default function Page() {
  return <PdfToPowerpoint />;
}
