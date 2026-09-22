import fs from 'node:fs';
import path from 'node:path';
import { tools, getToolUrl } from '../src/lib/tools.ts';

const footerPath = path.resolve('src', 'components', 'Footer.tsx');
let content = fs.readFileSync(footerPath, 'utf8');

for (const tool of tools) {
  const oldUrl = `href="/tools/${tool.slug}"`;
  const newUrl = `href="${getToolUrl(tool)}"`;
  content = content.replaceAll(oldUrl, newUrl);
}

fs.writeFileSync(footerPath, content, 'utf8');
console.log('Successfully updated Footer.tsx tool URLs to categorized URLs!');
