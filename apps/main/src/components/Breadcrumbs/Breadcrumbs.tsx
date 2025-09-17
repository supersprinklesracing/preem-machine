'use client';
import { toUrlPath } from '@/datastore/paths';
import {
  EventBrief,
  OrganizationBrief,
  PreemBrief,
  RaceBrief,
  SeriesBrief,
} from '@/datastore/schema';
import { Anchor, Breadcrumbs as MantineBreadcrumbs } from '@mantine/core';
import Link from 'next/link';

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
    if ('raceBrief' in currentBrief && currentBrief.raceBrief) {
      currentBrief = currentBrief.raceBrief;
    } else if ('eventBrief' in currentBrief && currentBrief.eventBrief) {
      currentBrief = currentBrief.eventBrief;
    } else if ('seriesBrief' in currentBrief && currentBrief.seriesBrief) {
      currentBrief = currentBrief.seriesBrief;
    } else if (
      'organizationBrief' in currentBrief &&
      currentBrief.organizationBrief
    ) {
      currentBrief = currentBrief.organizationBrief;
    } else {
      currentBrief = undefined;
    }
  }

  const items = breadcrumbs
    .filter((b): b is NonNullable<Brief> => b !== null)
    .map((b) => (
      <Anchor
        component={Link}
        href={`/${toUrlPath(b.path)}`}
        key={b.path}
        size="sm"
        c="dimmed"
      >
        {b.name}
      </Anchor>
    ));

  return <MantineBreadcrumbs>{items}</MantineBreadcrumbs>;
}
