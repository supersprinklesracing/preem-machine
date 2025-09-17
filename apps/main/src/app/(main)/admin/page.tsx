import { getOrganizations, getUsers } from '@/datastore/server/query/query';
import { Admin } from './Admin';
import { verifyUserContext, hasUserRole } from '@/user/server/user';
import { redirect } from 'next/navigation';

async function AdminPage() {
  const { authUser } = await verifyUserContext();
  const isAdmin = await hasUserRole('admin', authUser);

  if (!isAdmin) {
    redirect('/');
  }

  const users = await getUsers();
  const organizations = await getOrganizations();
  return <Admin users={users} organizations={organizations} />;
}

export default AdminPage;
