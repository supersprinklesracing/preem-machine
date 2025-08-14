import { getUsers } from '@/datastore/data-access';
import Admin from './Admin';

export default async function AdminPage() {
  const users = await getUsers();
  return <Admin users={users} />;
}
