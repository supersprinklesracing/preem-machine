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

const mockGet = jest.fn();

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
    it('should correctly return preem data with batched fetching', async () => {
      // Setup data
      const org1: Organization = {
        id: 'org-perf',
        path: 'organizations/org-perf',
        name: 'Perf Org',
        stripe: {},
      };
      await db.doc(org1.path).set(org1);

      // Use 2030 to be safe
      const series1: Series = {
        id: 'series-perf',
        path: 'organizations/org-perf/series/series-perf',
        name: 'Perf Series',
        startDate: Timestamp.fromDate(new Date('2030-01-01')),
        endDate: Timestamp.fromDate(new Date('2030-01-31')),
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
        startDate: Timestamp.fromDate(new Date('2030-01-10')),
        endDate: Timestamp.fromDate(new Date('2030-01-20')),
        seriesBrief: series1,
      };
      await db.doc(event1.path).set(event1);

      const race1: Race = {
        id: 'race-perf',
        path: 'organizations/org-perf/series/series-perf/events/event-perf/races/race-perf',
        name: 'Perf Race',
        startDate: Timestamp.fromDate(new Date('2030-01-12')),
        endDate: Timestamp.fromDate(new Date('2030-01-18')),
        eventBrief: event1,
      };
      await db.doc(race1.path).set(race1);

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
        date: Timestamp.now(), // contributions are ordered by date desc, so now is fine
        preemBrief: preem1,
      };
      await db.doc(contribution1.path).set(contribution1);

      // Spy on Firestore collectionGroup
      // Note: We are spying on the db instance that is already created.
      const collectionGroupSpy = jest.spyOn(db, 'collectionGroup');

      const { contributions, eventsWithRaces } = await getRenderableHomeDataForPage();

      const perfContribution = contributions.find(
        (c) => c.id === 'contribution-perf',
      );

      // Verify flat contributions list
      expect(perfContribution).toBeDefined();
      expect(perfContribution?.preemBrief.name).toBe('Perf Preem');
      expect(perfContribution?.preemBrief.raceBrief.name).toBe('Perf Race');
      expect(perfContribution?.preemBrief.raceBrief.eventBrief.name).toBe(
        'Perf Event',
      );

      // Verify nested structure (events -> races -> preems -> contributions)
      expect(eventsWithRaces.length).toBeGreaterThan(0);
      const event = eventsWithRaces.find(e => e.event.id === 'event-perf');
      expect(event).toBeDefined();
      expect(event?.children.length).toBe(1);

      const race = event?.children.find(r => r.race.id === 'race-perf');
      expect(race).toBeDefined();
      expect(race?.children.length).toBe(1);

      const preem = race?.children.find(p => p.preem.id === 'preem-perf');
      expect(preem).toBeDefined();
      expect(preem?.children.length).toBe(1);

      const contrib = preem?.children.find(c => c.id === 'contribution-perf');
      expect(contrib).toBeDefined();

      // Verify calls
      const calls = collectionGroupSpy.mock.calls;
      const preemsCalls = calls.filter((call) => call[0] === 'preems');

      console.log('Preems calls:', preemsCalls.length);

      // Expect 2 calls:
      // 1. Fetch upcoming preems (original logic)
      // 2. Batch fetch preems for races (new logic)
      expect(preemsCalls.length).toBe(2);
    });
  });
});
