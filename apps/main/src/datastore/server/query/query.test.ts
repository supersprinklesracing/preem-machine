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

import { getEventsForOrganizations, getRenderableHomeDataForPage } from './query';

describe('query', () => {
  let db: Firestore;
  setupMockDb();

  beforeAll(async () => {
    db = await getFirestore();
  });

  describe('getRenderableHomeDataForPage', () => {
    it('should not lose preem data when preem IDs are duplicated across different races', async () => {
      // Org 1
      const org1: Organization = {
        id: 'org-1',
        path: 'organizations/org-1',
        name: 'Test Org 1',
        stripe: {},
      };
      await db.doc(org1.path).set(org1);

      const series1: Series = {
        id: 'series-1',
        path: 'organizations/org-1/series/series-1',
        name: 'Test Series 1',
        startDate: Timestamp.fromDate(new Date('2025-01-01')),
        endDate: Timestamp.fromDate(new Date('2025-01-31')),
        organizationBrief: {
          id: 'org-1',
          path: 'organizations/org-1',
          name: 'Test Org 1',
        },
      };
      await db.doc(series1.path).set(series1);

      const event1: Event = {
        id: 'event-1',
        path: 'organizations/org-1/series/series-1/events/event-1',
        name: 'Test Event 1',
        startDate: Timestamp.fromDate(new Date('2025-01-10')),
        endDate: Timestamp.fromDate(new Date('2025-01-20')),
        seriesBrief: series1,
      };
      await db.doc(event1.path).set(event1);

      const race1: Race = {
        id: 'race-1',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
        name: 'Test Race 1',
        startDate: Timestamp.fromDate(new Date('2025-01-12')),
        endDate: Timestamp.fromDate(new Date('2025-01-18')),
        eventBrief: event1,
      };
      await db.doc(race1.path).set(race1);

      const preem1: Preem = {
        id: 'preem-1', // Duplicate ID
        path: `${race1.path}/preems/preem-1`,
        name: 'Preem Alpha',
        raceBrief: race1,
      };
      await db.doc(preem1.path).set(preem1);

      const contribution1: Contribution = {
        id: 'contribution-1',
        path: `${preem1.path}/contributions/contribution-1`,
        amount: 100,
        date: Timestamp.now(),
        preemBrief: preem1,
      };
      await db.doc(contribution1.path).set(contribution1);

      // Org 2, with a different preem that has the same ID
      const org2: Organization = {
        id: 'org-2',
        path: 'organizations/org-2',
        name: 'Test Org 2',
        stripe: {},
      };
      await db.doc(org2.path).set(org2);

      const series2: Series = {
        id: 'series-2',
        path: 'organizations/org-2/series/series-2',
        name: 'Test Series 2',
        startDate: Timestamp.fromDate(new Date('2025-02-01')),
        endDate: Timestamp.fromDate(new Date('2025-02-28')),
        organizationBrief: {
          id: 'org-2',
          path: 'organizations/org-2',
          name: 'Test Org 2',
        },
      };
      await db.doc(series2.path).set(series2);

      const event2: Event = {
        id: 'event-2',
        path: 'organizations/org-2/series/series-2/events/event-2',
        name: 'Test Event 2',
        startDate: Timestamp.fromDate(new Date('2025-02-10')),
        endDate: Timestamp.fromDate(new Date('2025-02-20')),
        seriesBrief: series2,
      };
      await db.doc(event2.path).set(event2);

      const race2: Race = {
        id: 'race-2',
        path: 'organizations/org-2/series/series-2/events/event-2/races/race-2',
        name: 'Test Race 2',
        startDate: Timestamp.fromDate(new Date('2025-02-12')),
        endDate: Timestamp.fromDate(new Date('2025-02-18')),
        eventBrief: event2,
      };
      await db.doc(race2.path).set(race2);

      const preem2: Preem = {
        id: 'preem-1', // Duplicate ID
        path: `${race2.path}/preems/preem-1`,
        name: 'Preem Beta',
        raceBrief: race2,
      };
      await db.doc(preem2.path).set(preem2);

      const contribution2: Contribution = {
        id: 'contribution-2',
        path: `${preem2.path}/contributions/contribution-2`,
        amount: 200,
        date: Timestamp.now(),
        preemBrief: preem2,
      };
      await db.doc(contribution2.path).set(contribution2);

      const { contributions } = await getRenderableHomeDataForPage();

      // Check that the preem data is correct for each contribution
      const c1 = contributions.find((c) => c.id === 'contribution-1');
      const c2 = contributions.find((c) => c.id === 'contribution-2');

      expect(c1).toBeDefined();
      expect(c2).toBeDefined();
      expect(c1?.preemBrief?.name).toBe('Preem Alpha');
      expect(c2?.preemBrief?.name).toBe('Preem Beta');
    });
  });

  describe('getEventsForOrganizations', () => {
    it('should only return events from the last day', async () => {
      const today = new Date();
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const org: Organization = {
        id: 'org-1',
        path: 'organizations/org-1',
        name: 'Test Org 1',
        stripe: {},
      };
      await db.doc(org.path).set(org);

      const series: Series = {
        id: 'series-1',
        path: 'organizations/org-1/series/series-1',
        name: 'Test Series 1',
        startDate: Timestamp.fromDate(fiveDaysAgo),
        endDate: Timestamp.fromDate(today),
        organizationBrief: {
          id: 'org-1',
          path: 'organizations/org-1',
          name: 'Test Org 1',
        },
      };
      await db.doc(series.path).set(series);

      const event1: Event = {
        id: 'event-1',
        path: 'organizations/org-1/series/series-1/events/event-1',
        name: 'Test Event 1',
        startDate: Timestamp.fromDate(today),
        endDate: Timestamp.fromDate(today),
        seriesBrief: series,
      };
      await db.doc(event1.path).set(event1);

      const event2: Event = {
        id: 'event-2',
        path: 'organizations/org-1/series/series-1/events/event-2',
        name: 'Test Event 2',
        startDate: Timestamp.fromDate(twoDaysAgo),
        endDate: Timestamp.fromDate(twoDaysAgo),
        seriesBrief: series,
      };
      await db.doc(event2.path).set(event2);

      const events = await getEventsForOrganizations(['org-1']);
      expect(events.length).toBe(1);
      expect(events[0].id).toBe('event-1');
    });
  });
});
