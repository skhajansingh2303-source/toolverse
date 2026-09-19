import { Metadata } from 'next';
import SqlFormatter from './SqlFormatter';

export const metadata: Metadata = {
  title: 'SQL Formatter - Prettify & Indent SQL Queries Online Free',
  description: 'Free online SQL formatter and beautifier. Indent, prettify, and minify complex SQL queries instantly in your browser.',
  keywords: ['sql formatter', 'sql beautifier', 'format sql online', 'prettify sql', 'sql minifier', 'sql query formatter']
};

export default function SqlFormatterPage() {
  return <SqlFormatter />;
}
