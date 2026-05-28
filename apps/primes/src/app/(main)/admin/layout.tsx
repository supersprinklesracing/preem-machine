'use server';

import { requireLoggedInUserContext } from '@/user/server/user';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireLoggedInUserContext();
  return <>{children}</>;
}
