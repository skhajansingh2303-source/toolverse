import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import FillPdfForm from './FillPdfForm';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/pdf-security/fill-pdf-form/',
  },
  title: 'Fill Out PDF Form - Fill Interactive PDF Forms Online Free',
  description: 'Fill out interactive PDF forms, text fields, checkboxes, and dropdowns easily in your browser with 100% privacy and zero file uploads to servers.',
  keywords: [
    'fill pdf form',
    'fill out pdf online',
    'interactive pdf form filler',
    'complete pdf form',
    'fill pdf text fields',
    'pdf form editor free',
    'acroform filler',
  ],
};

export default function Page() {
  return (
    <>
      <FillPdfForm />
      <AutoToolSeo slug="fill-pdf-form" />
    </>
  );
}
