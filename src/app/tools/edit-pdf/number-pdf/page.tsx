import { Metadata } from 'next';
import NumberPdf from './NumberPdf';

export const metadata: Metadata = {
  title: 'Add Page Numbers to PDF - Number PDF Pages Online Free',
  description: 'Easily add page numbers to your PDF documents online for free. Customizable format, position, and starting number.',
  keywords: ['number pdf', 'add page numbers to pdf', 'paginate pdf', 'pdf tools online'],
};

export default function Page() {
  return <NumberPdf />;
}
