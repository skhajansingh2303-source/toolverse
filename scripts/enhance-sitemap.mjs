import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('out');
const sitemapXmlPath = path.join(outDir, 'sitemap.xml');
const publicXslPath = path.resolve('public', 'sitemap.xsl');
const outXslPath = path.join(outDir, 'sitemap.xsl');

// 1. Copy sitemap.xsl & _redirects to out/ if not already there
if (fs.existsSync(publicXslPath)) {
  fs.copyFileSync(publicXslPath, outXslPath);
  console.log('Copied sitemap.xsl to out/sitemap.xsl');
}
const publicRedirectsPath = path.resolve('public', '_redirects');
const outRedirectsPath = path.join(outDir, '_redirects');
if (fs.existsSync(publicRedirectsPath)) {
  fs.copyFileSync(publicRedirectsPath, outRedirectsPath);
  console.log('Copied public/_redirects to out/_redirects');
}
const publicAdsPath = path.resolve('public', 'ads.txt');
const outAdsPath = path.join(outDir, 'ads.txt');
if (fs.existsSync(publicAdsPath)) {
  fs.copyFileSync(publicAdsPath, outAdsPath);
  console.log('Copied public/ads.txt to out/ads.txt');
}

// 2. Inject stylesheet link into out/sitemap.xml
if (fs.existsSync(sitemapXmlPath)) {
  let content = fs.readFileSync(sitemapXmlPath, 'utf8');
  const stylesheetLine = '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';

  if (!content.includes('href="/sitemap.xsl"')) {
    if (content.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
      content = content.replace(
        '<?xml version="1.0" encoding="UTF-8"?>',
        `<?xml version="1.0" encoding="UTF-8"?>\n${stylesheetLine}`
      );
    } else {
      content = `${stylesheetLine}\n${content}`;
    }
    fs.writeFileSync(sitemapXmlPath, content, 'utf8');
    console.log('Successfully injected <?xml-stylesheet> into out/sitemap.xml');
  } else {
    console.log('out/sitemap.xml already has sitemap.xsl attached');
  }
} else {
  console.warn('Warning: out/sitemap.xml was not found');
}

// 3. Fix canonical URLs, og:url, and hreflang across all exported HTML files
const BASE_URL = 'https://toolsverseapp.com';
const LANGUAGE_CODES = [
  'en', 'zh-CN', 'zh-TW', 'it', 'es', 'fr', 'de', 'ja', 'ko', 'ru',
  'pt', 'hi', 'ar', 'bn', 'id', 'tr', 'nl', 'pl', 'vi', 'th',
  'uk', 'sv', 'el', 'cs', 'ro'
];

function getAllHtmlFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllHtmlFiles(fullPath, fileList);
    } else if (file.endsWith('.html') && file !== '404.html') {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const htmlFiles = getAllHtmlFiles(outDir);
let fixedCount = 0;

for (const filePath of htmlFiles) {
  const relativePath = path.relative(outDir, filePath).replace(/\\/g, '/');

  let pagePath = '';
  if (relativePath === 'index.html') {
    pagePath = '/';
  } else if (relativePath.endsWith('/index.html')) {
    pagePath = '/' + relativePath.replace(/\/index\.html$/, '/');
  } else {
    pagePath = '/' + relativePath.replace(/\.html$/, '/');
  }
  const pageCanonical = `${BASE_URL}${pagePath}`;

  let content = fs.readFileSync(filePath, 'utf8');

  // 3a. Fix or inject canonical link
  const canonicalTag = `<link rel="canonical" href="${pageCanonical}"/>`;
  if (/<link[^>]*rel=["']canonical["'][^>]*>/i.test(content)) {
    content = content.replace(/<link[^>]*rel=["']canonical["'][^>]*>/i, canonicalTag);
  } else if (content.includes('</head>')) {
    content = content.replace('</head>', `  ${canonicalTag}\n</head>`);
  }

  // 3b. Fix og:url
  const ogUrlTag = `<meta property="og:url" content="${pageCanonical}"/>`;
  if (/<meta[^>]*property=["']og:url["'][^>]*>/i.test(content)) {
    content = content.replace(/<meta[^>]*property=["']og:url["'][^>]*>/i, ogUrlTag);
  }

  // 3c. Fix hreflang x-default
  const xDefaultTag = `<link rel="alternate" hrefLang="x-default" href="${pageCanonical}"/>`;
  if (/<link[^>]*rel=["']alternate["'][^>]*hrefLang=["']x-default["'][^>]*>/i.test(content)) {
    content = content.replace(/<link[^>]*rel=["']alternate["'][^>]*hrefLang=["']x-default["'][^>]*>/i, xDefaultTag);
  }

  // 3d. Fix each language hreflang link to point to this page + ?lang=...
  for (const lang of LANGUAGE_CODES) {
    const langUrl = `${pageCanonical}?lang=${lang}`;
    const langTag = `<link rel="alternate" hrefLang="${lang}" href="${langUrl}"/>`;
    const langRegex = new RegExp(`<link[^>]*rel=["']alternate["'][^>]*hrefLang=["']${lang}["'][^>]*>`, 'i');
    if (langRegex.test(content)) {
      content = content.replace(langRegex, langTag);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  fixedCount++;
}

console.log(`Successfully verified and set self-referencing canonical & hreflang URLs on ${fixedCount} HTML pages!`);
