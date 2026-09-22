import fs from 'node:fs';
import path from 'node:path';

const SLUG_TO_CATEGORY = {
  // Convert from PDF
  'pdf-to-jpg': { category: 'Convert from PDF', categorySlug: 'convert-from-pdf' },
  'pdf-to-word': { category: 'Convert from PDF', categorySlug: 'convert-from-pdf' },
  'pdf-to-excel': { category: 'Convert from PDF', categorySlug: 'convert-from-pdf' },
  'pdf-to-powerpoint': { category: 'Convert from PDF', categorySlug: 'convert-from-pdf' },
  'pdf-to-png': { category: 'Convert from PDF', categorySlug: 'convert-from-pdf' },
  'pdf-to-svg': { category: 'Convert from PDF', categorySlug: 'convert-from-pdf' },
  'pdf-to-text': { category: 'Convert from PDF', categorySlug: 'convert-from-pdf' },
  'pdf-to-html': { category: 'Convert from PDF', categorySlug: 'convert-from-pdf' },
  'pdf-to-markdown': { category: 'Convert from PDF', categorySlug: 'convert-from-pdf' },
  'pdf-to-pdfa': { category: 'Convert from PDF', categorySlug: 'convert-from-pdf' },
  'extract-pdf-images': { category: 'Convert from PDF', categorySlug: 'convert-from-pdf' },
  'extract-pdf-pages': { category: 'Convert from PDF', categorySlug: 'convert-from-pdf' },

  // Convert to PDF
  'image-to-pdf': { category: 'Convert to PDF', categorySlug: 'convert-to-pdf' },
  'word-to-pdf': { category: 'Convert to PDF', categorySlug: 'convert-to-pdf' },
  'excel-to-pdf': { category: 'Convert to PDF', categorySlug: 'convert-to-pdf' },
  'powerpoint-to-pdf': { category: 'Convert to PDF', categorySlug: 'convert-to-pdf' },
  'text-to-pdf': { category: 'Convert to PDF', categorySlug: 'convert-to-pdf' },
  'markdown-to-pdf': { category: 'Convert to PDF', categorySlug: 'convert-to-pdf' },
  'webpage-to-pdf': { category: 'Convert to PDF', categorySlug: 'convert-to-pdf' },
  'scan-to-pdf': { category: 'Convert to PDF', categorySlug: 'convert-to-pdf' },

  // Organize PDF
  'merge-pdf': { category: 'Organize PDF', categorySlug: 'organize-pdf' },
  'split-pdf': { category: 'Organize PDF', categorySlug: 'organize-pdf' },
  'remove-pdf-pages': { category: 'Organize PDF', categorySlug: 'organize-pdf' },
  'rearrange-pdf-pages': { category: 'Organize PDF', categorySlug: 'organize-pdf' },
  'rotate-pdf': { category: 'Organize PDF', categorySlug: 'organize-pdf' },
  'halve-pdf-pages': { category: 'Organize PDF', categorySlug: 'organize-pdf' },
  'nup-pdf': { category: 'Organize PDF', categorySlug: 'organize-pdf' },

  // Optimize PDF
  'compress-pdf': { category: 'Optimize PDF', categorySlug: 'optimize-pdf' },
  'repair-pdf': { category: 'Optimize PDF', categorySlug: 'optimize-pdf' },
  'pdf-ocr': { category: 'Optimize PDF', categorySlug: 'optimize-pdf' },
  'optimize-pdf-web': { category: 'Optimize PDF', categorySlug: 'optimize-pdf' },
  'flatten-pdf': { category: 'Optimize PDF', categorySlug: 'optimize-pdf' },
  'rasterize-pdf': { category: 'Optimize PDF', categorySlug: 'optimize-pdf' },

  // Edit PDF
  'edit-pdf': { category: 'Edit PDF', categorySlug: 'edit-pdf' },
  'watermark-pdf': { category: 'Edit PDF', categorySlug: 'edit-pdf' },
  'number-pdf': { category: 'Edit PDF', categorySlug: 'edit-pdf' },
  'bookmark-pdf': { category: 'Edit PDF', categorySlug: 'edit-pdf' },
  'crop-pdf': { category: 'Edit PDF', categorySlug: 'edit-pdf' },
  'change-pdf-page-size': { category: 'Edit PDF', categorySlug: 'edit-pdf' },
  'overlay-pdf': { category: 'Edit PDF', categorySlug: 'edit-pdf' },
  'compare-pdf': { category: 'Edit PDF', categorySlug: 'edit-pdf' },
  'pdf-metadata': { category: 'Edit PDF', categorySlug: 'edit-pdf' },
  'set-pdf-viewer-preferences': { category: 'Edit PDF', categorySlug: 'edit-pdf' },
  'pdf-reader': { category: 'Edit PDF', categorySlug: 'edit-pdf' },
  'create-pdf': { category: 'Edit PDF', categorySlug: 'edit-pdf' },

  // PDF Security
  'sign-pdf': { category: 'PDF Security', categorySlug: 'pdf-security' },
  'protect-pdf': { category: 'PDF Security', categorySlug: 'pdf-security' },
  'unlock-pdf': { category: 'PDF Security', categorySlug: 'pdf-security' },
  'redact-pdf': { category: 'PDF Security', categorySlug: 'pdf-security' },
  'create-fillable-pdf': { category: 'PDF Security', categorySlug: 'pdf-security' },
  'fill-pdf-form': { category: 'PDF Security', categorySlug: 'pdf-security' },

  // Office
  'excel-to-csv': { category: 'Office', categorySlug: 'office' },
  'excel-to-json': { category: 'Office', categorySlug: 'office' },
  'excel-to-html': { category: 'Office', categorySlug: 'office' },
  'word-to-html': { category: 'Office', categorySlug: 'office' },
  'word-to-txt': { category: 'Office', categorySlug: 'office' },
  'word-to-markdown': { category: 'Office', categorySlug: 'office' },
  'word-editor': { category: 'Office', categorySlug: 'office' },
  'powerpoint-to-html': { category: 'Office', categorySlug: 'office' },
  'powerpoint-to-images': { category: 'Office', categorySlug: 'office' },
  'powerpoint-viewer': { category: 'Office', categorySlug: 'office' },
  'create-invoice': { category: 'Office', categorySlug: 'office' },
  'electronic-invoice': { category: 'Office', categorySlug: 'office' },
  'universal-office-converter': { category: 'Office', categorySlug: 'office' },
  'pdf-converter': { category: 'Office', categorySlug: 'office' },

  // Media
  'image-compressor': { category: 'Media', categorySlug: 'media' },
  'image-converter': { category: 'Media', categorySlug: 'media' },
  'image-resizer': { category: 'Media', categorySlug: 'media' },
  'image-color-picker': { category: 'Media', categorySlug: 'media' },
  'heic-to-jpg': { category: 'Media', categorySlug: 'media' },
  'favicon-generator': { category: 'Media', categorySlug: 'media' },
  'svg-viewer-optimizer': { category: 'Media', categorySlug: 'media' },

  // Calculators
  'bmi-calculator': { category: 'Calculators', categorySlug: 'calculators' },
  'age-calculator': { category: 'Calculators', categorySlug: 'calculators' },
  'calorie-bmr-calculator': { category: 'Calculators', categorySlug: 'calculators' },
  'gpa-calculator': { category: 'Calculators', categorySlug: 'calculators' },
  'loan-calculator': { category: 'Calculators', categorySlug: 'calculators' },
  'percentage-calculator': { category: 'Calculators', categorySlug: 'calculators' },
  'unit-converter': { category: 'Calculators', categorySlug: 'calculators' },
  'aspect-ratio-calculator': { category: 'Calculators', categorySlug: 'calculators' },

  // Developer
  'json-formatter': { category: 'Developer', categorySlug: 'developer' },
  'jwt-decoder': { category: 'Developer', categorySlug: 'developer' },
  'base64-encoder-decoder': { category: 'Developer', categorySlug: 'developer' },
  'hash-generator': { category: 'Developer', categorySlug: 'developer' },
  'uuid-generator': { category: 'Developer', categorySlug: 'developer' },
  'regex-tester': { category: 'Developer', categorySlug: 'developer' },
  'sql-formatter': { category: 'Developer', categorySlug: 'developer' },
  'code-beautifier-minifier': { category: 'Developer', categorySlug: 'developer' },
  'cron-generator': { category: 'Developer', categorySlug: 'developer' },
  'timestamp-converter': { category: 'Developer', categorySlug: 'developer' },
  'url-encoder-decoder': { category: 'Developer', categorySlug: 'developer' },
  'csv-json-converter': { category: 'Developer', categorySlug: 'developer' },
  'text-diff-checker': { category: 'Developer', categorySlug: 'developer' },
  'markdown-preview': { category: 'Developer', categorySlug: 'developer' },

  // Text
  'word-counter': { category: 'Text', categorySlug: 'text' },
  'case-converter': { category: 'Text', categorySlug: 'text' },
  'list-cleaner': { category: 'Text', categorySlug: 'text' },
  'lorem-ipsum-generator': { category: 'Text', categorySlug: 'text' },

  // Design
  'color-palette-generator': { category: 'Design', categorySlug: 'design' },
  'css-box-shadow-generator': { category: 'Design', categorySlug: 'design' },
  'qr-code-generator': { category: 'Design', categorySlug: 'design' },
  'password-generator': { category: 'Design', categorySlug: 'design' },
  'resume-builder': { category: 'Design', categorySlug: 'design' },
};

