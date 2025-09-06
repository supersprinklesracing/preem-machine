'use server';

import { verifyAuthUser } from '@/auth/user';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyAuthUser();
  return <>{children}</>;
}
