import { Badge } from '@mantine/core';
import React from 'react';

export type PreemStatus = 'Open' | 'Minimum Met' | 'Awarded';

interface PreemStatusBadgeProps {
  status: PreemStatus;
}

const statusColors: Record<PreemStatus, string> = {
  Open: 'yellow',
  'Minimum Met': 'green',
  Awarded: 'violet',
};

const PreemStatusBadge: React.FC<PreemStatusBadgeProps> = ({ status }) => {
  const variant = status === 'Minimum Met' ? 'gradient' : 'filled';
  return (
    <Badge color={statusColors[status]} variant={variant}>
      {status}
    </Badge>
  );
};

export default PreemStatusBadge;
