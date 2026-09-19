import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ToolDock from '@/components/ToolDock'
import BottomNavBar from '@/components/BottomNavBar'
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal'
import Toast from '@/components/Toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'ToolsVerse — 85 Free Online Tools for Everyone',
    template: '%s | ToolsVerse',
  },
  description:
    'Free online tools for students, teachers, developers, and employees. PDF suite, age calculator, BMI calculator, JSON formatter, QR code generator, image compressor, and 80+ more. 100% private — runs in your browser.',
  keywords: [
    'online tools',
    'free tools',
    'pdf tools',
    'merge pdf',
    'split pdf',
    'sign pdf',
    'age calculator',
    'bmi calculator',
    'developer tools',
    'JSON formatter',
    'QR code generator',
    'image compressor',
  ],
  authors: [{ name: 'ToolsVerse' }],
  metadataBase: new URL('https://toolsverse.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://toolsverse.com',
    siteName: 'ToolsVerse',
    title: 'ToolsVerse — Free Online Tools for Everyone',
    description:
      'Free online tools that run in your browser. PDF suite, health calculators, JSON formatter, QR code generator, image compressor, and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ToolsVerse — Free Online Tools',
    description:
      'Free online tools that run in your browser. No signup, no upload.',
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
            `,
          }}
        />
        {/* Google AdSense — Replace ca-pub-XXXXXXXXXXXXXXXX with your publisher ID */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous"></script> */}
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
