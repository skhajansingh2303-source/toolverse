import PdfToWord from './PdfToWord';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/convert-from-pdf/pdf-to-word/',
  },
  title: 'PDF to Word - Convert PDF to Word (.docx) Online Free',
  description: 'Convert PDF documents into editable Microsoft Word (.docx) documents with layout and paragraph preservation. 100% private in-browser conversion.',
  keywords: [
    'pdf to word',
    'convert pdf to docx',
    'pdf to word converter',
    'pdf to docx online free',
    'editable word document',
    'extract word from pdf',
    'pdf to doc',
  ],
};

const STEPS = [
  {
    title: 'Upload your PDF Document',
    description: 'Select your PDF document from your computer or phone, or drop it into the conversion zone.',
  },
  {
    title: 'Process Layout & Text',
    description: 'ToolsVerse extracts text blocks, tables, fonts, and formatting directly in your web browser.',
  },
  {
    title: 'Download Editable Word DOCX',
    description: 'Download the generated .docx file and edit text, tables, and styles freely in Microsoft Word or Google Docs.',
  },
];

const FAQS = [
  {
    question: 'Will my converted Word document retain original formatting and tables?',
    answer: 'Yes! ToolsVerse extracts paragraphs, headings, tables, and typography to reconstruct an accurate, cleanly editable Microsoft Word (.docx) file.',
  },
  {
    question: 'Are my confidential business documents safe from data leaks?',
    answer: 'Absolutely. Unlike other cloud converters that save your PDFs to third-party servers, ToolsVerse converts your PDF right inside your device using local WebAssembly. Zero files are stored or uploaded.',
  },
  {
    question: 'Can I open the resulting file in Microsoft Word and Google Docs?',
    answer: 'Yes, the output is a standard OpenXML (.docx) document fully compatible with Microsoft Word, LibreOffice, Apple Pages, and Google Docs.',
  },
  {
    question: 'Do I need to sign up or pay to convert long PDF files?',
    answer: 'No registration or credit card is required. You can convert documents for free with no daily quota.',
  },
];

export default function Page() {
  return (
    <>
      <PdfToWord />
      <ToolSeoContent
        toolName="PDF to Word Converter"
        toolSlug="pdf-to-word"
        categoryName="Convert from PDF"
        categorySlug="convert-from-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['word-to-pdf', 'pdf-to-excel', 'pdf-to-text', 'pdf-to-jpg']}
      />
    </>
  );
}

