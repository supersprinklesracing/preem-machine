import { getRenderableOrganizationDataForPage } from '@/datastore/firestore';
import Organization from './Organization';

export default async function OrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const data = await getRenderableOrganizationDataForPage(
    (await searchParams).path,
  );
  return <Organization {...data} />;
}
