import AutoToolSeo from '@/components/AutoToolSeo';
import RegexTester from './RegexTester';

export const metadata = {
    title: 'Regex Tester - Test Regular Expressions Online Free',
    description: 'Test and debug your regular expressions online in real-time. Features syntax highlighting, match extraction, and capture groups.',
    keywords: ['regex tester', 'regular expression tester', 'regex debugger', 'regex match', 'online regex tool']
};

export default function Page() {
    return (
    <>
      <RegexTester />
      <AutoToolSeo slug="regex-tester" />
    </>
  );
}
