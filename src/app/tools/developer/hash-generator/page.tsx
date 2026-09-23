import AutoToolSeo from '@/components/AutoToolSeo';
import HashGenerator from './HashGenerator';

export const metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/developer/hash-generator/',
  },
    title: 'Hash Generator - Generate SHA-256 SHA-1 SHA-512 Hashes Online',
    description: 'Generate secure cryptographic hashes online. Supports SHA-1, SHA-256, SHA-384, and SHA-512 for both text and files.',
    keywords: ['hash generator', 'sha256 hash', 'sha1 hash generator', 'file hash calculator', 'sha512 hash']
};

export default function Page() {
    return (
    <>
      <HashGenerator />
      <AutoToolSeo slug="hash-generator" />
    </>
  );
}
