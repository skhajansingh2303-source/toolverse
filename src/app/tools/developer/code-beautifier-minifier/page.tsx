import { Metadata } from 'next';
import CodeBeautifierMinifier from './CodeBeautifierMinifier';

export const metadata: Metadata = {
  title: 'Code Beautifier & Minifier - Format HTML CSS JS Online Free',
  description: 'Free online code formatter and minifier. Beautify or minify your HTML, CSS, and JavaScript code instantly in your browser.',
  keywords: ['code beautifier', 'code minifier', 'html formatter', 'css minifier', 'js beautifier', 'javascript formatter']
};

export default function CodeBeautifierPage() {
  return <CodeBeautifierMinifier />;
}
