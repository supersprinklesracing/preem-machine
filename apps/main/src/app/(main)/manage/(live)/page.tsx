import { getRenderableManageDataForPage } from '@/datastore/firestore';
import Hub from './Hub';

export default async function LiveOrganizationPage({
  params,
}: {
  params: { orgId: string };
}) {
  const data = await getRenderableManageDataForPage((await params).orgId);

  return <Hub data={data} />;
}
