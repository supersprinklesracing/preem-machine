import { Group, Text } from '@mantine/core';
import { IconCalendar, IconMapPin } from '@tabler/icons-react';
import { format } from 'date-fns';

interface DateLocationDetailProps {
  startDate?: string | null;
  location?: string | null;
}

export const DateLocationDetail: React.FC<DateLocationDetailProps> = ({
  startDate,
  location,
}) => {
  return (
    <>
      {startDate && (
        <Group gap="xs">
          <IconCalendar size={18} />
          <Text size="sm" fw={500}>
            {format(new Date(startDate), 'PP p')}
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
