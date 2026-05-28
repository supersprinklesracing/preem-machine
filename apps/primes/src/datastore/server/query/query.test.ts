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

import {
  getEventsForOrganizations,
  getRenderableHomeDataForPage,
} from './query';

describe('query', () => {
  let db: Firestore;
  setupMockDb();

  beforeAll(async () => {
    db = await getFirestore();
  });

  describe('getRenderableHomeDataForPage', () => {
    it('should not lose preem data when preem IDs are duplicated across different races', async () => {
      const today = new Date();
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

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
        path: 'series/series-1',
        name: 'Test Series 1',
        startDate: Timestamp.fromDate(lastMonth),
        endDate: Timestamp.fromDate(nextMonth),
        organizationId: 'org-1',
      };
      await db.doc(series1.path).set(series1);

      const event1: Event = {
        id: 'event-1',
        path: 'events/event-1',
        name: 'Test Event 1',
        startDate: Timestamp.fromDate(lastMonth),
        endDate: Timestamp.fromDate(nextMonth),
        organizationId: 'org-1',
        seriesId: series1.id,
      };
      await db.doc(event1.path).set(event1);

      const race1: Race = {
        id: 'race-1',
        path: 'races/race-1',
        name: 'Test Race 1',
        startDate: Timestamp.fromDate(lastMonth),
        endDate: Timestamp.fromDate(nextMonth),
        organizationId: 'org-1',
        eventId: event1.id,
      };
      await db.doc(race1.path).set(race1);

      const preem1: Preem = {
        id: 'preem-1', // Duplicate ID
        path: 'preems/preem-1',
        name: 'Preem Alpha',
        organizationId: 'org-1',
        raceId: race1.id,
        timeLimit: Timestamp.fromDate(nextMonth),
      };
      await db.doc(preem1.path).set(preem1);

      const contribution1: Contribution = {
        id: 'contribution-1',
        path: 'contributions/contribution-1',
        amount: 100,
        date: Timestamp.now(),
        organizationId: 'org-1',
        preemId: preem1.id,
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
        path: 'series/series-2',
        name: 'Test Series 2',
        startDate: Timestamp.fromDate(lastMonth),
        endDate: Timestamp.fromDate(nextMonth),
        organizationId: 'org-2',
      };
      await db.doc(series2.path).set(series2);

      const event2: Event = {
        id: 'event-2',
        path: 'events/event-2',
        name: 'Test Event 2',
        startDate: Timestamp.fromDate(lastMonth),
        endDate: Timestamp.fromDate(nextMonth),
        organizationId: 'org-2',
        seriesId: series2.id,
      };
      await db.doc(event2.path).set(event2);

      const race2: Race = {
        id: 'race-2',
        path: 'races/race-2',
        name: 'Test Race 2',
        startDate: Timestamp.fromDate(lastMonth),
        endDate: Timestamp.fromDate(nextMonth),
        organizationId: 'org-2',
        eventId: event2.id,
      };
      await db.doc(race2.path).set(race2);

      const preem2: Preem = {
        id: 'preem-2',
        path: 'preems/preem-2',
        name: 'Preem Beta',
        organizationId: 'org-2',
        raceId: race2.id,
        timeLimit: Timestamp.fromDate(nextMonth),
      };
      await db.doc(preem2.path).set(preem2);

      const contribution2: Contribution = {
        id: 'contribution-2',
        path: 'contributions/contribution-2',
        amount: 200,
        date: Timestamp.now(),
        organizationId: 'org-2',
        preemId: preem2.id,
      };
      await db.doc(contribution2.path).set(contribution2);

      const { contributions, preems } = await getRenderableHomeDataForPage();

      // Check that the preem data is correct for each contribution
      const c1 = contributions.find(
        (c) => c.contribution.id === 'contribution-1',
      );
      const c2 = contributions.find(
        (c) => c.contribution.id === 'contribution-2',
      );
      expect(c1).toBeDefined();
      expect(c2).toBeDefined();

      const p1 = preems.find((p: any) => p.id === 'preem-1');
      const p2 = preems.find((p: any) => p.id === 'preem-2');
      expect(p1?.name).toBe('Preem Alpha');
      expect(p2?.name).toBe('Preem Beta');
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
        path: 'series/series-1',
        name: 'Test Series 1',
        startDate: Timestamp.fromDate(fiveDaysAgo),
        endDate: Timestamp.fromDate(today),
        organizationId: 'org-1',
      };
      await db.doc(series.path).set(series);

      const event1: Event = {
        id: 'event-1',
        path: 'events/event-1',
        name: 'Test Event 1',
        startDate: Timestamp.fromDate(today),
        endDate: Timestamp.fromDate(today),
        organizationId: 'org-1',
        seriesId: series.id,
      };
      await db.doc(event1.path).set(event1);

      const event2: Event = {
        id: 'event-2',
        path: 'events/event-2',
        name: 'Test Event 2',
        startDate: Timestamp.fromDate(twoDaysAgo),
        endDate: Timestamp.fromDate(twoDaysAgo),
        organizationId: 'org-1',
        seriesId: series.id,
      };
      await db.doc(event2.path).set(event2);

      const events = await getEventsForOrganizations(['org-1']);
      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events.some((e) => e.id === 'event-1')).toBe(true);
    });
  });
});
