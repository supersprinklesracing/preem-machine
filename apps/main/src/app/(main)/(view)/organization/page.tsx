import { getRenderableOrganizationDataForPage } from '@/datastore/firestore';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import Organization from './Organization';

export default async function OrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderableOrganizationDataForPage(path);
  return <Organization {...data} />;
}
