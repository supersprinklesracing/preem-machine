'use server';

import { verifyAuthUser } from '@/auth/server/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyAuthUser();
  return <>{children}</>;
}
