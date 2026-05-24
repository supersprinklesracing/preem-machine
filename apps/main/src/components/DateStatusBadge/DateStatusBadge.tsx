'use client';

import { Badge, BadgeVariant } from '@mantine/core';
import React, { useEffect, useState } from 'react';

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!isMounted || !startDate || !endDate) {
    return null;
  }

  const now = new Date();
  let status: DateStatus;
  let variant: BadgeVariant = 'light';

  if (now < startDate) {
    status = 'Upcoming';
    variant = 'filled';
  } else if (now >= startDate && now <= endDate) {
    status = 'Live';
    variant = 'gradient';
  } else {
    status = 'Finished';
  }

  return (
    <Badge color={statusColors[status]} variant={variant}>
      {status}
    </Badge>
  );
}
