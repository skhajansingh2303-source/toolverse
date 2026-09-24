import HandwritingStudio from './HandwritingStudio';
import { Metadata } from 'next';
import ToolSeoContent from '@/components/ToolSeoContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/design/handwriting-studio-generator/',
  },
  title: 'Handwriting Studio Generator - PDF & Text to Handwritten Notes Converter',
  description: 'Convert PDFs, lecture textbooks, and assignments into realistic handwritten notes with custom fonts, ruled paper, diagrams, and instant vector PDF export. 100% free and private.',
  keywords: [
    'handwriting studio generator',
    'text to handwriting converter',
    'pdf to handwriting notes',
    'handwritten assignment maker',
    'convert pdf to handwritten notes',
    'handwritten notes generator online',
    'ruled notebook text generator',
    'handwriting font generator',
  ],
};

const STEPS = [
  {
    title: 'Input Text or Upload PDF',
    description: 'Type your lecture notes in the Markdown editor, or upload any PDF or textbook document to automatically extract text.',
  },
  {
    title: 'Customize Handwriting Font & Paper Style',
    description: 'Choose from 8 realistic handwriting fonts (Coming Soon, Caveat, Kalam), select ruled or grid notebook lines, and set your favorite ink colors.',
  },
  {
    title: 'Download Clean Vector PDF or Print',
    description: 'Preview exact A4 pages in real time and click Download Vector PDF to export crisp, printable handwritten notes with zero quality loss.',
  },
];

const FAQS = [
  {
    question: 'How does the Handwriting Studio Generator work?',
    answer: 'The studio takes your text, headings, tables, and diagrams and renders them using authentic handwriting fonts onto stylized A4 paper backgrounds (plain, ruled lines, grid, or sepia cream) directly in your browser.',
  },
  {
    question: 'Can I convert an existing PDF or Word file into handwritten notes?',
    answer: 'Yes! Simply click "Upload PDF / Text" in the studio toolbar. The generator extracts the text in your browser, organizes it with headings, and renders handwritten pages automatically.',
  },
  {
    question: 'Can I include trees, flowcharts, and diagrams in my handwritten notes?',
    answer: 'Yes. You can create binary trees, AVL trees, flowcharts, and organizational hierarchies using simple text arrow syntax (A -> B -> C) or ```tree code blocks.',
  },
  {
    question: 'Is the exported PDF sharp and vector-quality for printing?',
    answer: 'Yes. The generator exports using standard A4 print stylesheets, ensuring that fonts, lines, and diagrams are saved in true high-resolution vector PDF format without pixelation.',
  },
  {
    question: 'Are my notes or uploaded PDFs stored on your server?',
    answer: 'No. All processing, PDF text extraction, and note rendering happens 100% client-side in your local browser. Your confidential assignments and notes never leave your computer.',
  },
];

export default function Page() {
  return (
    <>
      <HandwritingStudio />
      <ToolSeoContent
        toolName="Handwriting Studio Generator"
        toolSlug="handwriting-studio-generator"
        categoryName="Design"
        categorySlug="design"
        steps={STEPS}
        faqs={FAQS}
        relatedSlugs={['resume-builder', 'qr-code-generator', 'color-palette-generator', 'word-counter']}
      />
    </>
  );
}
