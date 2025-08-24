import { createMockDb } from '@/datastore/mock-db';
import { getFirestore } from '@/firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';
import {
  updateSeries,
  updateEvent,
  updateRace,
  updatePreem,
} from './mutations';
import { User, Series, Event, Race, Preem, Contribution } from './types';

const MOCK_USER: User = { id: 'user1', name: 'Test User' };

describe('firestore-mocks', () => {
  let firestore: Firestore;
  beforeAll(async () => {
    firestore = await getFirestore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (firestore as unknown as any).database = createMockDb(firestore);
  });
  it('Basic query', async () => {
    const querySnapshot = await firestore.collection('users').get();
    expect(querySnapshot.size).toBe(5);
  });
});

describe('Recursive Updates', () => {
  let firestore: Firestore;
  let mockDb: any;

  beforeEach(async () => {
    firestore = await getFirestore();
    mockDb = createMockDb(firestore);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (firestore as unknown as any).database = mockDb;

    // Create mock data
    const series: Series = {
      id: 'series1',
      name: 'Test Series',
      organizationBrief: { id: 'org1', name: 'Test Org' },
    };
    const event: Event = {
      id: 'event1',
      name: 'Test Event',
      seriesBrief: { id: 'series1', name: 'Test Series' },
    };
    const race: Race = {
      id: 'race1',
      name: 'Test Race',
      eventBrief: {
        id: 'event1',
        name: 'Test Event',
        seriesBrief: { id: 'series1', name: 'Test Series' },
      },
    };
    const preem: Preem = {
      id: 'preem1',
      name: 'Test Preem',
      raceBrief: {
        id: 'race1',
        name: 'Test Race',
        eventBrief: {
          id: 'event1',
          name: 'Test Event',
          seriesBrief: { id: 'series1', name: 'Test Series' },
        },
      },
    };
    const contribution: Contribution = {
      id: 'contrib1',
      preemBrief: {
        id: 'preem1',
        name: 'Test Preem',
        raceBrief: {
          id: 'race1',
          name: 'Test Race',
          eventBrief: {
            id: 'event1',
            name: 'Test Event',
            seriesBrief: { id: 'series1', name: 'Test Series' },
          },
        },
      },
    };

    mockDb.organizations.doc('org1').set({ id: 'org1', name: 'Test Org' });
    mockDb.series.doc('series1').set(series);
    mockDb.events.doc('event1').set(event);
    mockDb.races.doc('race1').set(race);
    mockDb.preems.doc('preem1').set(preem);
    mockDb.contributions.doc('contrib1').set(contribution);
  });

  it('should update series and all descendants', async () => {
    await updateSeries(
      'series/series1',
      { name: 'New Series Name' },
      { uid: 'user1' }
    );

    const updatedEvent = (await firestore.collection('events').doc('event1').get()).data();
    const updatedRace = (await firestore.collection('races').doc('race1').get()).data();
    const updatedPreem = (await firestore.collection('preems').doc('preem1').get()).data();
    const updatedContribution = (await firestore.collection('contributions').doc('contrib1').get()).data();

    expect(updatedEvent?.seriesBrief?.name).toBe('New Series Name');
    expect(updatedRace?.eventBrief?.seriesBrief?.name).toBe('New Series Name');
    expect(updatedPreem?.raceBrief?.eventBrief?.seriesBrief?.name).toBe('New Series Name');
    expect(updatedContribution?.preemBrief?.raceBrief?.eventBrief?.seriesBrief?.name).toBe('New Series Name');
  });

  it('should update event and all descendants', async () => {
    await updateEvent(
      'events/event1',
      { name: 'New Event Name' },
      { uid: 'user1' }
    );

    const updatedRace = (await firestore.collection('races').doc('race1').get()).data();
    const updatedPreem = (await firestore.collection('preems').doc('preem1').get()).data();
    const updatedContribution = (await firestore.collection('contributions').doc('contrib1').get()).data();

    expect(updatedRace?.eventBrief?.name).toBe('New Event Name');
    expect(updatedPreem?.raceBrief?.eventBrief?.name).toBe('New Event Name');
    expect(updatedContribution?.preemBrief?.raceBrief?.eventBrief?.name).toBe('New Event Name');
  });

  it('should update race and all descendants', async () => {
    await updateRace(
        'races/race1',
        { name: 'New Race Name' },
        { uid: 'user1' }
    );

    const updatedPreem = (await firestore.collection('preems').doc('preem1').get()).data();
    const updatedContribution = (await firestore.collection('contributions').doc('contrib1').get()).data();

    expect(updatedPreem?.raceBrief?.name).toBe('New Race Name');
    expect(updatedContribution?.preemBrief?.raceBrief?.name).toBe('New Race Name');
  });

  it('should update preem and all descendants', async () => {
    await updatePreem(
        'preems/preem1',
        { name: 'New Preem Name' },
        { uid: 'user1' }
    );

    const updatedContribution = (await firestore.collection('contributions').doc('contrib1').get()).data();

    expect(updatedContribution?.preemBrief?.name).toBe('New Preem Name');
  });
});
