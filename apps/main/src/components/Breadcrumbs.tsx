'use client';

import { Breadcrumbs as MantineBreadcrumbs } from '@mantine/core';
import { useBreadcrumbs } from './useBreadcrumbs';

export function Breadcrumbs() {
  const items = useBreadcrumbs();

  if (items.length === 0) {
    return null;
  }

  return <MantineBreadcrumbs>{items}</MantineBreadcrumbs>;
}
