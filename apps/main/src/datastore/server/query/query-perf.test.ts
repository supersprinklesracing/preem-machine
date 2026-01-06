import { type Firestore, Timestamp } from 'firebase-admin/firestore';

import {
  Contribution,
  Event,
  Organization,
  Preem,
  Race,
  Series,
} from '@/datastore/schema';
import { getFirestore } from '@/firebase/server/firebase-admin';
import { setupMockDb } from '@/test-utils';

import { getRenderableHomeDataForPage } from './query';

// We need to mock getFirestore to spy on the collectionGroup queries
jest.mock('@/firebase/server/firebase-admin', () => {
  const originalModule = jest.requireActual('@/firebase/server/firebase-admin');
  return {
    ...originalModule,
  };
});

describe('query performance', () => {
  let db: Firestore;
  setupMockDb();

  beforeAll(async () => {
    db = await getFirestore();
  });

  describe('getRenderableHomeDataForPage', () => {
    it('should avoid fetching deeply nested data (Preems/Contributions) for Events list', async () => {
      // Setup data
      const org1: Organization = {
        id: 'org-perf',
        path: 'organizations/org-perf',
        name: 'Perf Org',
        stripe: {},
      };
      await db.doc(org1.path).set(org1);

      const series1: Series = {
        id: 'series-perf',
        path: 'organizations/org-perf/series/series-perf',
        name: 'Perf Series',
        startDate: Timestamp.fromDate(new Date('2027-01-01')),
        endDate: Timestamp.fromDate(new Date('2027-01-31')),
        organizationBrief: {
          id: 'org-perf',
          path: 'organizations/org-perf',
          name: 'Perf Org',
        },
      };
      await db.doc(series1.path).set(series1);

      const event1: Event = {
        id: 'event-perf',
        path: 'organizations/org-perf/series/series-perf/events/event-perf',
        name: 'Perf Event',
        startDate: Timestamp.fromDate(new Date('2027-01-10')),
        endDate: Timestamp.fromDate(new Date('2027-01-20')),
        seriesBrief: series1,
      };
      await db.doc(event1.path).set(event1);

      const race1: Race = {
        id: 'race-perf',
        path: 'organizations/org-perf/series/series-perf/events/event-perf/races/race-perf',
        name: 'Perf Race',
        startDate: Timestamp.fromDate(new Date('2027-01-12')),
        endDate: Timestamp.fromDate(new Date('2027-01-18')),
        eventBrief: event1,
      };
      await db.doc(race1.path).set(race1);

      // We add a preem to the race. If our optimization works, this preem should NOT be fetched
      // as part of the "Events -> Races -> Preems" waterfall.
      // However, it WILL be fetched by the "Upcoming Preems" separate query if it matches the criteria.
      // To distinguish, we'll check if the *Race* object in the event list contains populated children.
      const preem1: Preem = {
        id: 'preem-perf',
        path: `${race1.path}/preems/preem-perf`,
        name: 'Perf Preem',
        raceBrief: race1,
      };
      await db.doc(preem1.path).set(preem1);

      const contribution1: Contribution = {
        id: 'contribution-perf',
        path: `${preem1.path}/contributions/contribution-perf`,
        amount: 100,
        date: Timestamp.now(),
        preemBrief: preem1,
      };
      await db.doc(contribution1.path).set(contribution1);

      const { eventsWithRaces } = await getRenderableHomeDataForPage();

      const eventResult = eventsWithRaces.find((e) => e.event.id === 'event-perf');
      expect(eventResult).toBeDefined();
      const raceResult = eventResult?.children.find((r) => r.race.id === 'race-perf');
      expect(raceResult).toBeDefined();

      // Ensure shallow fetch is used (0 children) to avoid N+1 queries
      expect(raceResult?.children.length).toBe(0);
    });
  });
});
