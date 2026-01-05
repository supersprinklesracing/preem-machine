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

import { getRenderableHomeDataForPage, getRenderableEventDataForPage } from './query';

const mockGet = jest.fn();

// We need to mock getFirestore to spy on the collectionGroup queries
jest.mock('@/firebase/server/firebase-admin', () => {
  const originalModule = jest.requireActual('@/firebase/server/firebase-admin');
  return {
    ...originalModule,
  };
});

describe('query performance optimization', () => {
  let db: Firestore;
  setupMockDb();

  beforeAll(async () => {
    db = await getFirestore();
  });

  const setupData = async () => {
      const org1: Organization = {
        id: 'org-perf-2',
        path: 'organizations/org-perf-2',
        name: 'Perf Org 2',
        stripe: {},
      };
      await db.doc(org1.path).set(org1);

      const series1: Series = {
        id: 'series-perf-2',
        path: 'organizations/org-perf-2/series/series-perf-2',
        name: 'Perf Series 2',
        startDate: Timestamp.fromDate(new Date('2028-01-01')),
        endDate: Timestamp.fromDate(new Date('2028-01-31')),
        organizationBrief: {
          id: 'org-perf-2',
          path: 'organizations/org-perf-2',
          name: 'Perf Org 2',
        },
      };
      await db.doc(series1.path).set(series1);

      const event1: Event = {
        id: 'event-perf-2',
        path: 'organizations/org-perf-2/series/series-perf-2/events/event-perf-2',
        name: 'Perf Event 2',
        startDate: Timestamp.fromDate(new Date('2028-01-10')),
        endDate: Timestamp.fromDate(new Date('2028-01-20')),
        seriesBrief: series1,
      };
      await db.doc(event1.path).set(event1);

      const race1: Race = {
        id: 'race-perf-2',
        path: 'organizations/org-perf-2/series/series-perf-2/events/event-perf-2/races/race-perf-2',
        name: 'Perf Race 2',
        startDate: Timestamp.fromDate(new Date('2028-01-12')),
        endDate: Timestamp.fromDate(new Date('2028-01-18')),
        eventBrief: event1,
      };
      await db.doc(race1.path).set(race1);

      const preem1: Preem = {
        id: 'preem-perf-2',
        path: `${race1.path}/preems/preem-perf-2`,
        name: 'Perf Preem 2',
        raceBrief: race1,
      };
      await db.doc(preem1.path).set(preem1);

      const contribution1: Contribution = {
        id: 'contribution-perf-2',
        path: `${preem1.path}/contributions/contribution-perf-2`,
        amount: 100,
        date: Timestamp.now(),
        preemBrief: preem1,
      };
      await db.doc(contribution1.path).set(contribution1);
      return { event1 };
  }

  describe('getRenderableHomeDataForPage', () => {
    it('should NOT fetch nested preems for home page', async () => {
      await setupData();

      const docSpy = jest.spyOn(db, 'doc');
      // Collection fetching is hard to spy on exactly with mock-firestore sometimes,
      // but we can check the result structure.

      const { eventsWithRaces } = await getRenderableHomeDataForPage();
      const targetEvent = eventsWithRaces.find(e => e.event.id === 'event-perf-2');

      expect(targetEvent).toBeDefined();
      expect(targetEvent?.children.length).toBeGreaterThan(0); // Races are fetched

      const targetRace = targetEvent?.children.find(r => r.race.id === 'race-perf-2');
      expect(targetRace).toBeDefined();

      // Crucial check: children (preems) should be empty because we disabled fetching them
      expect(targetRace?.children).toEqual([]);
    });
  });

  describe('getRenderableEventDataForPage', () => {
    it('should fetch preems but NOT nested contributions for event page', async () => {
      const { event1 } = await setupData();

      const data = await getRenderableEventDataForPage(event1.path);

      expect(data.event.id).toBe('event-perf-2');

      const targetRace = data.children.find(r => r.race.id === 'race-perf-2');
      expect(targetRace).toBeDefined();

      // Should have preems
      expect(targetRace?.children.length).toBeGreaterThan(0);
      const targetPreem = targetRace?.children.find(p => p.preem.id === 'preem-perf-2');
      expect(targetPreem).toBeDefined();

      // Crucial check: children (contributions) should be empty because we disabled fetching them
      expect(targetPreem?.children).toEqual([]);
    });
  });
});
