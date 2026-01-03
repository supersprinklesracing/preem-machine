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
  getRenderableOrganizationDataForPage,
  getRenderableSeriesDataForPage,
} from './query';

describe('query performance optimization', () => {
  let db: Firestore;
  setupMockDb();

  beforeAll(async () => {
    db = await getFirestore();
  });

  const org1: Organization = {
    id: 'org-1',
    path: 'organizations/org-1',
    name: 'Test Org 1',
  };

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

  const event1: Event = {
    id: 'event-1',
    path: 'organizations/org-1/series/series-1/events/event-1',
    name: 'Test Event 1',
    startDate: Timestamp.fromDate(new Date('2025-01-10')),
    endDate: Timestamp.fromDate(new Date('2025-01-20')),
    seriesBrief: series1,
  };

  const race1: Race = {
    id: 'race-1',
    path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
    name: 'Test Race 1',
    startDate: Timestamp.fromDate(new Date('2025-01-12')),
    endDate: Timestamp.fromDate(new Date('2025-01-18')),
    eventBrief: event1,
  };

  const preem1: Preem = {
    id: 'preem-1',
    path: `${race1.path}/preems/preem-1`,
    name: 'Preem Alpha',
    raceBrief: race1,
  };

  const contribution1: Contribution = {
    id: 'contribution-1',
    path: `${preem1.path}/contributions/contribution-1`,
    amount: 100,
    date: Timestamp.now(),
    preemBrief: preem1,
  };

  beforeEach(async () => {
    // Seed common data
    await db.doc(org1.path).set(org1);
    await db.doc(series1.path).set(series1);
    await db.doc(event1.path).set(event1);
    await db.doc(race1.path).set(race1);
    await db.doc(preem1.path).set(preem1);
    await db.doc(contribution1.path).set(contribution1);
  });

  it('getRenderableSeriesDataForPage should return nested data correctly', async () => {
    const result = await getRenderableSeriesDataForPage(series1.path);

    expect(result.series.id).toBe('series-1');
    expect(result.children.length).toBe(1); // One event
    expect(result.children[0].event.id).toBe('event-1');
    expect(result.children[0].children.length).toBe(1); // One race
    expect(result.children[0].children[0].race.id).toBe('race-1');
    expect(result.children[0].children[0].children.length).toBe(1); // One preem
    expect(result.children[0].children[0].children[0].preem.id).toBe(
      'preem-1',
    );
    expect(
      result.children[0].children[0].children[0].children.length,
    ).toBe(1); // One contribution
    expect(
      result.children[0].children[0].children[0].children[0].id,
    ).toBe('contribution-1');
  });

  it('getRenderableOrganizationDataForPage should return nested data correctly', async () => {
    const result = await getRenderableOrganizationDataForPage(org1.path);

    expect(result.organization.id).toBe('org-1');
    expect(result.serieses.length).toBe(1);
    expect(result.serieses[0].series.id).toBe('series-1');
    expect(result.serieses[0].children.length).toBe(1);
    expect(result.serieses[0].children[0].event.id).toBe('event-1');
    expect(result.serieses[0].children[0].children.length).toBe(1);
    expect(result.serieses[0].children[0].children[0].race.id).toBe('race-1');
    expect(result.serieses[0].children[0].children[0].children.length).toBe(1);
    expect(result.serieses[0].children[0].children[0].children[0].preem.id).toBe('preem-1');
    expect(result.serieses[0].children[0].children[0].children[0].children.length).toBe(1);
    expect(result.serieses[0].children[0].children[0].children[0].children[0].id).toBe('contribution-1');
  });
});
