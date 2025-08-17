import { getRenderableManageDataForPage } from '@/datastore/firestore';
import Manage from './Manage';

export default async function ManagePage({
  params,
}: {
  params: { orgId: string };
}) {
  const data = await getRenderableManageDataForPage((await params).orgId);

  return <Manage data={data} />;
}
