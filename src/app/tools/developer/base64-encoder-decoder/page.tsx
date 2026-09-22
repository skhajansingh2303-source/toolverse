import { Metadata } from 'next';
import Base64Tool from './Base64Tool';

export const metadata: Metadata = {
  title: 'Base64 Encoder Decoder - Encode & Decode Base64 Online',
  description: 'Free online tool to encode text to Base64 or decode Base64 to text. Features auto-detection, size calculation, and instant preview.',
  keywords: ['base64 encoder', 'base64 decoder', 'base64 to text', 'text to base64', 'online base64 tool'],
};

export default function Base64Page() {
  return <Base64Tool />;
}
