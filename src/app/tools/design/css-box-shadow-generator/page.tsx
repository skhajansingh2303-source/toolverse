import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import CssBoxShadowGenerator from './CssBoxShadowGenerator';

export const metadata: Metadata = {
  title: 'CSS Box Shadow Generator - Create Shadows & Glassmorphism Online Free',
  description: 'Create and preview CSS box shadows and glassmorphism effects. Visual shadow generator with live code output and modern presets.',
  keywords: ['css box shadow generator', 'box shadow tool', 'glassmorphism generator', 'css shadow generator', 'web design tools'],
};

export default function Page() {
  return (
    <>
      <CssBoxShadowGenerator />
      <AutoToolSeo slug="css-box-shadow-generator" />
    </>
  );
}
