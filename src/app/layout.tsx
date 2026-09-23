import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ToolDock from '@/components/ToolDock'
import BottomNavBar from '@/components/BottomNavBar'
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal'
import Toast from '@/components/Toast'
import GoogleTranslator from '@/components/GoogleTranslator'
import CookieConsent from '@/components/CookieConsent'
import { LANGUAGE_CODES, SUPPORTED_LANGUAGES } from '@/lib/languages'

const inter = Inter({ subsets: ['latin'] })

const languageAlternates: Record<string, string> = {
  'x-default': 'https://toolsverseapp.com/',
};
for (const code of LANGUAGE_CODES) {
  languageAlternates[code] = `https://toolsverseapp.com/?lang=${code}`;
}

export const viewport: Viewport = {
  themeColor: '#e11d48',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: {
    default: 'ToolsVerse App — 103+ Free Online Tools for Everyone (iLovePDF & Smallpdf Alternative)',
    template: '%s | ToolsVerse App',
  },
  description:
    'Free online tools for students, teachers, developers, and professionals. 103+ utilities including PDF suite, image compressor, calculators, code formatters, and security tools. 100% private — runs in your browser with zero server uploads.',
  keywords: [
    'toolsverse',
    'toolsverse app',
    'toolsverseapp.com',
    'ilovepdf alternative',
    'smallpdf alternative',
    'free pdf tools',
    'online tools',
    'compress pdf',
    'merge pdf',
    'split pdf',
    'sign pdf',
    'extract pdf images',
    'pdf to word',
    'word to pdf',
    'image compressor',
    'developer tools',
    'JSON formatter',
    'QR code generator',
    'age calculator',
    'bmi calculator',
    // Italian Search Keywords (Italy / San Marino / Switzerland)
    'comprimere pdf',
    'unire pdf',
    'dividere pdf',
    'firmare pdf',
    'convertire pdf in word',
    'modificare pdf online gratis',
    'estrarre pagine pdf',
    // Chinese Search Keywords (China / Taiwan / Hong Kong / Singapore)
    '压缩PDF',
    '合并PDF',
    '拆分PDF',
    'PDF转换器',
    'PDF转Word',
    'Word转PDF',
    'PDF在线工具',
    'PDF签名',
    'PDF解密',
    // Spanish Search Keywords (Spain / Mexico / Latin America)
    'comprimir pdf gratis',
    'unir pdf',
    'dividir pdf',
    'convertir pdf a word',
    'firmar pdf',
    // French Search Keywords (France / Canada / Belgium)
    'compresser pdf',
    'fusionner pdf',
    'diviser pdf',
    'convertir pdf en word',
    // German Search Keywords (Germany / Austria / Switzerland)
    'PDF komprimieren',
    'PDF zusammenfügen',
    'PDF umwandeln',
    // Hindi Search Keywords (India)
    'पीडीएफ कंप्रेस',
    'पीडीएफ मर्ज',
  ],
  authors: [{ name: 'ToolsVerse App' }],
  metadataBase: new URL('https://toolsverseapp.com'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ToolsVerse App',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://toolsverseapp.com',
    siteName: 'ToolsVerse App',
    title: 'ToolsVerse App — 103+ Free Online Tools for Everyone',
    description:
      'Free online tools that run 100% inside your browser. PDF suite, image compressor, health calculators, JSON formatter, QR code generator, and more with zero server uploads.',
    images: [
      {
        url: 'https://toolsverseapp.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ToolsVerse - 103+ Free Online Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ToolsVerse App — 103+ Free Online Tools',
    description:
      'Free online tools that run 100% inside your browser. No signup, no server uploads, unlimited free use.',
    images: ['https://toolsverseapp.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'google-adsense-account': 'ca-pub-1902327524390179',
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
        '@id': 'https://toolsverseapp.com/#website',
        url: 'https://toolsverseapp.com/',
        name: 'ToolsVerse App',
        alternateName: ['ToolsVerse', 'ToolsVerseApp'],
        inLanguage: LANGUAGE_CODES,
        description: '103+ Free Online Tools for Everyone. 100% Private In-Browser Suite.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://toolsverseapp.com/?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://toolsverseapp.com/#organization',
        name: 'ToolsVerse App',
        url: 'https://toolsverseapp.com',
        logo: 'https://toolsverseapp.com/icon.svg',
        areaServed: [
          'IT', 'CN', 'US', 'GB', 'ES', 'FR', 'DE', 'IN', 'JP', 'BR',
          'KR', 'RU', 'MX', 'ID', 'TR', 'NL', 'PL', 'VN', 'TH', 'Global'
        ],
      },
      {
        '@type': 'WebApplication',
        '@id': 'https://toolsverseapp.com/#webapp',
        name: 'ToolsVerse App Productivity & Utility Suite',
        url: 'https://toolsverseapp.com/',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        inLanguage: LANGUAGE_CODES,
        availableLanguage: SUPPORTED_LANGUAGES.map((l) => ({
          '@type': 'Language',
          name: l.name,
          alternateName: l.code,
        })),
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '1540',
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://toolsverseapp.com/#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is ToolsVerse App completely free to use without daily limits?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! ToolsVerse App is 100% free with unlimited usage. Unlike cloud services such as iLovePDF or Smallpdf that impose daily conversion caps and subscription paywalls, ToolsVerse processes files on your local device without restrictions.',
            },
          },
          {
            '@type': 'Question',
            name: 'How is ToolsVerse App different from iLovePDF and Smallpdf?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Unlike traditional cloud converters that upload your confidential documents to external servers, ToolsVerse App executes 100% client-side in your web browser using WebAssembly and HTML5 Canvas. Your documents and files never leave your computer.',
            },
          },
          {
            '@type': 'Question',
            name: 'Are my confidential documents, contracts, and images safe?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Absolutely. Because all calculations, PDF merges, splits, compressions, and conversions run directly in your browser, no server upload takes place. Your confidential data remains completely private on your device.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can ToolsVerse App be installed or used offline?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! ToolsVerse App is a Progressive Web App (PWA) with full service worker caching. You can install it on Windows, macOS, Android, and iOS to use utilities even without an active internet connection.',
            },
          },
        ],
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
              try {
                if (window.location.hostname.endsWith('.pages.dev')) {
                  var r = document.querySelector('meta[name="robots"]');
                  if (r) {
                    r.setAttribute('content', 'noindex, nofollow, noarchive');
                  } else {
                    var meta = document.createElement('meta');
                    meta.name = 'robots';
                    meta.content = 'noindex, nofollow, noarchive';
                    document.head.appendChild(meta);
                  }
                }
              } catch(e) {}
              if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    reg.update();
                  }).catch(function() {});
                });
              }
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-TQHCS9HWNJ"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TQHCS9HWNJ');
            `,
          }}
        />
        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1902327524390179"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200`}>
        <Header />
        <main className="flex-1 pb-20">{children}</main>
        <ToolDock />
        <BottomNavBar />
        <KeyboardShortcutsModal />
        <Toast />
        <GoogleTranslator />
        <CookieConsent />
        <Footer />
      </body>
    </html>
  )
}
