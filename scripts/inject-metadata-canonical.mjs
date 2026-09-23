import fs from 'fs';
import { execSync } from 'child_process';

const pages = execSync('find src/app/tools -mindepth 3 -maxdepth 3 -name page.tsx', { encoding: 'utf8' }).trim().split('\n');
const BASE_URL = 'https://toolsverseapp.com';

let count = 0;
for (const p of pages) {
  let content = fs.readFileSync(p, 'utf8');
  if (content.includes('canonical:')) {
    continue;
  }

  const parts = p.split('/');
  const category = parts[3];
  const slug = parts[4];
  const canonicalUrl = `${BASE_URL}/tools/${category}/${slug}/`;

  // Insert alternates inside metadata
  // Look for: export const metadata: Metadata = {
  const metadataIdx = content.indexOf('export const metadata');
  if (metadataIdx !== -1) {
    const openingBraceIdx = content.indexOf('{', metadataIdx);
    if (openingBraceIdx !== -1) {
      const insertion = `\n  alternates: {\n    canonical: '${canonicalUrl}',\n  },`;
      content = content.slice(0, openingBraceIdx + 1) + insertion + content.slice(openingBraceIdx + 1);
      fs.writeFileSync(p, content, 'utf8');
      count++;
    }
  }
}

console.log(`Successfully added native Next.js canonical metadata to ${count} tool pages!`);
