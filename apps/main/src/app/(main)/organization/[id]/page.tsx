import {
  getOrganizationById,
  getRaceSeriesForOrganization,
  getUsersByOrganizationId,
} from '@/datastore/data-access';
import { Stack, Title } from '@mantine/core';
import Organization from './Organization';

export default async function OrganizationPage({
  params,
}: {
  params: { id: string };
}) {
  const organization = await getOrganizationById(params.id);
  const series = await getRaceSeriesForOrganization(params.id);
  const members = await getUsersByOrganizationId(params.id);

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return (
    <Stack>
      <Title>{organization.name}</Title>
      <Organization
        organization={organization}
        series={series}
        members={members}
      />
    </Stack>
  );
}
