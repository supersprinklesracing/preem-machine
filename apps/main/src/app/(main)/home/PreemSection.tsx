'use client';

import { SimpleGrid, Text } from '@mantine/core';

import { PreemCard } from '@/components/cards/PreemCard';
import { Preem } from '@/datastore/schema';

interface Props {
  preems: Preem[];
}

export function PreemSection({ preems }: Props) {
  if (preems.length === 0) {
    return <Text>No upcoming preems.</Text>;
  }

  return (
    <SimpleGrid data-testid="preems-display" cols={{ base: 1, md: 2, xl: 3 }}>
      {preems.map((preem) => (
        <PreemCard key={preem.path} preem={preem} />
      ))}
    </SimpleGrid>
  );
}
