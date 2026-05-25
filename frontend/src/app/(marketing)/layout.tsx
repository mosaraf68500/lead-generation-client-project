import type { ReactNode } from 'react';
import { MarketingLayout } from '@/components/layout/MarketingLayout';

const Layout = ({ children }: { children: ReactNode }) => <MarketingLayout>{children}</MarketingLayout>;

export default Layout;
