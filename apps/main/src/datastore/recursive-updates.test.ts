import {
  updateSeries,
  updateEvent,
  updateRace,
  updatePreem,
} from './mutations';
import { User } from './types';
import { getFirestore } from '@/firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';
import { createMockDb } from './mock-db';

// Set dummy environment variables for Firebase initialization
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test';
process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL = 'test';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test';
process.env.AUTH_COOKIE_NAME = 'test';
process.env.AUTH_COOKIE_SIGNATURE_KEY_CURRENT = 'test';
process.env.AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS = 'test';
process.env.SERVICE_ACCOUNT_CLIENT_EMAIL = 'test@example.com';
process.env.SERVICE_ACCOUNT_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\nFAKE_KEY\\n-----END PRIVATE KEY-----\\n';


const MOCK_USER: User = { id: 'BFGvWNXZoCWayJa0pNEL4bfhtUC3', name: 'Test User' };

jest.mock('@/firebase-admin', () => ({
    getFirestore: () => {
        const { Firestore } = require('@google-cloud/firestore');
        return new Firestore();
    }
}));

describe('Recursive Updates', () => {
  let firestore: Firestore;

  beforeEach(async () => {
    firestore = getFirestore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (firestore as any).database = createMockDb(firestore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update series and all descendants', async () => {
    await updateSeries(
      'organizations/org-super-sprinkles/series/series-sprinkles-2025',
      { name: 'New Series Name' },
      MOCK_USER
    );

    const updatedEvent = (await firestore.collection('organizations/org-super-sprinkles/series/series-sprinkles-2025/events').doc('event-giro-sf-2025').get()).data();
    const updatedRace = (await firestore.collection('organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races').doc('race-giro-sf-2025-masters-women').get()).data();
    const updatedPreem = (await firestore.collection('organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems').doc('preem-giro-sf-2025-masters-women-first-lap').get()).data();
    const updatedContribution = (await firestore.collection('organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap/contributions').doc('contrib-1').get()).data();

    expect(updatedEvent?.seriesBrief?.name).toBe('New Series Name');
    expect(updatedRace?.eventBrief?.seriesBrief?.name).toBe('New Series Name');
    expect(updatedPreem?.raceBrief?.eventBrief?.seriesBrief?.name).toBe('New Series Name');
    expect(updatedContribution?.preemBrief?.raceBrief?.eventBrief?.seriesBrief?.name).toBe('New Series Name');
  });

  it('should update event and all descendants', async () => {
    await updateEvent(
      'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025',
      { name: 'New Event Name' },
      MOCK_USER
    );

    const updatedRace = (await firestore.collection('organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races').doc('race-giro-sf-2025-masters-women').get()).data();
    const updatedPreem = (await firestore.collection('organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems').doc('preem-giro-sf-2025-masters-women-first-lap').get()).data();
    const updatedContribution = (await firestore.collection('organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap/contributions').doc('contrib-1').get()).data();

    expect(updatedRace?.eventBrief?.name).toBe('New Event Name');
    expect(updatedPreem?.raceBrief?.eventBrief?.name).toBe('New Event Name');
    expect(updatedContribution?.preemBrief?.raceBrief?.eventBrief?.name).toBe('New Event Name');
  });

  it('should update race and all descendants', async () => {
    await updateRace(
        'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women',
        { name: 'New Race Name' },
        MOCK_USER
    );

    const updatedPreem = (await firestore.collection('organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems').doc('preem-giro-sf-2025-masters-women-first-lap').get()).data();
    const updatedContribution = (await firestore.collection('organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap/contributions').doc('contrib-1').get()).data();

    expect(updatedPreem?.raceBrief?.name).toBe('New Race Name');
    expect(updatedContribution?.preemBrief?.raceBrief?.name).toBe('New Race Name');
  });

  it('should update preem and all descendants', async () => {
    await updatePreem(
        'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap',
        { name: 'New Preem Name' },
        MOCK_USER
    );

    const updatedContribution = (await firestore.collection('organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap/contributions').doc('contrib-1').get()).data();

    expect(updatedContribution?.preemBrief?.name).toBe('New Preem Name');
  });
});
