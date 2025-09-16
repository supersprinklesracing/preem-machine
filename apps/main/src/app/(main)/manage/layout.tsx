'use server';

import { verifyUserContext } from '@/user/server/user';

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyUserContext();
  return <>{children}</>;
}
