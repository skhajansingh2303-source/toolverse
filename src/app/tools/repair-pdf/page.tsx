import { Metadata } from 'next';
import RepairPdf from './RepairPdf';

export const metadata: Metadata = {
  title: 'Repair PDF - Fix Corrupted & Damaged PDF Files Online Free',
  description: 'Repair and recover broken or corrupted PDF documents online. Rebuild damaged catalog and xref tables with 100% private in-browser repair.',
  keywords: [
    'repair pdf',
    'fix corrupt pdf',
    'recover damaged pdf',
    'restore pdf file',
    'repair broken pdf',
    'pdf xref repair',
    'pdf repair online',
  ],
};

export default function Page() {
  return <RepairPdf />;
}
