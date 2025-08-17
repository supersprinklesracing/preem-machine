import { Badge } from '@mantine/core';
import React from 'react';

export type Status =
  | 'Upcoming'
  | 'Live'
  | 'Finished'
  | 'Open'
  | 'Minimum Met'
  | 'Awarded';

interface StatusBadgeProps {
  status: Status;
}

const statusColors: Record<Status, string> = {
  Live: 'red',
  Upcoming: 'blue',
  Finished: 'gray',
  Open: 'yellow',
  'Minimum Met': 'green',
  Awarded: 'violet',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <Badge color={statusColors[status]} variant="light">
      {status}
    </Badge>
  );
};

export default StatusBadge;
