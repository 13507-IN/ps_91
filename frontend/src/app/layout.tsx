declare module '*.css';

import type { Metadata } from 'next';
import { Providers } from '@/lib/api/Providers';
import GovHeaderBar from '@/components/GovHeaderBar';
import GovFooter from '@/components/govFooter';
import LanguagePickerModal from '@/components/LanguagePickerModal';
import '../styles/index.css';

export const metadata: Metadata = {
  title: {
    default: 'UdyamSetu AI — Enterprise Intelligence for Rural Entrepreneurs',
    template: '%s | UdyamSetu AI',
  },
  description:
    'Hyper-local market intelligence, financial planning, risk analysis and funding readiness for rural entrepreneurs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans">
        <Providers>
          <LanguagePickerModal />
          <GovHeaderBar />
          <main id="main-content" className="flex-1">{children}</main>
          <GovFooter />
        </Providers>
      </body>
    </html>
  );
}