const toolsPath = path.resolve('src', 'lib', 'tools.ts');
let content = fs.readFileSync(toolsPath, 'utf8');

// Update Tool interface
content = content.replace(
  `export interface Tool {
  name: string;
  description: string;
  slug: string;
  icon: string;
  category: string;
  color: string;
}`,
  `export interface Tool {
  name: string;
  description: string;
  slug: string;
  icon: string;
  category: string;
  categorySlug: string;
  color: string;
}

export function getToolUrl(tool: { categorySlug?: string; slug: string }): string {
  return \`/tools/\${tool.categorySlug || 'organize-pdf'}/\${tool.slug}\`;
}

export interface ToolCategory {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export const CATEGORIES: ToolCategory[] = [
  { name: 'Convert from PDF', slug: 'convert-from-pdf', description: 'Convert PDF files to Word, JPG, Excel, PowerPoint, Text, and HTML.', icon: '🔄' },
  { name: 'Convert to PDF', slug: 'convert-to-pdf', description: 'Convert Images, Office documents, and Text to high-quality PDF.', icon: '📄' },
  { name: 'Organize PDF', slug: 'organize-pdf', description: 'Merge, split, remove, rotate, and rearrange PDF document pages.', icon: '📑' },
  { name: 'Optimize PDF', slug: 'optimize-pdf', description: 'Compress, repair, OCR, and optimize PDF files for fast sharing.', icon: '🗜️' },
  { name: 'Edit PDF', slug: 'edit-pdf', description: 'Add text, watermarks, page numbers, and crop PDF pages.', icon: '✏️' },
  { name: 'PDF Security', slug: 'pdf-security', description: 'Sign, encrypt with password, unlock, and redact PDF files.', icon: '🔒' },
  { name: 'Office', slug: 'office', description: 'Process Word, Excel, and PowerPoint documents without Microsoft Office.', icon: '📊' },
  { name: 'Media', slug: 'media', description: 'Compress, convert, and resize images in your browser privately.', icon: '🖼️' },
  { name: 'Calculators', slug: 'calculators', description: 'Fast calculations for finance, health, academics, and units.', icon: '🧮' },
  { name: 'Developer', slug: 'developer', description: 'Inspect, format, encode, and decode developer payloads.', icon: '💻' },
  { name: 'Text', slug: 'text', description: 'Word count, case conversion, and text cleaning utilities.', icon: '📝' },
  { name: 'Design', slug: 'design', description: 'Color palettes, shadows, QR codes, and resume generation.', icon: '🎨' },
];`
);

// Update each tool object to inject category and categorySlug
for (const [slug, info] of Object.entries(SLUG_TO_CATEGORY)) {
  // Regex looks for slug: 'slug' and matches the category in the same tool block
  const blockRegex = new RegExp(`slug:\\s*['"]${slug}['"],([\\s\\S]*?)category:\\s*['"][^'"]+['"],`, 'g');
  content = content.replace(blockRegex, (match, intermediate) => {
    return `slug: '${slug}',${intermediate}category: '${info.category}',\n    categorySlug: '${info.categorySlug}',`;
  });
}

fs.writeFileSync(toolsPath, content, 'utf8');
console.log('Successfully updated src/lib/tools.ts with categorySlug and helper functions!');
