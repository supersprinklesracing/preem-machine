import { Badge, BadgeVariant } from '@mantine/core';
import React from 'react';

export type DateStatus = 'Upcoming' | 'Live' | 'Finished';

interface DateStatusBadgeProps {
  startDate?: string;
  endDate?: string;
}

const statusColors: Record<DateStatus, string> = {
  Live: 'red',
  Upcoming: 'blue',
  Finished: 'gray',
};

const DateStatusBadge: React.FC<DateStatusBadgeProps> = ({
  startDate,
  endDate,
}) => {
  let status: DateStatus | undefined = undefined;
  let variant: BadgeVariant = 'light';

  if (startDate && endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      status = 'Upcoming';
      variant = 'filled';
    } else if (now >= start && now <= end) {
      status = 'Live';
      variant = 'gradient';
    } else if (now > end) {
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
};

export default DateStatusBadge;
