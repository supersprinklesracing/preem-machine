import { getRenderableManageDataForPage } from '@/datastore/firestore';
import Manage from './Manage';

export default async function ManagePage() {
  // TODO: get the real user's organization
  const data = await getRenderableManageDataForPage('org-1');

  return <Manage data={data} />;
}
