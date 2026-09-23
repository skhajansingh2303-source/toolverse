import AutoToolSeo from '@/components/AutoToolSeo';
import UniversalOfficeConverter from './UniversalOfficeConverter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/office/universal-office-converter/',
  },
  title: 'Universal Office Converter - Convert Word, Excel, PPT, PDF Online',
  description: 'All-in-one universal office converter. Drop any DOCX, XLSX, PPTX, PDF, CSV, or TXT file and convert client-side.',
  keywords: [
    'office converter',
    'universal document converter',
    'convert word to pdf',
    'convert excel to csv',
    'docx converter',
    'xlsx converter',
    'pdf converter',
    'online file converter free',
  ],
};

export default function Page() {
  return (
    <>
      <UniversalOfficeConverter />
      <AutoToolSeo slug="universal-office-converter" />
    </>
  );
}
