import AutoToolSeo from '@/components/AutoToolSeo';
import type { Metadata } from 'next';
import UnitConverter from './UnitConverter';

export const metadata: Metadata = {
  title: 'Universal Unit Converter - Length, Weight, Temperature & Data',
  description: 'Convert between standard metric and imperial units for length, weight, temperature, digital data bytes, and speed.',
  keywords: ['unit converter', 'length converter', 'weight converter', 'celsius to fahrenheit', 'bytes to gb'],
};

export default function Page() {
  return (
    <>
      <UnitConverter />
      <AutoToolSeo slug="unit-converter" />
    </>
  );
}
