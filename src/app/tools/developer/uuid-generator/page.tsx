import { Metadata } from 'next';
import UuidGenerator from './UuidGenerator';

export const metadata: Metadata = {
  title: 'UUID Generator - Generate v4 GUIDs Online Free',
  description: 'Fast, free, and secure online UUID/GUID generator. Generate up to 100 version 4 UUIDs instantly in various formats (uppercase, lowercase, hyphens).',
  keywords: ['uuid generator', 'guid generator', 'v4 uuid', 'generate guid', 'random uuid', 'uuid creator']
};

export default function UuidGeneratorPage() {
  return <UuidGenerator />;
}
