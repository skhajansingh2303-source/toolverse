import { Metadata } from 'next';
import PdfMetadata from './PdfMetadata';

export const metadata: Metadata = {
  title: 'PDF Metadata Editor - View and Edit PDF Info Online Free',
  description: 'View and edit PDF properties and metadata including title, author, subject, and keywords directly in your browser.',
  keywords: ['pdf metadata', 'edit pdf properties', 'change pdf author', 'pdf info editor online'],
};

export default function Page() {
  return <PdfMetadata />;
}
