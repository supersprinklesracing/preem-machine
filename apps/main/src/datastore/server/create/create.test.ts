import type { Firestore } from 'firebase-admin/firestore';

import { AuthUser } from '@/auth/user';
import { Event, Series } from '@/datastore/schema';
import { getFirestore } from '@/firebase/server/firebase-admin';
import { MOCK_AUTH_USER, setupMockDb } from '@/test-utils';

import { isUserAuthorized } from '../access';
import {
  createEvent,
  createPendingContribution,
  createPreem,
  createRace,
  createSeries,
} from './create';

jest.mock('../access', () => ({
  isUserAuthorized: jest.fn().mockResolvedValue(true),
}));

describe('create mutations', () => {
  let firestore: Firestore;
  const authUser = MOCK_AUTH_USER;

  setupMockDb();

  beforeAll(async () => {
    firestore = await getFirestore();
  });

  beforeEach(() => {
    (isUserAuthorized as jest.Mock).mockClear();
    (isUserAuthorized as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('authorization', () => {
    it('should throw an error if the user is not authorized', async () => {
      (isUserAuthorized as jest.Mock).mockResolvedValue(false);
      const newSeries = {
        name: 'New Test Series',
      };
      await expect(
        createSeries('organizations/super-sprinkles', newSeries, authUser),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('createSeries', () => {
    it('should create a new series', async () => {
      const newSeries = {
        name: 'New Test Series',
        startDate: new Date('2025-01-01T00:00:00Z'),
        endDate: new Date('2025-01-01T00:00:00Z'),
      };
      const doc = await createSeries(
        'organizations/super-sprinkles',
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
      const seriesPath = 'organizations/super-sprinkles/series/sprinkles-2025';
      const seriesDoc = await firestore.doc(seriesPath).get();
      const series = seriesDoc.data() as Series;

      const newEvent = {
        name: 'New Test Event',
        startDate: series.startDate,
        endDate: series.endDate,
      };
      const doc = await createEvent(seriesPath, newEvent, authUser);
      const data = doc.data();
      expect(data?.path).toEqual(doc.ref.path);
      expect(data?.name).toEqual(newEvent.name);
      expect(data?.seriesBrief?.name).toEqual('Sprinkles 2025');
    });
  });

  describe('createRace', () => {
    it('should create a new race', async () => {
      const eventPath =
        'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025';
      const eventDoc = await firestore.doc(eventPath).get();
      const event = eventDoc.data() as Event;
      const newRace = {
        name: 'New Test Race',
        startDate: event.startDate,
        endDate: event.endDate,
      };
      const doc = await createRace(eventPath, newRace, authUser);
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
        'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women',
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
        'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women/preems/first-lap',
        contribution,
        authUser,
      );

      const snapshot = await firestore
        .collection(
          'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women/preems/first-lap/contributions',
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
        createPendingContribution('preem-path', contribution, {} as AuthUser),
      ).rejects.toThrow('Unauthorized');
    });
  });
});
