'use client';

import { toUrlPath } from '@/datastore/paths';
import SeriesCard from '@/components/cards/SeriesCard';
import { SeriesWithEvents } from '@/datastore/firestore';
import type { ClientCompat, Organization } from '@/datastore/types';
import { Button, Group, SimpleGrid, Stack, Title } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import Link from 'next/link';

interface Props {
  organization: ClientCompat<Organization>;
  serieses: SeriesWithEvents[];
}

export default function LiveOrganization({ organization, serieses }: Props) {
  return (
    <Stack>
      <Group justify="space-between">
        <Title>{organization.name}</Title>
        <Button
          variant="outline"
          leftSection={<IconPencil size={14} />}
          size="xs"
          component={Link}
          href={`/manage/${toUrlPath(organization.path)}/edit`}
        >
          Edit Organization
        </Button>
      </Group>
      <Stack>
        <Title order={2}>Series Schedule</Title>
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          {serieses?.map(({ series }) => (
            <SeriesCard key={series.id} series={series}>
              <Button
                component={Link}
                href={`/manage/${toUrlPath(series.path)}`}
                fullWidth
                mt="md"
                variant="outline"
              >
                Live
              </Button>
            </SeriesCard>
          ))}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
