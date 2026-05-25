import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/services/session';

/**
 * Dashboard group layout: requires a session for any page under it. Per-role
 * narrowing happens in each individual page so we can return early before
 * fetching data the caller isn't allowed to see.
 */
const DashboardGroupLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getServerSession();
  if (!user) redirect('/login');
  return <>{children}</>;
};

export default DashboardGroupLayout;
