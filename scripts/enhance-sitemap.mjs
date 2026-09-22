import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('out');
const sitemapXmlPath = path.join(outDir, 'sitemap.xml');
const publicXslPath = path.resolve('public', 'sitemap.xsl');
const outXslPath = path.join(outDir, 'sitemap.xsl');

// 1. Copy sitemap.xsl to out/ if not already there
if (fs.existsSync(publicXslPath)) {
  fs.copyFileSync(publicXslPath, outXslPath);
  console.log('Copied sitemap.xsl to out/sitemap.xsl');
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
