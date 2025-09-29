'use server';

import { getFirestore } from '@/firebase/server/firebase-admin';

import { DocPath } from '../paths';
import { Event, EventSchema, Race, SeriesSchema } from '../schema';
import { converter } from './converters';
import { DateRangeError } from './errors';

export const validateEventDateRange = async (
  event: Pick<Event, 'startDate' | 'endDate'>,
  seriesPath: DocPath,
) => {
  if (!event.startDate || !event.endDate) {
    return;
  }

  const db = await getFirestore();
  const seriesRef = db.doc(seriesPath).withConverter(converter(SeriesSchema));
  const seriesDoc = await seriesRef.get();
  const series = seriesDoc.data();

  if (!series) {
    throw new Error('Series not found');
  }

  if (series.startDate && event.startDate < series.startDate) {
    throw new DateRangeError(
      'Event start date cannot be before series start date.',
    );
  }

  if (series.endDate && event.endDate > series.endDate) {
    throw new DateRangeError('Event end date cannot be after series end date.');
  }
};

export const validateRaceDateRange = async (
  race: Pick<Race, 'startDate' | 'endDate'>,
  eventPath: DocPath,
) => {
  if (!race.startDate || !race.endDate) {
    return;
  }

  const db = await getFirestore();
  const eventRef = db.doc(eventPath).withConverter(converter(EventSchema));
  const eventDoc = await eventRef.get();
  const event = eventDoc.data();

  if (!event) {
    throw new Error('Event not found');
  }

  if (event.startDate && race.startDate < event.startDate) {
    throw new DateRangeError(
      'Race start date cannot be before event start date.',
    );
  }

  if (event.endDate && race.endDate > event.endDate) {
    throw new DateRangeError('Race end date cannot be after event end date.');
  }
};
