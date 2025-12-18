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

import { getRenderableSeriesDataForPage } from './query';

describe('query-perf', () => {
  let db: Firestore;
  setupMockDb();

  beforeAll(async () => {
    db = await getFirestore();
  });

  it('should return complete series hierarchy data', async () => {
    // Org
    const org: Organization = {
      id: 'org-perf',
      path: 'organizations/org-perf',
      name: 'Perf Org',
      stripe: {},
    };
    await db.doc(org.path).set(org);

    // Series
    const series: Series = {
      id: 'series-perf',
      path: 'organizations/org-perf/series/series-perf',
      name: 'Perf Series',
      startDate: Timestamp.now(),
      endDate: Timestamp.now(),
      organizationBrief: {
        id: org.id,
        path: org.path,
        name: org.name,
      },
    };
    await db.doc(series.path).set(series);

    // Event 1
    const event1: Event = {
      id: 'event-1',
      path: `${series.path}/events/event-1`,
      name: 'Event 1',
      startDate: Timestamp.now(),
      endDate: Timestamp.now(),
      seriesBrief: series,
    };
    await db.doc(event1.path).set(event1);

    // Event 2
    const event2: Event = {
      id: 'event-2',
      path: `${series.path}/events/event-2`,
      name: 'Event 2',
      startDate: Timestamp.now(),
      endDate: Timestamp.now(),
      seriesBrief: series,
    };
    await db.doc(event2.path).set(event2);

    // Race 1 (in Event 1)
    const race1: Race = {
      id: 'race-1',
      path: `${event1.path}/races/race-1`,
      name: 'Race 1',
      startDate: Timestamp.now(),
      endDate: Timestamp.now(),
      eventBrief: event1,
    };
    await db.doc(race1.path).set(race1);

    // Preem 1 (in Race 1)
    const preem1: Preem = {
      id: 'preem-1',
      path: `${race1.path}/preems/preem-1`,
      name: 'Preem 1',
      raceBrief: race1,
    };
    await db.doc(preem1.path).set(preem1);

    // Contribution 1 (in Preem 1)
    const contribution1: Contribution = {
      id: 'contribution-1',
      path: `${preem1.path}/contributions/contribution-1`,
      amount: 100,
      date: Timestamp.now(),
      preemBrief: preem1,
    };
    await db.doc(contribution1.path).set(contribution1);

    // Verify
    const result = await getRenderableSeriesDataForPage(series.path);

    expect(result.series.id).toBe(series.id);
    expect(result.children).toHaveLength(2); // 2 events

    // Sort events by ID to ensure deterministic checks
    result.children.sort((a, b) => a.event.id.localeCompare(b.event.id));

    const e1 = result.children[0];
    const e2 = result.children[1];

    expect(e1.event.id).toBe('event-1');
    expect(e2.event.id).toBe('event-2');

    expect(e1.children).toHaveLength(1); // 1 race
    const r1 = e1.children[0];
    expect(r1.race.id).toBe('race-1');

    expect(r1.children).toHaveLength(1); // 1 preem
    const p1 = r1.children[0];
    expect(p1.preem.id).toBe('preem-1');

    expect(p1.children).toHaveLength(1); // 1 contribution
    const c1 = p1.children[0];
    expect(c1.id).toBe('contribution-1');
  });
});
