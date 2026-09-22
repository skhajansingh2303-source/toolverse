import { Metadata } from 'next';
import CreatePdf from './CreatePdf';

export const metadata: Metadata = {
  title: 'Create PDF - Free Online PDF Document Maker & Builder',
  description: 'Create professional PDF documents from scratch online with headings, tables, formatted text, and signatures.',
  keywords: ['create pdf', 'pdf maker', 'online pdf builder', 'design pdf document', 'generate pdf online', 'pdf editor scratch', 'pdf document generator'],
};

export default function CreatePdfPage() {
  return <CreatePdf />;
}
