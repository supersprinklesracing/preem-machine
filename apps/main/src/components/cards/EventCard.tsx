import { TitleOrder } from '@mantine/core';
import React from 'react';

import { Event } from '@/datastore/schema';

import { DateStatusBadge } from '../DateStatusBadge/DateStatusBadge';
import { ContentCard } from './ContentCard';
import { DateLocationDetail } from './DateLocationDetail';

interface EventCardProps {
  event: Event;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  withBorder?: boolean;
  titleOrder?: TitleOrder;
}

export function EventCard({
  event,
  children,
  style,
  withBorder = true,
  titleOrder = 3,
}: EventCardProps) {
  return (
    <ContentCard
      title={event.name}
      statusBadge={<DateStatusBadge {...event} />}
      rightColumnTop={<DateLocationDetail {...event} />}
      rightColumnBottom={children}
      style={style}
      withBorder={withBorder}
      titleOrder={titleOrder}
    />
  );
}
