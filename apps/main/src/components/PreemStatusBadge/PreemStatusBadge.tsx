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

const PreemStatusBadge: React.FC<PreemStatusBadgeProps> = ({ status }) => {
  if (!status) {
    return null;
  }
  const variant = status === 'Minimum Met' ? 'gradient' : 'filled';
  return (
    <Badge color={statusColors[status]} variant={variant}>
      {status}
    </Badge>
  );
};

export default PreemStatusBadge;
