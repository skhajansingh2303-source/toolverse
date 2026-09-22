import fs from 'node:fs';
import path from 'node:path';

const CATEGORIES = [
  {
    name: 'Convert from PDF',
    slug: 'convert-from-pdf',
    title: 'Convert from PDF - Extract & Convert PDF to Word, Excel, JPG, PNG',
    description: 'Convert PDF files to Word, Excel, PowerPoint, JPG, PNG, HTML, and Text online for free. 100% private in-browser processing.',
    keywords: ['convert from pdf', 'pdf to word', 'pdf to jpg', 'pdf to excel', 'pdf converter online'],
    icon: '🔄',
  },
  {
    name: 'Convert to PDF',
    slug: 'convert-to-pdf',
    title: 'Convert to PDF - Images, Word, Excel & PowerPoint to PDF Online',
    description: 'Convert JPG, PNG, Word DOCX, Excel XLSX, PPTX, and HTML web pages to PDF online for free. Fast, private, and secure.',
    keywords: ['convert to pdf', 'jpg to pdf', 'word to pdf', 'image to pdf', 'excel to pdf'],
    icon: '📄',
  },
  {
    name: 'Organize PDF',
    slug: 'organize-pdf',
    title: 'Organize PDF - Merge, Split, Remove, Rotate & Reorder PDF Pages',
    description: 'Easily organize PDF files online. Merge multiple documents, split pages, remove unwanted pages, and rotate PDF pages instantly.',
    keywords: ['organize pdf', 'merge pdf', 'split pdf', 'rotate pdf', 'rearrange pdf pages'],
    icon: '📑',
  },
  {
    name: 'Optimize PDF',
    slug: 'optimize-pdf',
    title: 'Optimize PDF - Compress, Repair, OCR & Flatten PDF Online Free',
    description: 'Reduce PDF file size, repair damaged documents, run OCR text recognition, and optimize PDF documents for email and web.',
    keywords: ['optimize pdf', 'compress pdf', 'reduce pdf size', 'repair pdf', 'pdf ocr'],
    icon: '🗜️',
  },
  {
    name: 'Edit PDF',
    slug: 'edit-pdf',
    title: 'Edit PDF - Add Watermark, Page Numbers, Bookmarks & Crop PDF',
    description: 'Edit PDF documents directly in your browser. Add text, page numbers, watermarks, crop pages, and adjust page size.',
    keywords: ['edit pdf', 'watermark pdf', 'page numbers pdf', 'crop pdf', 'pdf editor online'],
    icon: '✏️',
  },
  {
    name: 'PDF Security',
    slug: 'pdf-security',
    title: 'PDF Security - Sign, Encrypt, Unlock, Redact & Fill PDF Forms',
    description: 'Bank-grade PDF security in your browser. Sign documents with legal e-signatures, password protect, remove passwords, and blackout sensitive text.',
    keywords: ['pdf security', 'sign pdf', 'protect pdf', 'unlock pdf', 'redact pdf'],
    icon: '🔒',
  },
  {
    name: 'Office',
    slug: 'office',
    title: 'Office Document Tools - Word, Excel & PowerPoint Converters',
    description: 'Process and convert Microsoft Office files in your browser. Excel to CSV, Word to HTML, PowerPoint viewers, and invoice builders.',
    keywords: ['office tools', 'excel to csv', 'word editor', 'invoice generator', 'powerpoint viewer'],
    icon: '📊',
  },
  {
    name: 'Media',
    slug: 'media',
    title: 'Media & Image Tools - Compress, Convert, Resize & Color Picker',
    description: 'Browser-based image utilities. Compress JPG and PNG, convert formats, resize images, and pick colors without uploading files.',
    keywords: ['image compressor', 'image converter', 'color picker', 'heic to jpg', 'favicon generator'],
    icon: '🖼️',
  },
  {
    name: 'Calculators',
    slug: 'calculators',
    title: 'Calculators & Converters - Health, Finance & Academic Tools',
    description: 'Fast, accurate online calculators for BMI, loan EMI, age, percentage, GPA, and unit conversions.',
    keywords: ['calculators', 'bmi calculator', 'loan calculator', 'age calculator', 'percentage calculator'],
    icon: '🧮',
  },
  {
    name: 'Developer',
    slug: 'developer',
    title: 'Developer Tools - JSON, JWT, Base64, RegEx & Hash Utilities',
    description: 'Essential developer tools. JSON formatters, JWT decoders, base64 encoders, UUID generators, and RegEx testers.',
    keywords: ['developer tools', 'json formatter', 'jwt decoder', 'uuid generator', 'base64 encoder'],
    icon: '💻',
  },
  {
    name: 'Text',
    slug: 'text',
    title: 'Text Utilities - Word Counter, Case Converter & Text Cleaner',
    description: 'Online text utilities. Count words and characters, convert letter cases, clean lists, and generate lorem ipsum placeholder text.',
    keywords: ['word counter', 'case converter', 'list cleaner', 'text tools', 'lorem ipsum'],
    icon: '📝',
  },
  {
    name: 'Design',
    slug: 'design',
    title: 'Design & Visual Tools - Palettes, CSS Shadows & QR Code Maker',
    description: 'Creative design tools. Generate harmonic color palettes, CSS box shadows, customizable QR codes, and professional resumes.',
    keywords: ['design tools', 'color palette generator', 'qr code generator', 'box shadow generator', 'resume builder'],
    icon: '🎨',
  },
];

const toolsDir = path.resolve('src', 'app', 'tools');

for (const cat of CATEGORIES) {
  const catDir = path.join(toolsDir, cat.slug);
  if (!fs.existsSync(catDir)) {
    fs.mkdirSync(catDir, { recursive: true });
  }

  const pageContent = `import React from 'react';
import { Metadata } from 'next';
import CategoryPageLayout from '@/components/CategoryPageLayout';
import { tools, CATEGORIES } from '@/lib/tools';

export const metadata: Metadata = {
  title: '${cat.title} | ToolsVerse',
  description: '${cat.description}',
  keywords: ${JSON.stringify(cat.keywords)},
};

export default function CategoryPage() {
  const category = CATEGORIES.find((c) => c.slug === '${cat.slug}')!;
  const categoryTools = tools.filter((t) => t.categorySlug === '${cat.slug}');

  return <CategoryPageLayout category={category} tools={categoryTools} />;
}
`;

  const targetFile = path.join(catDir, 'page.tsx');
  fs.writeFileSync(targetFile, pageContent, 'utf8');
  console.log(`Generated category landing page: src/app/tools/${cat.slug}/page.tsx`);
}
