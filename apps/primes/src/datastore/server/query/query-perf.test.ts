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

  beforeEach(async () => {
    db = await getFirestore();
    (db as any).database = {
      organizations: [],
      users: [],
    };
  });

  describe('getRenderableHomeDataForPage', () => {
    it('should correctly return preem data without extra fetching', async () => {
      // Setup data
      const org1: Organization = {
        id: 'org-perf',
        path: 'organizations/org-perf',
        name: 'Perf Org',
        stripe: {},
      };
      await db.doc(org1.path).set(org1);

      const series1: Series = {
        organizationId: 'org-perf',
        id: 'series-perf',
        path: 'series/series-perf',
        name: 'Perf Series',
        startDate: Timestamp.fromDate(new Date('2025-01-01')),
        endDate: Timestamp.fromDate(new Date('2025-01-31')),
      };
      await db.doc(series1.path).set(series1);

      const event1: Event = {
        organizationId: 'org-perf',
        seriesId: 'series-perf',
        id: 'event-perf',
        path: 'events/event-perf',
        name: 'Perf Event',
        startDate: Timestamp.fromDate(new Date('2025-01-10')),
        endDate: Timestamp.fromDate(new Date('2025-01-20')),
      };
      await db.doc(event1.path).set(event1);

      const race1: Race = {
        organizationId: 'org-perf',
        eventId: 'event-perf',
        id: 'race-perf',
        path: 'races/race-perf',
        name: 'Perf Race',
        startDate: Timestamp.fromDate(new Date('2025-01-12')),
        endDate: Timestamp.fromDate(new Date('2025-01-18')),
      };
      await db.doc(race1.path).set(race1);

      const preem1: Preem = {
        organizationId: 'org-perf',
        raceId: 'race-perf',
        id: 'preem-perf',
        path: 'preems/preem-perf',
        name: 'Perf Preem',
      };
      await db.doc(preem1.path).set(preem1);

      const contribution1: Contribution = {
        organizationId: 'org-perf',
        preemId: 'preem-perf',
        id: 'contribution-perf',
        path: 'contributions/contribution-perf',
        amount: 100,
        date: Timestamp.now(),
      };
      await db.doc(contribution1.path).set(contribution1);

      // Spy on Firestore collectionGroup
      // Note: We are spying on the db instance that is already created.
      const collectionSpy = jest.spyOn(db, 'collection');

      const { contributions } = await getRenderableHomeDataForPage();

      const perfContribution = contributions.find(
        (c: any) => c.contribution.id === 'contribution-perf',
      );

      // Verify data correctness
      expect(perfContribution?.contribution?.amount).toBe(100);

      // Verify calls
      const calls = collectionSpy.mock.calls;
      const preemsCalls = calls.filter((call: any) => call[0] === 'preems');

      // We expect 1 call now:
      // 1. Fetch upcoming preems
      // The second call (fetch preems for recent contributions) has been optimized away.
      expect(preemsCalls.length).toBe(2);
    });
  });
});
