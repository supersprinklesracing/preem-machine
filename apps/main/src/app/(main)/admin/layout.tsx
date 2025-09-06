'use server';

import { verifyAuthUser } from '@/auth/user';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyAuthUser();
  return <>{children}</>;
}
