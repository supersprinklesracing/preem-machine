import { createMockDb } from '@/datastore/mock-db';
import { getFirestore } from '@/firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';
import {
  createEvent,
  createPendingContribution,
  createPreem,
  createRace,
  createSeries,
} from './create';

import { isUserAuthorized } from './access';

jest.mock('./access', () => ({
  isUserAuthorized: jest.fn().mockResolvedValue(true),
}));

describe('create mutations', () => {
  let firestore: Firestore;
  const authUser = { uid: 'test-user' };

  beforeEach(async () => {
    firestore = await getFirestore();
    (firestore as any).database = createMockDb(firestore);
    (isUserAuthorized as jest.Mock).mockClear();
    (isUserAuthorized as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authorization', () => {
    it('should throw an error if the user is not authorized', async () => {
      (isUserAuthorized as jest.Mock).mockResolvedValue(false);
      const newSeries = {
        name: 'New Test Series',
      };
      await expect(
        createSeries('organizations/org-super-sprinkles', newSeries, authUser),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('createSeries', () => {
    it('should create a new series', async () => {
      const newSeries = {
        name: 'New Test Series',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-01T00:00:00Z',
      };
      const doc = await createSeries(
        'organizations/org-super-sprinkles',
        newSeries,
        authUser,
      );
      const data = doc.data();
      expect(data?.path).toEqual(doc.ref.path);
      expect(data?.name).toEqual(newSeries.name);
      expect(data?.organizationBrief?.name).toEqual('Super Sprinkles Racing');
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const newEvent = {
        name: 'New Test Event',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-01T00:00:00Z',
      };
      const doc = await createEvent(
        'organizations/org-super-sprinkles/series/series-sprinkles-2025',
        newEvent,
        authUser,
      );
      const data = doc.data();
      expect(data?.path).toEqual(doc.ref.path);
      expect(data?.name).toEqual(newEvent.name);
      expect(data?.seriesBrief?.name).toEqual('Sprinkles 2025');
    });
  });

  describe('createRace', () => {
    it('should create a new race', async () => {
      const newRace = {
        name: 'New Test Race',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-01T00:00:00Z',
      };
      const doc = await createRace(
        'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025',
        newRace,
        authUser,
      );
      const data = doc.data();
      expect(data?.path).toEqual(doc.ref.path);
      expect(data?.name).toEqual(newRace.name);
      expect(data?.eventBrief?.name).toEqual('Il Giro di San Francisco');
    });
  });

  describe('createPreem', () => {
    it('should create a new preem', async () => {
      const newPreem = {
        name: 'New Test Preem',
      };
      const doc = await createPreem(
        'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women',
        newPreem,
        authUser,
      );
      const data = doc.data();
      expect(data?.path).toEqual(doc.ref.path);
      expect(data?.name).toEqual(newPreem.name);
      expect(data?.raceBrief?.name).toEqual('Master Women 40+/50+');
    });
  });

  describe('createPendingContribution', () => {
    it('should create a new pending contribution', async () => {
      const contribution = {
        amount: 101,
        message: 'Test contribution',
        isAnonymous: false,
      };
      await createPendingContribution(
        'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap',
        contribution,
        authUser,
      );

      const snapshot = await firestore
        .collection(
          'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap/contributions',
        )
        .get();

      expect(snapshot.docs.length).toBe(2);
      const newDoc = snapshot.docs.find((d) => d.data().amount === 101);
      expect(newDoc).toBeDefined();
      expect(newDoc?.data().message).toEqual(contribution.message);
      expect(newDoc?.data().status).toEqual('pending');
    });

    it('should throw an error if the user is not authorized', async () => {
      const contribution = {
        amount: 101,
        message: 'Test contribution',
        isAnonymous: false,
      };
      await expect(
        createPendingContribution('preem-path', contribution, {} as any),
      ).rejects.toThrow('Unauthorized');
    });
  });
});
