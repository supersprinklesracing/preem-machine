import { setupMockDb } from '@/test-utils';
import { validateEventDateRange, validateRaceDateRange, DateRangeError } from './validation';
import { doc } from 'firebase/firestore';
import { db } from '@/firebase-client/firebase-client';
import { Organization, Series, Event, Race } from '@/datastore/schema';
import { toDate } from '@/datastore/converters';

describe('validation', () => {
  setupMockDb();

  describe('validateEventDateRange', () => {
    it('should not throw an error for a valid date range', async () => {
      const series: Series = {
        id: 'series-1',
        path: 'organizations/org-1/series/series-1',
        name: 'Test Series',
        startDate: toDate(new Date('2025-01-01')),
        endDate: toDate(new Date('2025-01-31')),
        organizationBrief: { id: 'org-1', path: 'organizations/org-1', name: 'Test Org' },
      };
      await db.doc(series.path).set(series);

      const event: Event = {
        id: 'event-1',
        path: 'organizations/org-1/series/series-1/events/event-1',
        name: 'Test Event',
        startDate: toDate(new Date('2025-01-10')),
        endDate: toDate(new Date('2025-01-20')),
        seriesBrief: series,
      };

      await expect(validateEventDateRange(event, series.path)).resolves.not.toThrow();
    });

    it('should throw a DateRangeError for an invalid start date', async () => {
        const series: Series = {
            id: 'series-1',
            path: 'organizations/org-1/series/series-1',
            name: 'Test Series',
            startDate: toDate(new Date('2025-01-01')),
            endDate: toDate(new Date('2025-01-31')),
            organizationBrief: { id: 'org-1', path: 'organizations/org-1', name: 'Test Org' },
          };
          await db.doc(series.path).set(series);

          const event: Event = {
            id: 'event-1',
            path: 'organizations/org-1/series/series-1/events/event-1',
            name: 'Test Event',
            startDate: toDate(new Date('2024-12-31')),
            endDate: toDate(new Date('2025-01-20')),
            seriesBrief: series,
          };

      await expect(validateEventDateRange(event, series.path)).rejects.toThrow(DateRangeError);
    });

    it('should throw a DateRangeError for an invalid end date', async () => {
        const series: Series = {
            id: 'series-1',
            path: 'organizations/org-1/series/series-1',
            name: 'Test Series',
            startDate: toDate(new Date('2025-01-01')),
            endDate: toDate(new Date('2025-01-31')),
            organizationBrief: { id: 'org-1', path: 'organizations/org-1', name: 'Test Org' },
          };
          await db.doc(series.path).set(series);

          const event: Event = {
            id: 'event-1',
            path: 'organizations/org-1/series/series-1/events/event-1',
            name: 'Test Event',
            startDate: toDate(new Date('2025-01-10')),
            endDate: toDate(new Date('2025-02-01')),
            seriesBrief: series,
          };

      await expect(validateEventDateRange(event, series.path)).rejects.toThrow(DateRangeError);
    });
  });

  describe('validateRaceDateRange', () => {
    it('should not throw an error for a valid date range', async () => {
        const event: Event = {
            id: 'event-1',
            path: 'organizations/org-1/series/series-1/events/event-1',
            name: 'Test Event',
            startDate: toDate(new Date('2025-01-10')),
            endDate: toDate(new Date('2025-01-20')),
            seriesBrief: {
              id: 'series-1',
              path: 'organizations/org-1/series/series-1',
              name: 'Test Series',
              startDate: toDate(new Date('2025-01-01')),
              endDate: toDate(new Date('2025-01-31')),
              organizationBrief: { id: 'org-1', path: 'organizations/org-1', name: 'Test Org' },
            },
          };
          await db.doc(event.path).set(event);

      const race: Race = {
        id: 'race-1',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
        name: 'Test Race',
        startDate: toDate(new Date('2025-01-12')),
        endDate: toDate(new Date('2025-01-18')),
        eventBrief: event,
      };

      await expect(validateRaceDateRange(race, event.path)).resolves.not.toThrow();
    });

    it('should throw a DateRangeError for an invalid start date', async () => {
        const event: Event = {
            id: 'event-1',
            path: 'organizations/org-1/series/series-1/events/event-1',
            name: 'Test Event',
            startDate: toDate(new Date('2025-01-10')),
            endDate: toDate(new Date('2025-01-20')),
            seriesBrief: {
              id: 'series-1',
              path: 'organizations/org-1/series/series-1',
              name: 'Test Series',
              startDate: toDate(new Date('2025-01-01')),
              endDate: toDate(new Date('2025-01-31')),
              organizationBrief: { id: 'org-1', path: 'organizations/org-1', name: 'Test Org' },
            },
          };
          await db.doc(event.path).set(event);

      const race: Race = {
        id: 'race-1',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
        name: 'Test Race',
        startDate: toDate(new Date('2025-01-09')),
        endDate: toDate(new Date('2025-01-18')),
        eventBrief: event,
      };

      await expect(validateRaceDateRange(race, event.path)).rejects.toThrow(DateRangeError);
    });

    it('should throw a DateRangeError for an invalid end date', async () => {
        const event: Event = {
            id: 'event-1',
            path: 'organizations/org-1/series/series-1/events/event-1',
            name: 'Test Event',
            startDate: toDate(new Date('2025-01-10')),
            endDate: toDate(new Date('2025-01-20')),
            seriesBrief: {
              id: 'series-1',
              path: 'organizations/org-1/series/series-1',
              name: 'Test Series',
              startDate: toDate(new Date('2025-01-01')),
              endDate: toDate(new Date('2025-01-31')),
              organizationBrief: { id: 'org-1', path: 'organizations/org-1', name: 'Test Org' },
            },
          };
          await db.doc(event.path).set(event);

      const race: Race = {
        id: 'race-1',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
        name: 'Test Race',
        startDate: toDate(new Date('2025-01-12')),
        endDate: toDate(new Date('2025-01-21')),
        eventBrief: event,
      };

      await expect(validateRaceDateRange(race, event.path)).rejects.toThrow(DateRangeError);
    });
  });
});
