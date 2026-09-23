import AutoToolSeo from '@/components/AutoToolSeo';
import type { Metadata } from 'next';
import CropPdf from './CropPdf';

export const metadata: Metadata = {
  title: 'Crop PDF - Trim and Crop PDF Pages Online Free',
  description: 'Easily crop and trim your PDF pages. Remove margins and adjust dimensions securely in your browser.',
  keywords: ['crop pdf', 'trim pdf', 'remove pdf margins', 'pdf cropper'],
};

export default function Page() {
  return (
    <>
      <CropPdf />
      <AutoToolSeo slug="crop-pdf" />
    </>
  );
}
