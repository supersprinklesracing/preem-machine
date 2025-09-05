import { getUsers } from '@/datastore/firestore';
import Admin from './Admin';

export default async function AdminPage() {
  const users = await getUsers();
  return <Admin users={users} />;
}
