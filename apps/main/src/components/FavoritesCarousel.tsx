'use client';

import { Carousel } from '@mantine/carousel';
import { Card, Title, Text, Button, Stack } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { toUrlPath } from '@/datastore/paths';
import { DocRef } from '@/datastore/schema';

interface Props {
  favorites: DocRef[];
}

export function FavoritesCarousel({ favorites }: Props) {
  if (favorites.length === 0) {
    return null;
  }

  return (
    <Stack>
      <Title order={2}>Favorites</Title>
      <Carousel
        withIndicators
        height={200}
        slideSize="33.333333%"
        slideGap="md"
      >
        {favorites.map((favorite) => (
          <Carousel.Slide key={favorite.path}>
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Text fw={500}>{favorite.path.split('/')[0]}</Text>
              <Text size="sm" c="dimmed">
                {favorite.path.split('/')[1]}
              </Text>

              <Button
                variant="light"
                color="blue"
                fullWidth
                mt="md"
                radius="md"
                component={Link}
                href={`/view/${toUrlPath(favorite.path)}`}
                rightSection={<IconChevronRight size={16} />}
              >
                View
              </Button>
            </Card>
          </Carousel.Slide>
        ))}
      </Carousel>
    </Stack>
  );
}
