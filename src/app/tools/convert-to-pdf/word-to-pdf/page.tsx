import WordToPdf from './WordToPdf';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  title: 'Word to PDF - Convert Word (.docx) to PDF Online Free',
  description: 'Convert Microsoft Word DOC and DOCX documents into clean, standardized PDF files instantly. 100% private in-browser conversion with zero server uploads.',
  keywords: [
    'word to pdf',
    'convert docx to pdf',
    'convert doc to pdf',
    'docx to pdf converter',
    'office to pdf',
    'word to pdf online free',
    'doc to pdf converter',
  ],
};

const STEPS = [
  {
    title: 'Upload your Word File',
    description: 'Select your .docx or .doc file from your computer or drag it into the upload box.',
  },
  {
    title: 'Automatic In-Browser Rendering',
    description: 'The engine parses headers, typography, tables, and paragraphs cleanly without Microsoft Office installed.',
  },
  {
    title: 'Download Formatted PDF',
    description: 'Save your standardized, universal PDF document ready for printing, submission, and sharing.',
  },
];

const FAQS = [
  {
    question: 'Do I need Microsoft Word installed on my computer?',
    answer: 'No. ToolsVerse includes a native client-side document parser that reads DOCX files directly in any modern browser without needing Word, Office 365, or third-party software.',
  },
  {
    question: 'Are my Word documents uploaded to an external server?',
    answer: 'No. The conversion executes entirely within your browser memory. Your confidential work and personal files never leave your device.',
  },
  {
    question: 'Does this tool preserve fonts, tables, and formatting?',
    answer: 'Yes. Paragraph styles, tables, bulleted lists, and standard fonts are translated into vector PDF elements accurately.',
  },
  {
    question: 'Can I convert Word to PDF on my phone or tablet?',
    answer: 'Yes! ToolsVerse is 100% mobile-friendly and runs smoothly on iPhone, iPad, Android, Mac, and Windows.',
  },
];

export default function Page() {
  return (
    <>
      <WordToPdf />
      <ToolSeoContent
        toolName="Word to PDF Converter"
        toolSlug="word-to-pdf"
        categoryName="Convert to PDF"
        categorySlug="convert-to-pdf"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['excel-to-pdf', 'powerpoint-to-pdf', 'image-to-pdf', 'pdf-to-word']}
      />
    </>
  );
}
