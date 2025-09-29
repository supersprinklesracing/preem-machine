import { Badge, BadgeVariant } from '@mantine/core';
import React from 'react';

export type DateStatus = 'Upcoming' | 'Live' | 'Finished';

interface DateStatusBadgeProps {
  startDate?: Date;
  endDate?: Date;
}

const statusColors: Record<DateStatus, string> = {
  Live: 'red',
  Upcoming: 'blue',
  Finished: 'gray',
};

export function DateStatusBadge({ startDate, endDate }: DateStatusBadgeProps) {
  let status: DateStatus | undefined = undefined;
  let variant: BadgeVariant = 'light';

  if (startDate && endDate) {
    const now = new Date();

    if (now < startDate) {
      status = 'Upcoming';
      variant = 'filled';
    } else if (now >= startDate && now <= endDate) {
      status = 'Live';
      variant = 'gradient';
    } else if (now > endDate) {
      status = 'Finished';
    }
  }
  if (!status) {
    return <></>;
  }
  return (
    <Badge color={statusColors[status]} variant={variant}>
      {status}
    </Badge>
  );
}
