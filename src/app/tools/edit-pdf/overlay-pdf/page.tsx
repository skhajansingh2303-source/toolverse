import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import OverlayPdf from './OverlayPdf';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/edit-pdf/overlay-pdf/',
  },
  title: 'PDF Overlay - Stamp Letterhead & Stationery onto PDF Online Free',
  description: 'Overlay or stamp letterhead, stationery, and templates onto your PDF documents easily.',
  keywords: ['pdf overlay', 'letterhead pdf', 'stamp pdf', 'pdf stationery', 'watermark overlay pdf', 'combine pdf letterhead', 'stamp background pdf'],
};

export default function OverlayPdfPage() {
  return (
    <>
      <OverlayPdf />
      <AutoToolSeo slug="overlay-pdf" />
    </>
  );
}
