import AutoToolSeo from '@/components/AutoToolSeo';
import SetPdfViewerPreferences from './SetPdfViewerPreferences';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/edit-pdf/set-pdf-viewer-preferences/',
  },
  title: 'PDF Viewer Preferences - Set Default Zoom & View Mode Online',
  description: 'Configure how PDF readers display your document: default zoom, two-page layout, and UI visibility.',
  keywords: [
    'pdf viewer preferences',
    'pdf open action',
    'pdf display mode',
    'set pdf layout',
    'pdf hide toolbar',
    'pdf default zoom',
    'pdf reader settings',
    'pdf presentation mode'
  ],
};

export default function Page() {
  return (
    <>
      <SetPdfViewerPreferences />
      <AutoToolSeo slug="set-pdf-viewer-preferences" />
    </>
  );
}
