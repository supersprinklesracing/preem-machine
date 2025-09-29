'use client';

import { Button, Group, SimpleGrid, Stack, Title } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import Link from 'next/link';

import { SeriesCard } from '@/components/cards/SeriesCard';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { toUrlPath } from '@/datastore/paths';
import { SeriesWithEvents } from '@/datastore/query-schema';
import { Organization } from '@/datastore/schema';

interface Props {
  organization: Pick<Organization, 'name' | 'path'>;
  serieses: SeriesWithEvents[];
}

export function LiveOrganization({ organization, serieses }: Props) {
  return (
    <MultiPanelLayout>
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
              <SeriesCard key={series.path} series={series}>
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
    </MultiPanelLayout>
  );
}
