import { type Firestore, Timestamp } from 'firebase-admin/firestore';

import { Event, Race, Series } from '@/datastore/schema';
import { getFirestore } from '@/firebase/server/firebase-admin';
import { setupMockDb } from '@/test-utils';

import {
  DateRangeError,
  validateEventDateRange,
  validateRaceDateRange,
} from './validation';

describe('validation', () => {
  let db: Firestore;
  setupMockDb();

  beforeAll(async () => {
    db = await getFirestore();
  });

  describe('validateEventDateRange', () => {
    it('should not throw an error for a valid date range', async () => {
      const series: Series = {
        organizationId: 'org-1',
        id: 'series-1',
        path: 'series/series-1',
        name: 'Test Series',
        startDate: Timestamp.fromDate(new Date('2025-01-01')),
        endDate: Timestamp.fromDate(new Date('2025-01-31')),
      };
      await db.doc(series.path).set(series);

      const event: Event = {
        organizationId: 'org-1',
        seriesId: 'series-1',
        id: 'event-1',
        path: 'events/event-1',
        name: 'Test Event',
        startDate: Timestamp.fromDate(new Date('2025-01-10')),
        endDate: Timestamp.fromDate(new Date('2025-01-20')),
      };

      await expect(
        validateEventDateRange(event, series.path),
      ).resolves.not.toThrow();
    });

    it('should throw a DateRangeError for an invalid start date', async () => {
      const series: Series = {
        organizationId: 'org-1',
        id: 'series-1',
        path: 'series/series-1',
        name: 'Test Series',
        startDate: Timestamp.fromDate(new Date('2025-01-01')),
        endDate: Timestamp.fromDate(new Date('2025-01-31')),
      };
      await db.doc(series.path).set(series);

      const event: Event = {
        organizationId: 'org-1',
        seriesId: 'series-1',
        id: 'event-1',
        path: 'events/event-1',
        name: 'Test Event',
        startDate: Timestamp.fromDate(new Date('2024-12-31')),
        endDate: Timestamp.fromDate(new Date('2025-01-20')),
      };

      await expect(validateEventDateRange(event, series.path)).rejects.toThrow(
        DateRangeError,
      );
    });

    it('should throw a DateRangeError for an invalid end date', async () => {
      const series: Series = {
        organizationId: 'org-1',
        id: 'series-1',
        path: 'series/series-1',
        name: 'Test Series',
        startDate: Timestamp.fromDate(new Date('2025-01-01')),
        endDate: Timestamp.fromDate(new Date('2025-01-31')),
      };
      await db.doc(series.path).set(series);

      const event: Event = {
        organizationId: 'org-1',
        seriesId: 'series-1',
        id: 'event-1',
        path: 'events/event-1',
        name: 'Test Event',
        startDate: Timestamp.fromDate(new Date('2025-01-10')),
        endDate: Timestamp.fromDate(new Date('2025-02-01')),
      };

      await expect(validateEventDateRange(event, series.path)).rejects.toThrow(
        DateRangeError,
      );
    });
  });

  describe('validateRaceDateRange', () => {
    it('should not throw an error for a valid date range', async () => {
      const event: Event = {
        organizationId: 'org-1',
        seriesId: 'series-1',
        id: 'event-1',
        path: 'events/event-1',
        name: 'Test Event',
        startDate: Timestamp.fromDate(new Date('2025-01-10')),
        endDate: Timestamp.fromDate(new Date('2025-01-20')),
      };
      await db.doc(event.path).set(event);

      const race: Race = {
        organizationId: 'org-1',
        eventId: 'event-1',
        id: 'race-1',
        path: 'races/race-1',
        name: 'Test Race',
        startDate: Timestamp.fromDate(new Date('2025-01-12')),
        endDate: Timestamp.fromDate(new Date('2025-01-18')),
      };

      await expect(
        validateRaceDateRange(race, event.path),
      ).resolves.not.toThrow();
    });

    it('should throw a DateRangeError for an invalid start date', async () => {
      const event: Event = {
        organizationId: 'org-1',
        seriesId: 'series-1',
        id: 'event-1',
        path: 'events/event-1',
        name: 'Test Event',
        startDate: Timestamp.fromDate(new Date('2025-01-10')),
        endDate: Timestamp.fromDate(new Date('2025-01-20')),
      };
      await db.doc(event.path).set(event);

      const race: Race = {
        organizationId: 'org-1',
        eventId: 'event-1',
        id: 'race-1',
        path: 'races/race-1',
        name: 'Test Race',
        startDate: Timestamp.fromDate(new Date('2025-01-09')),
        endDate: Timestamp.fromDate(new Date('2025-01-18')),
      };

      await expect(validateRaceDateRange(race, event.path)).rejects.toThrow(
        DateRangeError,
      );
    });

    it('should throw a DateRangeError for an invalid end date', async () => {
      const event: Event = {
        organizationId: 'org-1',
        seriesId: 'series-1',
        id: 'event-1',
        path: 'events/event-1',
        name: 'Test Event',
        startDate: Timestamp.fromDate(new Date('2025-01-10')),
        endDate: Timestamp.fromDate(new Date('2025-01-20')),
      };
      await db.doc(event.path).set(event);

      const race: Race = {
        organizationId: 'org-1',
        eventId: 'event-1',
        id: 'race-1',
        path: 'races/race-1',
        name: 'Test Race',
        startDate: Timestamp.fromDate(new Date('2025-01-12')),
        endDate: Timestamp.fromDate(new Date('2025-01-21')),
      };

      await expect(validateRaceDateRange(race, event.path)).rejects.toThrow(
        DateRangeError,
      );
    });
  });
});
