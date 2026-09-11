import type { Metadata, Viewport } from 'next';
import { Providers } from '@/lib/api/Providers';
import GovHeaderBar from '@/components/GovHeaderBar';
import GovFooter from '@/components/govFooter';
import LanguagePickerModal from '@/components/LanguagePickerModal';
import ChatWidget from '@/components/ChatBot/ChatWidget';
import PWARegistry from '@/components/pwa/pwa-registry';
import { Toaster } from 'react-hot-toast';
import '../styles/index.css';

export const metadata: Metadata = {
  title: {
    default: 'ArthSetu — Enterprise Intelligence for Rural Entrepreneurs',
    template: '%s | ArthSetu',
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
          <ChatWidget />
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#1e293b',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#fff' },
              }
            }} 
          />
        </Providers>
      </body>
    </html>
  );
}