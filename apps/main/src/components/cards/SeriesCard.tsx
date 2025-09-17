import { Series } from '@/datastore/schema';
import React from 'react';
import { DateLocationDetail } from './DateLocationDetail';
import { ContentCard } from './ContentCard';
import { TitleOrder, Group } from '@mantine/core';

interface SeriesCardProps {
  series: Series;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  withBorder?: boolean;
  titleOrder?: TitleOrder;
}

const SeriesCard: React.FC<SeriesCardProps> = ({
  series,
  children,
  style,
  withBorder = true,
  titleOrder = 3,
}) => {
  const dateLocationDetailContent = <DateLocationDetail {...series} />;

  return (
    <ContentCard
      withBorder={withBorder}
      style={style}
      title={series.name}
      titleOrder={titleOrder}
      mainContent={
        <Group hiddenFrom="lg" mt="md" mb="md">
          {dateLocationDetailContent}
        </Group>
      }
      rightColumnTop={dateLocationDetailContent}
      rightColumnBottom={children}
    />
  );
};

export default SeriesCard;
