import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import CreateFillablePdf from './CreateFillablePdf';

export const metadata: Metadata = {
  title: 'Create Fillable PDF - Add Form Fields to PDF Online Free',
  description: 'Turn static PDFs into interactive fillable forms. Add fillable text boxes, checkboxes, and signature fields with 100% private in-browser editing.',
  keywords: [
    'create fillable pdf',
    'add form fields to pdf',
    'make pdf fillable',
    'interactive pdf form builder',
    'pdf form creator online free',
    'add text fields to pdf',
    'acroform builder',
  ],
};

export default function Page() {
  return (
    <>
      <CreateFillablePdf />
      <AutoToolSeo slug="create-fillable-pdf" />
    </>
  );
}
