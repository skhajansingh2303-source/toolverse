import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import ColorPaletteGenerator from './ColorPaletteGenerator';

export const metadata: Metadata = {
  title: 'Color Palette Generator - Create Beautiful Color Schemes',
  description: 'Generate beautiful color palettes, harmonies, and schemes. Export as CSS variables for your next project.',
  keywords: ['color palette', 'color generator', 'css colors', 'color scheme generator']
};

export default function Page() {
  return (
    <>
      <ColorPaletteGenerator />
      <AutoToolSeo slug="color-palette-generator" />
    </>
  );
}
