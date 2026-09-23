import AutoToolSeo from '@/components/AutoToolSeo';
import CaseConverter from './CaseConverter';

export const metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/text/case-converter/',
  },
    title: 'Case Converter - Convert Text Case Online Free',
    description: 'Quickly convert your text to UPPERCASE, lowercase, Title Case, camelCase, snake_case, and more online for free.',
    keywords: ['case converter', 'uppercase', 'lowercase', 'title case', 'camelCase', 'snake_case']
};

export default function Page() {
    return (
    <>
      <CaseConverter />
      <AutoToolSeo slug="case-converter" />
    </>
  );
}
