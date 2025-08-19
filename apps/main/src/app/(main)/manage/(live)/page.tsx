import { getRenderableHubDataForPage } from '@/datastore/firestore';
import Hub from './Hub';

export default async function LiveOrganizationPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const data = await getRenderableHubDataForPage((await params).orgId);

  return <Hub data={data} />;
}
