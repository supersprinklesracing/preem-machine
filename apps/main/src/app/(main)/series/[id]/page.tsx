import {
  getOrganizationById,
  getRaceSeriesById,
} from '@/datastore/data-access';
import { Stack, Text, Title, Anchor } from '@mantine/core';
import { format } from 'date-fns';
import Link from 'next/link';
import Series from './Series';

export default async function SeriesPage({
  params,
}: {
  params: { id: string };
}) {
  const series = await getRaceSeriesById(params.id);
  const organization = series
    ? await getOrganizationById(series.organizationId)
    : undefined;

  if (!series || !organization) {
    return <div>Series not found</div>;
  }

  return (
    <Stack>
      <Title>{series.name}</Title>
      <Text>
        Hosted by{' '}
        <Anchor component={Link} href={`/organization/${organization.id}`}>
          {organization.name}
        </Anchor>
      </Text>
      <Text c="dimmed">
        {series.region} | {format(new Date(series.startDate), 'PP')} -{' '}
        {format(new Date(series.endDate), 'PP')}
      </Text>
      <Series series={series as any} />
    </Stack>
  );
}
