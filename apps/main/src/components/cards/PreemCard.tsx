import { Preem } from '@/datastore/schema';
import {
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  TitleOrder,
  Anchor,
} from '@mantine/core';
import {
  IconSparkles,
} from '@tabler/icons-react';
import React from 'react';
import { MetadataItem, MetadataRow } from './MetadataRow';
import Link from 'next/link';
import { toUrlPath } from '@/datastore/paths';

interface PreemCardProps {
  preem: Preem;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  withBorder?: boolean;
  titleOrder?: TitleOrder;
}

const PreemCard: React.FC<PreemCardProps> = ({
  preem,
  children,
  style,
  withBorder = true,
  titleOrder = 3,
}) => {
  const metadataItems: MetadataItem[] = [];
  if (preem.prizePool && preem.prizePool > 0) {
    metadataItems.push({
      key: 'prize-pool',
      icon: (
        <IconSparkles
          size={18}
          color={
            preem.prizePool > 100
              ? 'var(--mantine-color-green-6)'
              : 'currentColor'
          }
        />
      ),
      label: (
        <Text
          size="lg"
          fw={500}
          c={preem.prizePool > 100 ? 'green' : 'inherit'}
        >
          Prize Pool ${preem.prizePool.toLocaleString()}
        </Text>
      ),
    });
  }

  return (
    <Card
      data-testid={`preem-card-${preem.id}`}
      withBorder={withBorder}
      padding="lg"
      radius="md"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...style,
      }}
    >
      <Grid gutter="lg" style={{ flexGrow: 1 }}>
        <Grid.Col span={{ base: 12 }}>
          <Stack justify="space-between" style={{ height: '100%' }}>
            <div>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Group align="center" gap="md">
                    <Title order={titleOrder}>{preem.name}</Title>
                  </Group>
                  <Text c="dimmed">
                    Part of{' '}
                    <Anchor
                      component={Link}
                      href={`/${toUrlPath(preem.raceBrief.path)}`}
                    >
                      {preem.raceBrief.name}
                    </Anchor>
                  </Text>
                </div>
              </Group>

              <Text size="sm" mt="md" mb="md">
                {preem.description}
              </Text>

              <MetadataRow items={metadataItems} />
            </div>
            {children}
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
};

export default PreemCard;
