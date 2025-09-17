import { Organization } from '@/datastore/schema';
import { TitleOrder } from '@mantine/core';
import React from 'react';
import { ContentCard } from './ContentCard';

interface OrganizationCardProps {
  organization: Organization;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  withBorder?: boolean;
  titleOrder?: TitleOrder;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  children,
  style,
  withBorder = true,
  titleOrder = 3,
}) => {
  return (
    <ContentCard
      title={organization.name}
      rightColumnBottom={children}
      style={style}
      withBorder={withBorder}
      titleOrder={titleOrder}
    />
  );
};

export default OrganizationCard;
