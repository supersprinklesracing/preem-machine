'use client';
import {
  Anchor,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconChevronRight, IconWorldWww } from '@tabler/icons-react';
import Link from 'next/link';

import { DateLocationDetail } from '@/components/cards/DateLocationDetail';
import { FavoriteButton } from '@/components/FavoriteButton';
import { RaceCard } from '@/components/cards/RaceCard';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { organizationPath, seriesPath, toUrlPath } from '@/datastore/paths';
import { RaceWithPreems } from '@/datastore/query-schema';
import { Event as EventType, User } from '@/datastore/schema';

interface Props {
  event: Pick<
    EventType,
    | 'name'
    | 'seriesBrief'
    | 'path'
    | 'location'
    | 'startDate'
    | 'description'
    | 'website'
    | 'timezone'
  >;
  children: RaceWithPreems[];
  user: User | null;
}

export function Event({ event, children, user }: Props) {
  const series = event.seriesBrief;
  const organization = series.organizationBrief;

  return (
    <MultiPanelLayout>
      <Stack>
        <Group>
          <Title>{event.name}</Title>
          <FavoriteButton
            docRef={{ id: event.path.split('/').pop()!, path: event.path }}
            user={user}
          />
        </Group>
        <Text>
          Part of{' '}
          <Anchor
            component={Link}
            href={`/view/${toUrlPath(seriesPath(event.path))}`}
          >
            {series.name}
          </Anchor>{' '}
          hosted by{' '}
          <Anchor
            component={Link}
            href={`/view/${toUrlPath(organizationPath(event.path))}`}
          >
            {organization.name}
          </Anchor>
        </Text>
        <Group data-testid="event-details">
          <Group>
            <DateLocationDetail {...event} />
          </Group>
          {event.description && <Text>{event.description}</Text>}
          {event.website && (
            <Group gap="xs">
              <IconWorldWww size={16} />
              <Anchor href={event.website} target="_blank" size="sm">
                Official Website
              </Anchor>
            </Group>
          )}
        </Group>
        <Stack>
          <Group justify="space-between">
            <Stack gap={0}>
              <Title order={2}>Race Schedule</Title>
            </Stack>
          </Group>
          <SimpleGrid cols={{ base: 1, lg: 2 }}>
            {children?.map(
              ({ race, children }) =>
                race && (
                  <RaceCard
                    key={race.path}
                    race={race}
                    preems={children}
                    showEventLink={false}
                  >
                    <Button
                      component={Link}
                      href={`/view/${toUrlPath(race.path)}`}
                      variant="light"
                      size="sm"
                      mt="md"
                      rightSection={<IconChevronRight size={14} />}
                    >
                      View
                    </Button>
                  </RaceCard>
                ),
            )}
          </SimpleGrid>
        </Stack>
      </Stack>
    </MultiPanelLayout>
  );
}
