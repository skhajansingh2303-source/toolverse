import AutoToolSeo from '@/components/AutoToolSeo';
import TextDiffChecker from './TextDiffChecker';

export const metadata = {
    title: 'Text Diff Checker - Compare Texts Online Free',
    description: 'Compare two text files or snippets online. Find differences, added, removed, and unchanged lines easily.',
    keywords: ['text diff checker', 'compare text', 'diff tool', 'find differences in text']
};

export default function Page() {
    return (
    <>
      <TextDiffChecker />
      <AutoToolSeo slug="text-diff-checker" />
    </>
  );
}
