import fs from 'node:fs';
import path from 'node:path';

const SLUG_TO_CATEGORY = {
  // Convert from PDF
  'pdf-to-jpg': 'convert-from-pdf',
  'pdf-to-word': 'convert-from-pdf',
  'pdf-to-excel': 'convert-from-pdf',
  'pdf-to-powerpoint': 'convert-from-pdf',
  'pdf-to-png': 'convert-from-pdf',
  'pdf-to-svg': 'convert-from-pdf',
  'pdf-to-text': 'convert-from-pdf',
  'pdf-to-html': 'convert-from-pdf',
  'pdf-to-markdown': 'convert-from-pdf',
  'pdf-to-pdfa': 'convert-from-pdf',
  'extract-pdf-images': 'convert-from-pdf',
  'extract-pdf-pages': 'convert-from-pdf',

  // Convert to PDF
  'image-to-pdf': 'convert-to-pdf',
  'word-to-pdf': 'convert-to-pdf',
  'excel-to-pdf': 'convert-to-pdf',
  'powerpoint-to-pdf': 'convert-to-pdf',
  'text-to-pdf': 'convert-to-pdf',
  'markdown-to-pdf': 'convert-to-pdf',
  'webpage-to-pdf': 'convert-to-pdf',
  'scan-to-pdf': 'convert-to-pdf',

  // Organize PDF
  'merge-pdf': 'organize-pdf',
  'split-pdf': 'organize-pdf',
  'remove-pdf-pages': 'organize-pdf',
  'rearrange-pdf-pages': 'organize-pdf',
  'rotate-pdf': 'organize-pdf',
  'halve-pdf-pages': 'organize-pdf',
  'nup-pdf': 'organize-pdf',

  // Optimize PDF
  'compress-pdf': 'optimize-pdf',
  'repair-pdf': 'optimize-pdf',
  'pdf-ocr': 'optimize-pdf',
  'optimize-pdf-web': 'optimize-pdf',
  'flatten-pdf': 'optimize-pdf',
  'rasterize-pdf': 'optimize-pdf',

  // Edit PDF
  'edit-pdf': 'edit-pdf',
  'watermark-pdf': 'edit-pdf',
  'number-pdf': 'edit-pdf',
  'bookmark-pdf': 'edit-pdf',
  'crop-pdf': 'edit-pdf',
  'change-pdf-page-size': 'edit-pdf',
  'overlay-pdf': 'edit-pdf',
  'compare-pdf': 'edit-pdf',
  'pdf-metadata': 'edit-pdf',
  'set-pdf-viewer-preferences': 'edit-pdf',
  'pdf-reader': 'edit-pdf',
  'create-pdf': 'edit-pdf',

  // PDF Security
  'sign-pdf': 'pdf-security',
  'protect-pdf': 'pdf-security',
  'unlock-pdf': 'pdf-security',
  'redact-pdf': 'pdf-security',
  'create-fillable-pdf': 'pdf-security',
  'fill-pdf-form': 'pdf-security',

  // Office
  'excel-to-csv': 'office',
  'excel-to-json': 'office',
  'excel-to-html': 'office',
  'word-to-html': 'office',
  'word-to-txt': 'office',
  'word-to-markdown': 'office',
  'word-editor': 'office',
  'powerpoint-to-html': 'office',
  'powerpoint-to-images': 'office',
  'powerpoint-viewer': 'office',
  'create-invoice': 'office',
  'electronic-invoice': 'office',
  'universal-office-converter': 'office',
  'pdf-converter': 'office',

  // Media
  'image-compressor': 'media',
  'image-converter': 'media',
  'image-resizer': 'media',
  'image-color-picker': 'media',
  'heic-to-jpg': 'media',
  'favicon-generator': 'media',
  'svg-viewer-optimizer': 'media',

  // Calculators
  'bmi-calculator': 'calculators',
  'age-calculator': 'calculators',
  'calorie-bmr-calculator': 'calculators',
  'gpa-calculator': 'calculators',
  'loan-calculator': 'calculators',
  'percentage-calculator': 'calculators',
  'unit-converter': 'calculators',
  'aspect-ratio-calculator': 'calculators',

  // Developer
  'json-formatter': 'developer',
  'jwt-decoder': 'developer',
  'base64-encoder-decoder': 'developer',
  'hash-generator': 'developer',
  'uuid-generator': 'developer',
  'regex-tester': 'developer',
  'sql-formatter': 'developer',
  'code-beautifier-minifier': 'developer',
  'cron-generator': 'developer',
  'timestamp-converter': 'developer',
  'url-encoder-decoder': 'developer',
  'csv-json-converter': 'developer',
  'text-diff-checker': 'developer',
  'markdown-preview': 'developer',

  // Text
  'word-counter': 'text',
  'case-converter': 'text',
  'list-cleaner': 'text',
  'lorem-ipsum-generator': 'text',

  // Design
  'color-palette-generator': 'design',
  'css-box-shadow-generator': 'design',
  'qr-code-generator': 'design',
  'password-generator': 'design',
  'resume-builder': 'design',
};

// 1. Update Footer.tsx
const footerPath = path.resolve('src', 'components', 'Footer.tsx');
let footerContent = fs.readFileSync(footerPath, 'utf8');

for (const [slug, categorySlug] of Object.entries(SLUG_TO_CATEGORY)) {
  const oldUrl = `href="/tools/${slug}"`;
  const newUrl = `href="/tools/${categorySlug}/${slug}"`;
  footerContent = footerContent.replaceAll(oldUrl, newUrl);
}
fs.writeFileSync(footerPath, footerContent, 'utf8');
console.log('Updated Footer.tsx links.');

// 2. Update page.tsx
const homePath = path.resolve('src', 'app', 'page.tsx');
let homeContent = fs.readFileSync(homePath, 'utf8');

for (const [slug, categorySlug] of Object.entries(SLUG_TO_CATEGORY)) {
  const oldUrl = `href="/tools/${slug}"`;
  const newUrl = `href="/tools/${categorySlug}/${slug}"`;
  homeContent = homeContent.replaceAll(oldUrl, newUrl);
}

// In page.tsx: update dynamic link suggestions if any
homeContent = homeContent.replace(
  'href={`/tools/${tool.slug}`}',
  'href={`/tools/${tool.categorySlug || "organize-pdf"}/${tool.slug}`}'
);
homeContent = homeContent.replace(
  'window.location.href = `/tools/${selectedTool.slug}`;',
  'window.location.href = `/tools/${selectedTool.categorySlug || "organize-pdf"}/${selectedTool.slug}`;'
);

fs.writeFileSync(homePath, homeContent, 'utf8');
console.log('Updated page.tsx links.');

// 3. Update not-found.tsx
const notFoundPath = path.resolve('src', 'app', 'not-found.tsx');
if (fs.existsSync(notFoundPath)) {
  let nfContent = fs.readFileSync(notFoundPath, 'utf8');
  nfContent = nfContent.replaceAll(
    'href={`/tools/${tool.slug}`}',
    'href={`/tools/${tool.categorySlug || "organize-pdf"}/${tool.slug}`}'
  );
  fs.writeFileSync(notFoundPath, nfContent, 'utf8');
  console.log('Updated not-found.tsx links.');
}
