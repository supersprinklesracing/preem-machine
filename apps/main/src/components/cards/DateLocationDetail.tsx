import { Group, Text } from '@mantine/core';
import { IconCalendar, IconMapPin } from '@tabler/icons-react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

interface DateLocationDetailProps {
  startDate?: Date;
  location?: string | null;
  timezone?: string | null;
}

export const DateLocationDetail: React.FC<DateLocationDetailProps> = ({
  startDate,
  location,
  timezone,
}) => {
  return (
    <>
      {startDate && (
        <Group gap="xs">
          <IconCalendar size={18} />
          <Text size="sm" fw={500}>
            {timezone
              ? formatInTimeZone(startDate, timezone, 'PP p zzz')
              : format(startDate, 'PP p')}
          </Text>
        </Group>
      )}
      {location && (
        <Group gap="xs">
          <IconMapPin size={18} />
          <Text size="sm" fw={500}>
            {location}
          </Text>
        </Group>
      )}
    </>
  );
};
