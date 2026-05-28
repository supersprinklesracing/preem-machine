import { TitleOrder } from '@mantine/core';
import React from 'react';

import { Organization } from '@/datastore/schema';

import { ContentCard } from './ContentCard';

interface OrganizationCardProps {
  organization: Organization;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  withBorder?: boolean;
  titleOrder?: TitleOrder;
}

export function OrganizationCard({
  organization,
  children,
  style,
  withBorder = true,
  titleOrder = 3,
}: OrganizationCardProps) {
  return (
    <ContentCard
      title={organization.name}
      rightColumnBottom={children}
      style={style}
      withBorder={withBorder}
      titleOrder={titleOrder}
    />
  );
}
