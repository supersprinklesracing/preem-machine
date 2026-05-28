import { Group, TitleOrder } from '@mantine/core';
import React from 'react';

import { Series } from '@/datastore/schema';

import { ContentCard } from './ContentCard';
import { DateLocationDetail } from './DateLocationDetail';

interface SeriesCardProps {
  series: Series;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  withBorder?: boolean;
  titleOrder?: TitleOrder;
}

export function SeriesCard({
  series,
  children,
  style,
  withBorder = true,
  titleOrder = 3,
}: SeriesCardProps) {
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
}
