import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { CommonLayout } from '@/components/layout/CommonLayout';
import { getOrganizations, getUsers } from '@/datastore/server/query/query';
import { hasUserRole, requireLoggedInUserContext } from '@/user/server/user';

import { Admin } from './Admin';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Admin',
  };
}

async function AdminPage() {
  const { authUser } = await requireLoggedInUserContext();
  const isAdmin = await hasUserRole('admin', authUser);

  if (!isAdmin) {
    redirect('/');
  }

  const users = await getUsers();
  const organizations = await getOrganizations();
  return (
    <CommonLayout>
      <Admin users={users} organizations={organizations} />
    </CommonLayout>
  );
}

export default AdminPage;
