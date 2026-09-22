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

console.log('Starting migration to category folders...');

const toolsDir = path.resolve('src', 'app', 'tools');

// If slug === categorySlug (like edit-pdf), rename to temp first
for (const [slug, info] of Object.entries(SLUG_TO_CATEGORY)) {
  if (slug === info.categorySlug) {
    const currentPath = path.join(toolsDir, slug);
    const tempPath = path.join(toolsDir, `${slug}_temp_rename`);
    if (fs.existsSync(currentPath)) {
      fs.renameSync(currentPath, tempPath);
      console.log(`Temporarily renamed ${slug} -> ${slug}_temp_rename`);
    }
  }
}

// 1. Move directories into category folders
for (const [slug, info] of Object.entries(SLUG_TO_CATEGORY)) {
  const isTemp = (slug === info.categorySlug);
  const currentPath = isTemp ? path.join(toolsDir, `${slug}_temp_rename`) : path.join(toolsDir, slug);
  const targetCategoryDir = path.join(toolsDir, info.categorySlug);
  const targetPath = path.join(targetCategoryDir, slug);

  if (fs.existsSync(currentPath)) {
    if (!fs.existsSync(targetCategoryDir)) {
      fs.mkdirSync(targetCategoryDir, { recursive: true });
    }
    if (!fs.existsSync(targetPath)) {
      fs.renameSync(currentPath, targetPath);
      console.log(`Moved ${slug} -> ${info.categorySlug}/${slug}`);
    }
  }
}

// 2. Generate public/_redirects for Cloudflare Pages 301 redirects
const redirectsPath = path.resolve('public', '_redirects');
const redirectLines = [];

for (const [slug, info] of Object.entries(SLUG_TO_CATEGORY)) {
  redirectLines.push(`/tools/${slug} /tools/${info.categorySlug}/${slug}/ 301`);
  redirectLines.push(`/tools/${slug}/ /tools/${info.categorySlug}/${slug}/ 301`);
}

fs.writeFileSync(redirectsPath, redirectLines.join('\n') + '\n', 'utf8');
console.log(`Generated public/_redirects with ${redirectLines.length} rules.`);

console.log('Migration step completed successfully.');
