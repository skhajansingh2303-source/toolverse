import AutoToolSeo from '@/components/AutoToolSeo';
import type { Metadata } from 'next';
import CsvJsonConverter from './CsvJsonConverter';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/developer/csv-json-converter/',
  },
  title: 'CSV to JSON & JSON to CSV Converter - Free Online',
  description: 'Convert CSV spreadsheets to JSON arrays and JSON to CSV files online. Fast, secure, and 100% client-side.',
  keywords: ['csv to json', 'json to csv', 'csv converter', 'json converter', 'spreadsheet converter'],
};

export default function Page() {
  return (
    <>
      <CsvJsonConverter />
      <AutoToolSeo slug="csv-json-converter" />
    </>
  );
}
