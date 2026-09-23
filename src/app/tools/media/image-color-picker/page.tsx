import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import ImageColorPicker from './ImageColorPicker';

export const metadata: Metadata = {
  title: 'Image Color Picker - Hex Eyedropper Online Free',
  description: 'Extract colors from images online. Upload an image and use our free eyedropper tool to pick hex, RGB, and HSL colors from any picture.',
  keywords: ['image color picker', 'hex color picker', 'image eyedropper', 'extract color from image', 'online color picker'],
};

export default function Page() {
  return (
    <>
      <ImageColorPicker />
      <AutoToolSeo slug="image-color-picker" />
    </>
  );
}
