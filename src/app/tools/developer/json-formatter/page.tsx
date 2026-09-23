import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import JsonFormatter from './JsonFormatter';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/developer/json-formatter/',
  },
  title: 'JSON Formatter & Validator - Format JSON Online Free',
  description: 'Format, validate, prettify, and minify your JSON data instantly. A fast, secure, free online JSON tool.',
  keywords: ['json formatter', 'json validator', 'json minifier', 'format json', 'prettify json']
};

export default function Page() {
  return (
    <>
      <JsonFormatter />
      <AutoToolSeo slug="json-formatter" />
    </>
  );
}
