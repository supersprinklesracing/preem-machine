import { getRenderableOrganizationDataForPage } from '@/datastore/firestore';
import { notFound } from 'next/navigation';
import Organization from './Organization';

export default async function OrganizationPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getRenderableOrganizationDataForPage(params.id);

  if (!data) {
    notFound();
  }

  return <Organization data={data} />;
}
