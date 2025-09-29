import { Badge } from '@mantine/core';
import React from 'react';

interface PreemStatusBadgeProps {
  status: string | undefined;
}

const statusColors: Record<string, string> = {
  Open: 'yellow',
  'Minimum Met': 'green',
  Awarded: 'violet',
};

export function PreemStatusBadge({ status }: PreemStatusBadgeProps) {
  if (!status) {
    return null;
  }
  const variant = status === 'Minimum Met' ? 'gradient' : 'filled';
  return (
    <Badge color={statusColors[status]} variant={variant}>
      {status}
    </Badge>
  );
}
