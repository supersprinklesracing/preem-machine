'use client';
import { Anchor, Breadcrumbs as MantineBreadcrumbs, Text } from '@mantine/core';
import Link from 'next/link';

import { toUrlPath } from '@/datastore/paths';
import {
  EventBrief,
  OrganizationBrief,
  PreemBrief,
  RaceBrief,
  SeriesBrief,
} from '@/datastore/schema';

type Brief =
  | OrganizationBrief
  | SeriesBrief
  | EventBrief
  | RaceBrief
  | PreemBrief
  | null;

export function Breadcrumbs({ brief }: { brief: Brief | undefined }) {
  if (!brief) {
    return null;
  }

  const breadcrumbs: Brief[] = [];
  let currentBrief: Brief | undefined = brief;

  while (currentBrief) {
    breadcrumbs.unshift(currentBrief);
    currentBrief =
      ('raceBrief' in currentBrief ? currentBrief.raceBrief : undefined) ??
      ('eventBrief' in currentBrief ? currentBrief.eventBrief : undefined) ??
      ('seriesBrief' in currentBrief ? currentBrief.seriesBrief : undefined) ??
      ('organizationBrief' in currentBrief
        ? currentBrief.organizationBrief
        : undefined);
  }

  const filteredBreadcrumbs = breadcrumbs.filter(
    (b): b is NonNullable<Brief> => b !== null,
  );
  const items = filteredBreadcrumbs.map((b, index) => {
    const isLast = index === filteredBreadcrumbs.length - 1;
    if (isLast) {
      return (
        <Text key={b.path} size="sm">
          {b.name}
        </Text>
      );
    }
    return (
      <Anchor
        component={Link}
        href={`/view/${toUrlPath(b.path)}`}
        key={b.path}
        size="sm"
        c="dimmed"
      >
        {b.name}
      </Anchor>
    );
  });

  return <MantineBreadcrumbs>{items}</MantineBreadcrumbs>;
}
