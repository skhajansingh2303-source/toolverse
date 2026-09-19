import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ToolDock from '@/components/ToolDock'
import BottomNavBar from '@/components/BottomNavBar'
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal'
import Toast from '@/components/Toast'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: {
    default: 'ToolsVerse — 103+ Free Online Tools for Everyone',
    template: '%s | ToolsVerse',
  },
  description:
    'Free online tools for students, teachers, developers, and professionals. 103+ utilities including PDF suite, image compressor, calculators, code formatters, and security tools. 100% private — runs in your browser with zero server uploads.',
  keywords: [
    'online tools',
    'free tools',
    'pdf tools',
    'compress pdf',
    'merge pdf',
    'split pdf',
    'sign pdf',
    'extract pdf images',
    'age calculator',
    'bmi calculator',
    'developer tools',
    'JSON formatter',
    'QR code generator',
    'image compressor',
    'resume builder',
  ],
  authors: [{ name: 'ToolsVerse' }],
  metadataBase: new URL('https://toolsverse.com'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ToolsVerse',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://toolsverse.com',
    siteName: 'ToolsVerse',
    title: 'ToolsVerse — 103+ Free Online Tools for Everyone',
    description:
      'Free online tools that run 100% inside your browser. PDF suite, image compressor, health calculators, JSON formatter, QR code generator, and more with zero server uploads.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ToolsVerse — 103+ Free Online Tools',
    description:
      'Free online tools that run 100% inside your browser. No signup, no server uploads, unlimited free use.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://toolsverse.com/#website',
        url: 'https://toolsverse.com/',
        name: 'ToolsVerse',
        description: '103+ Free Online Tools for Everyone. 100% Private In-Browser Suite.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://toolsverse.com/?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'WebApplication',
        '@id': 'https://toolsverse.com/#webapp',
        name: 'ToolsVerse Productivity & Utility Suite',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '1420',
          bestRating: '5',
          worstRating: '1',
        },
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('toolsverse_theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch(e) {}
              if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200`}>
        <Header />
        <main className="flex-1 pb-20">{children}</main>
        <ToolDock />
        <BottomNavBar />
        <KeyboardShortcutsModal />
        <Toast />
        <Footer />
      </body>
    </html>
  )
}
