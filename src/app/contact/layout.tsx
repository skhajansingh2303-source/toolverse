import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Support & Feedback',
  description: 'Get in touch with ToolsVerse App team. Submit tool suggestions, technical feedback, bug reports, and partnership inquiries.',
  alternates: {
    canonical: 'https://toolsverseapp.com/contact/',
  },
  openGraph: {
    title: 'Contact Support & Feedback | ToolsVerse App',
    description: 'Get in touch with ToolsVerse App team. Submit tool suggestions, technical feedback, bug reports, and partnership inquiries.',
    url: 'https://toolsverseapp.com/contact/',
    siteName: 'ToolsVerse App',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Support & Feedback | ToolsVerse App',
    description: 'Get in touch with ToolsVerse App team. Submit tool suggestions, technical feedback, bug reports, and partnership inquiries.',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
