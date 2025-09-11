import { Group, Text } from '@mantine/core';
import { IconCalendar, IconMapPin } from '@tabler/icons-react';
import { format } from 'date-fns';

interface DateLocationDetailProps {
  startDate?: Date;
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
            {format(startDate, 'PP p')}
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
