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

import { getOrganizationWithSeries } from './query';

describe('query performance optimization verification', () => {
  let db: Firestore;
  setupMockDb();

  beforeAll(async () => {
    db = await getFirestore();
  });

  it('should fetch the complete organization hierarchy correctly', async () => {
    // 1. Setup Data Hierarchy
    const org: Organization = {
      id: 'org-perf',
      path: 'organizations/org-perf',
      name: 'Performance Org',
      stripe: {},
    };
    await db.doc(org.path).set(org);

    const series1: Series = {
      id: 'series-1',
      path: 'organizations/org-perf/series/series-1',
      name: 'Series 1',
      startDate: Timestamp.now(),
      endDate: Timestamp.now(),
      organizationBrief: { id: org.id, path: org.path, name: org.name },
    };
    await db.doc(series1.path).set(series1);

    const series2: Series = {
      id: 'series-2',
      path: 'organizations/org-perf/series/series-2',
      name: 'Series 2',
      startDate: Timestamp.now(),
      endDate: Timestamp.now(),
      organizationBrief: { id: org.id, path: org.path, name: org.name },
    };
    await db.doc(series2.path).set(series2);

    // Series 1 has 2 events
    const event1_1: Event = {
      id: 'event-1-1',
      path: `${series1.path}/events/event-1-1`,
      name: 'Event 1.1',
      startDate: Timestamp.now(),
      endDate: Timestamp.now(),
      seriesBrief: series1,
    };
    await db.doc(event1_1.path).set(event1_1);

    const event1_2: Event = {
      id: 'event-1-2',
      path: `${series1.path}/events/event-1-2`,
      name: 'Event 1.2',
      startDate: Timestamp.now(),
      endDate: Timestamp.now(),
      seriesBrief: series1,
    };
    await db.doc(event1_2.path).set(event1_2);

    // Event 1.1 has 2 races
    const race1_1_1: Race = {
      id: 'race-1-1-1',
      path: `${event1_1.path}/races/race-1-1-1`,
      name: 'Race 1.1.1',
      startDate: Timestamp.now(),
      endDate: Timestamp.now(),
      eventBrief: event1_1,
    };
    await db.doc(race1_1_1.path).set(race1_1_1);

    const race1_1_2: Race = {
      id: 'race-1-1-2',
      path: `${event1_1.path}/races/race-1-1-2`,
      name: 'Race 1.1.2',
      startDate: Timestamp.now(),
      endDate: Timestamp.now(),
      eventBrief: event1_1,
    };
    await db.doc(race1_1_2.path).set(race1_1_2);

    // Race 1.1.1 has 2 preems
    const preem1_1_1_1: Preem = {
      id: 'preem-1-1-1-1',
      path: `${race1_1_1.path}/preems/preem-1-1-1-1`,
      name: 'Preem 1.1.1.1',
      raceBrief: race1_1_1,
    };
    await db.doc(preem1_1_1_1.path).set(preem1_1_1_1);

    const preem1_1_1_2: Preem = {
      id: 'preem-1-1-1-2',
      path: `${race1_1_1.path}/preems/preem-1-1-1-2`,
      name: 'Preem 1.1.1.2',
      raceBrief: race1_1_1,
    };
    await db.doc(preem1_1_1_2.path).set(preem1_1_1_2);

    // Preem 1.1.1.1 has 1 contribution
    const contribution: Contribution = {
      id: 'contrib-1',
      path: `${preem1_1_1_1.path}/contributions/contrib-1`,
      amount: 50,
      date: Timestamp.now(),
      preemBrief: preem1_1_1_1,
    };
    await db.doc(contribution.path).set(contribution);

    // 2. Fetch Data
    const orgDoc = await db.doc(org.path).get();
    // @ts-expect-error - Casting to any to avoid complex typing of mock return
    const result = await getOrganizationWithSeries(orgDoc);

    // 3. Verify Structure
    expect(result.organization.id).toBe('org-perf');
    expect(result.children).toHaveLength(2); // 2 series

    const s1 = result.children.find(s => s.series.id === 'series-1');
    expect(s1).toBeDefined();
    if (!s1) return;

    expect(s1.children).toHaveLength(2); // 2 events in series 1

    const e1_1 = s1.children.find(e => e.event.id === 'event-1-1');
    expect(e1_1).toBeDefined();
    if (!e1_1) return;

    expect(e1_1.children).toHaveLength(2); // 2 races in event 1.1

    const r1_1_1 = e1_1.children.find(r => r.race.id === 'race-1-1-1');
    expect(r1_1_1).toBeDefined();
    if (!r1_1_1) return;

    expect(r1_1_1.children).toHaveLength(2); // 2 preems in race 1.1.1

    const p1_1_1_1 = r1_1_1.children.find(p => p.preem.id === 'preem-1-1-1-1');
    expect(p1_1_1_1).toBeDefined();
    if (!p1_1_1_1) return;

    expect(p1_1_1_1.children).toHaveLength(1); // 1 contribution in preem 1.1.1.1
    expect(p1_1_1_1.children[0].id).toBe('contrib-1');
  });
});
