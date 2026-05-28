'use server';

import { requireLoggedInUserContext } from '@/user/server/user';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireLoggedInUserContext();
  return <>{children}</>;
}
