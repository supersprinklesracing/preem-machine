'use client';

import { DateLocationDetail } from '@/components/cards/DateLocationDetail';
import EventCard from '@/components/cards/EventCard';
import { organizationPath, toUrlPath } from '@/datastore/paths';
import { EventWithRaces } from '@/datastore/query-schema';
import { Series as SeriesType } from '@/datastore/schema';
import {
  Anchor,
  Button,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconChevronRight, IconWorldWww } from '@tabler/icons-react';
import Link from 'next/link';

interface Props {
  series: Pick<
    SeriesType,
    | 'name'
    | 'path'
    | 'location'
    | 'startDate'
    | 'endDate'
    | 'description'
    | 'website'
    | 'organizationBrief'
    | 'timezone'
  >;
  children: EventWithRaces[];
}

export default function Series({ series, children: eventsWithRaces }: Props) {
  const organization = series.organizationBrief;
  return (
    <Container fluid>
      <Stack>
        <Title>{series.name}</Title>
        <Text>
        Hosted by{' '}
        <Anchor
          component={Link}
          href={`/${toUrlPath(organizationPath(series.path))}`}
        >
          {organization.name}
        </Anchor>
      </Text>
      <Group>
        <DateLocationDetail {...series} />
      </Group>
      {series.description && <Text>{series.description}</Text>}
      <Stack>
        <Group justify="space-between">
          <Stack gap={0}>
            <Title order={2}>Events</Title>
            {series.website && (
              <Group gap="xs">
                <IconWorldWww size={16} />
                <Anchor href={series.website} target="_blank" size="sm">
                  Official Website
                </Anchor>
              </Group>
            )}
          </Stack>
        </Group>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {}
          {eventsWithRaces.map(
            ({ event }) =>
              event && (
                <EventCard key={event.path} event={event}>
                  <Button
                    component={Link}
                    href={`/${toUrlPath(event.path)}`}
                    variant="light"
                    size="sm"
                    mt="md"
                    rightSection={<IconChevronRight size={14} />}
                  >
                    View
                  </Button>
                </EventCard>
              ),
          )}
        </SimpleGrid>
      </Stack>
    </Stack>
  </Container>
  );
}
