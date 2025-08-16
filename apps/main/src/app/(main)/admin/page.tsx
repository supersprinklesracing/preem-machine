import { getRenderableAdminDataForPage } from '@/datastore/firestore';
import Admin from './Admin';

export default async function AdminPage() {
  const data = await getRenderableAdminDataForPage();
  return <Admin data={data} />;
}
