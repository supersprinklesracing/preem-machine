import { getDoc } from '@/datastore/firestore';
import { toUrlPath } from '@/datastore/paths';
import {
  Brief,
  EventBrief,
  OrganizationBrief,
  PreemBrief,
  RaceBrief,
  SeriesBrief,
} from '@/datastore/types';
import { Anchor } from '@mantine/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type BreadcrumbBrief =
  | OrganizationBrief
  | SeriesBrief
  | EventBrief
  | RaceBrief
  | PreemBrief
  | null;

export function useBreadcrumbs() {
  const pathname = usePathname();
  const [brief, setBrief] = useState<Brief | undefined>(undefined);

  useEffect(() => {
    const pathParts = pathname ? pathname.split('/').filter((p) => p) : [];
    if (pathParts.length < 2) {
      setBrief(null);
      return;
    }

    const fetchBrief = async () => {
      try {
        const doc = await getDoc<Brief>(pathParts.join('/'));
        setBrief(doc);
      } catch (error) {
        console.error('Failed to fetch brief for breadcrumbs:', error);
        setBrief(null);
      }
    };

    fetchBrief();
  }, [pathname]);

  if (!brief) {
    return [];
  }

  const breadcrumbs: BreadcrumbBrief[] = [];
  let currentBrief: BreadcrumbBrief | undefined = brief;

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
    .filter((b): b is NonNullable<BreadcrumbBrief> => b !== null)
    .map((b) => (
      <Anchor component={Link} href={`/${toUrlPath(b.path)}`} key={b.path}>
        {b.name}
      </Anchor>
    ));

  return items;
}
