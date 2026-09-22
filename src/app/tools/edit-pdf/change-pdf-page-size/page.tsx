import { Metadata } from 'next';
import ChangePdfPageSize from './ChangePdfPageSize';

export const metadata: Metadata = {
  title: 'Change PDF Page Size - Resize & Scale PDF Pages Online Free',
  description: 'Resize PDF pages to A4, US Letter, A3, Legal, or custom dimensions with smart scaling and 100% private in-browser processing.',
  keywords: [
    'change pdf page size',
    'resize pdf pages',
    'convert letter to a4 pdf',
    'scale pdf page size',
    'a4 to letter pdf',
    'pdf page dimensions converter',
    'resize pdf online',
    'pdf paper size converter',
  ],
};

export default function Page() {
  return <ChangePdfPageSize />;
}
