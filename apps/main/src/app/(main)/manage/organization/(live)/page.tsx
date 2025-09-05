import { getRenderableOrganizationDataForPage } from '@/datastore/firestore';
import LiveOrganization from './LiveOrganization';

export default async function LiveOrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const data = await getRenderableOrganizationDataForPage(
    (await searchParams).path,
  );
  return <LiveOrganization {...data} />;
}
