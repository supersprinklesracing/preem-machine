import { Event } from '@/datastore/schema';
import { TitleOrder } from '@mantine/core';
import React from 'react';
import DateStatusBadge from '../DateStatusBadge/DateStatusBadge';
import { DateLocationDetail } from './DateLocationDetail';
import { ContentCard } from './ContentCard';

interface EventCardProps {
  event: Event;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  withBorder?: boolean;
  titleOrder?: TitleOrder;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  children,
  style,
  withBorder = true,
  titleOrder = 3,
}) => {
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
};

export default EventCard;
