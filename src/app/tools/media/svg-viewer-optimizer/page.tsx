import { Metadata } from 'next';
import SvgViewerOptimizer from './SvgViewerOptimizer';

export const metadata: Metadata = {
  title: 'SVG Viewer & Optimizer - Minify SVG Online Free',
  description: 'View, edit, and optimize SVG files online. Minify SVG code, remove metadata, and reduce file size instantly for free.',
  keywords: ['svg viewer', 'svg optimizer', 'minify svg', 'svg editor', 'online svg tool'],
};

export default function Page() {
  return <SvgViewerOptimizer />;
}
