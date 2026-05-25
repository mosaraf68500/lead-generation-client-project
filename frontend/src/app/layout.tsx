import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/context/Providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Smart Earning Pro - E-learning that turns skills into income',
    template: '%s | Smart Earning Pro',
  },
  description:
    'Career-focused online courses taught by industry experts. Master in-demand skills, build a portfolio, and unlock new income streams.',
  metadataBase: new URL(process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'),
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={inter.variable}>
    <body className="font-sans">
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
