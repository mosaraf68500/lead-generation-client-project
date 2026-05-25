import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PopupLeadCapture } from '@/components/common/PopupLeadCapture';
import { StickyLeadCta } from '@/components/common/StickyLeadCta';

export const MarketingLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen flex-col bg-surface-muted dark:bg-ink-900">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
    {/* Global lead-generation surfaces — only active on marketing routes. */}
    <StickyLeadCta />
    <PopupLeadCapture />
  </div>
);
