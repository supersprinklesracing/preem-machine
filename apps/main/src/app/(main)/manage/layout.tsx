'use server';

import { verifyAuthUser } from '@/auth/user';

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyAuthUser();
  return <>{children}</>;
}
