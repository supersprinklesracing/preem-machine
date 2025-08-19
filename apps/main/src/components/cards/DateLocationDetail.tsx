import { Group, Text } from '@mantine/core';
import { IconCalendar, IconMapPin } from '@tabler/icons-react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import React from 'react';

type DateType = string | Date | Timestamp;

interface DateLocationDetailProps {
  startDate?: DateType;
  endDate?: DateType;
  location?: string;
}

const toDate = (date: DateType): Date => {
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  return new Date(date);
};

export const DateLocationDetail: React.FC<DateLocationDetailProps> = ({
  startDate,
  endDate,
  location,
}) => {
  return (
    <>
      <Group gap="xs" wrap="nowrap">
        <IconCalendar size={16} style={{ flexShrink: 0 }} />
        <Text size="sm">
          {startDate && format(toDate(startDate), 'PP')}
          {endDate && ` - ${format(toDate(endDate), 'PP')}`}
        </Text>
      </Group>
      {location && (
        <Group gap="xs" wrap="nowrap">
          <IconMapPin size={16} style={{ flexShrink: 0 }} />
          <Text size="sm">{location}</Text>
        </Group>
      )}
    </>
  );
};
