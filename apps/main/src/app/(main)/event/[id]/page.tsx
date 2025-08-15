import {
  getEventById,
  getOrganizationBySeriesId,
  getSeriesByEventId,
} from '@/datastore/data-access';
import { Stack, Text, Title, Anchor } from '@mantine/core';
import { format } from 'date-fns';
import Link from 'next/link';
import Event from './Event';

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEventById(params.id);
  const series = event ? await getSeriesByEventId(event.id) : undefined;
  const organization = series
    ? await getOrganizationBySeriesId(series.id)
    : undefined;

  if (!event || !series || !organization) {
    return <div>Event not found</div>;
  }

  return (
    <Stack>
      <Title>{event.name}</Title>
      <Text>
        Part of{' '}
        <Anchor component={Link} href={`/series/${series.id}`}>
          {series.name}
        </Anchor>{' '}
        hosted by{' '}
        <Anchor component={Link} href={`/organization/${organization.id}`}>
          {organization.name}
        </Anchor>
      </Text>
      <Text c="dimmed">
        {event.location} | {format(new Date(event.dateTime), 'PP p')}
      </Text>
      <Event event={event} />
    </Stack>
  );
}
