'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { LeadCaptureProvider } from '@/context/LeadCaptureContext';
import { LeadCaptureModal } from '@/components/common/LeadCaptureModal';

/**
 * Single client-component island hosting every cross-cutting provider.
 * Outer-to-inner order: Theme (DOM-affecting) -> Auth (session) -> Toast
 * (UI-only) -> Cart / Wishlist (interest buckets) -> LeadCapture (modal flow).
 *
 * LeadCaptureProvider is innermost so the modal it renders can call hooks
 * from every outer context (cart, auth, toast). The modal lives next to the
 * children so it overlays the entire app and can be triggered from anywhere
 * through `useLeadCapture().open(...)`.
 */
export const Providers = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <LeadCaptureProvider>
              {children}
              <LeadCaptureModal />
            </LeadCaptureProvider>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
);
