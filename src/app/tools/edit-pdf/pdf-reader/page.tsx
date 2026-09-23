import AutoToolSeo from '@/components/AutoToolSeo';
import PdfReader from './PdfReader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Reader - Free In-Browser Online PDF Viewer',
  description: 'Read and view PDF documents online with smooth scrolling, thumbnails, zoom, dark mode, and search.',
  keywords: [
    'pdf reader',
    'online pdf viewer',
    'view pdf online',
    'pdf scroll viewer',
    'pdf dark mode reader',
    'in browser pdf reader',
    'pdf search',
    'free pdf reader'
  ],
};

export default function Page() {
  return (
    <>
      <PdfReader />
      <AutoToolSeo slug="pdf-reader" />
    </>
  );
}
