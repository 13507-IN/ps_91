import type { Metadata, Viewport } from 'next';
import { Providers } from '@/lib/api/Providers';
import GovHeaderBar from '@/components/GovHeaderBar';
import GovFooter from '@/components/govFooter';
import LanguagePickerModal from '@/components/LanguagePickerModal';
import PWARegistry from '@/components/pwa/pwa-registry';
import '../styles/index.css';

export const metadata: Metadata = {
  title: {
    default: 'UdyamSetu AI — Enterprise Intelligence for Rural Entrepreneurs',
    template: '%s | UdyamSetu AI',
  },
  description:
    'Hyper-local market intelligence, financial planning, risk analysis and funding readiness for rural entrepreneurs.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'UdyamSetu',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1A3A6B' },
    { media: '(prefers-color-scheme: dark)', color: '#0f2340' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <Providers>
          <PWARegistry />
          <LanguagePickerModal />
          <GovHeaderBar />
          <main id="main-content" className="flex-1">{children}</main>
          <GovFooter />
        </Providers>
      </body>
    </html>
  );
}