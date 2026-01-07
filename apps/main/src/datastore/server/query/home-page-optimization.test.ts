import { type Firestore, Timestamp } from 'firebase-admin/firestore';

import {
  Event,
  Organization,
  Race,
  Series,
} from '@/datastore/schema';
import { getFirestore } from '@/firebase/server/firebase-admin';
import { setupMockDb } from '@/test-utils';

import { getRenderableHomeDataForPage } from './query';

jest.mock('@/firebase/server/firebase-admin', () => {
  const originalModule = jest.requireActual('@/firebase/server/firebase-admin');
  return {
    ...originalModule,
  };
});

describe('query performance N+1', () => {
  let db: Firestore;
  setupMockDb();

  beforeAll(async () => {
    db = await getFirestore();
  });

  it('demonstrates N+1 problem when fetching races for multiple events', async () => {
    // Setup data
    const org1: Organization = {
      id: 'org-perf-n1',
      path: 'organizations/org-perf-n1',
      name: 'Perf Org N1',
      stripe: {},
    };
    await db.doc(org1.path).set(org1);

    const series1: Series = {
      id: 'series-perf-n1',
      path: 'organizations/org-perf-n1/series/series-perf-n1',
      name: 'Perf Series N1',
      startDate: Timestamp.fromDate(new Date('2030-01-01')),
      endDate: Timestamp.fromDate(new Date('2030-01-31')),
      organizationBrief: {
        id: 'org-perf-n1',
        path: 'organizations/org-perf-n1',
        name: 'Perf Org N1',
      },
    };
    await db.doc(series1.path).set(series1);

    // Create 3 events
    for (let i = 1; i <= 3; i++) {
        const event: Event = {
            id: `event-perf-n1-${i}`,
            path: `organizations/org-perf-n1/series/series-perf-n1/events/event-perf-n1-${i}`,
            name: `Perf Event N1 ${i}`,
            startDate: Timestamp.fromDate(new Date('2030-01-10')),
            endDate: Timestamp.fromDate(new Date('2030-01-20')),
            seriesBrief: series1,
        };
        await db.doc(event.path).set(event);

        // Create 1 race per event
        const race: Race = {
            id: `race-perf-n1-${i}`,
            path: `${event.path}/races/race-perf-n1-${i}`,
            name: `Perf Race N1 ${i}`,
            startDate: Timestamp.fromDate(new Date('2030-01-12')),
            endDate: Timestamp.fromDate(new Date('2030-01-18')),
            eventBrief: event,
        };
        await db.doc(race.path).set(race);
    }

    // Spy on Firestore collectionGroup
    const collectionGroupSpy = jest.spyOn(db, 'collectionGroup');

    // Fetch data
    const { eventsWithRaces } = await getRenderableHomeDataForPage();

    const calls = collectionGroupSpy.mock.calls;
    const racesCalls = calls.filter((call) => call[0] === 'races');

    console.log('Races collectionGroup calls:', racesCalls.length);
    console.log('Events found:', eventsWithRaces.map(e => e.event.id));

    // Optimized implementation: should call collectionGroup('races') once
    expect(racesCalls.length).toBe(1);

    // Verify data correctness
    // We might have seeded data, so we check if AT LEAST our 3 events are there.
    expect(eventsWithRaces.length).toBeGreaterThanOrEqual(3);

    // Filter to check our events
    const myEvents = eventsWithRaces.filter(e => e.event.id.startsWith('event-perf-n1-'));
    expect(myEvents.length).toBe(3);

    for (const eventWithRaces of myEvents) {
        expect(eventWithRaces.children.length).toBe(1);
        expect(eventWithRaces.children[0].race.name).toContain('Perf Race N1');
    }
  });
});
