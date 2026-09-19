import { Metadata } from 'next';
import UrlTool from './UrlTool';

export const metadata: Metadata = {
  title: 'URL Encoder Decoder - Encode & Decode URLs Online',
  description: 'Free online tool to encode or decode URLs. Securely parse URL components and convert special characters for web addresses.',
  keywords: ['url encoder', 'url decoder', 'url parser', 'encode url', 'decode url online'],
};

export default function UrlPage() {
  return <UrlTool />;
}
