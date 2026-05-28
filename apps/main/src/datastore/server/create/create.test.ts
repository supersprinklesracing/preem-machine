import type { Firestore } from 'firebase-admin/firestore';

import { AuthUser } from '@/auth/user';
import { Event, Series } from '@/datastore/schema';
import { getFirestore } from '@/firebase/server/firebase-admin';
import { MOCK_AUTH_USER, setupMockDb } from '@/test-utils';

import { isUserAuthorized } from '../access';
import {
  createEvent,
  createInvite,
  createPendingContribution,
  createPreem,
  createRace,
  createSeries,
  createUser,
} from './create';

jest.mock('../access', () => ({
  isUserAuthorized: jest.fn().mockResolvedValue(true),
}));

describe('create', () => {
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
        description: 'A test series',
        website: 'https://example.com',
        location: 'San Francisco',
        startDate: new Date('2025-01-01T00:00:00Z'),
        endDate: new Date('2025-01-01T00:00:00Z'),
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
        description: 'A test series',
        website: 'https://example.com',
        location: 'San Francisco',
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
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const seriesPath = 'series/sprinkles-2025';
      const seriesDoc = await firestore.doc(seriesPath).get();
      const series = seriesDoc.data() as Series;

      const newEvent = {
        name: 'New Test Event',
        description: 'A test event',
        website: 'https://example.com',
        location: 'San Francisco',
        startDate: series.startDate,
        endDate: series.endDate,
      };
      const doc = await createEvent(seriesPath, newEvent, authUser);
      const data = doc.data();
      expect(data?.path).toEqual(doc.ref.path);
      expect(data?.name).toEqual(newEvent.name);
    });
  });

  describe('createRace', () => {
    it('should create a new race', async () => {
      const eventPath = 'events/giro-sf-2025';
      const eventDoc = await firestore.doc(eventPath).get();
      const event = eventDoc.data() as Event;
      const newRace = {
        name: 'New Test Race',
        description: 'A test race',
        website: 'https://example.com',
        location: 'San Francisco',
        startDate: event.startDate,
        endDate: event.endDate,
      };
      const doc = await createRace(eventPath, newRace, authUser);
      const data = doc.data();
      expect(data?.path).toEqual(doc.ref.path);
      expect(data?.name).toEqual(newRace.name);
    });
  });

  describe('createPreem', () => {
    it('should create a new preem', async () => {
      const newPreem = {
        name: 'New Test Preem',
        description: 'A test preem',
      };
      const doc = await createPreem('races/masters-women', newPreem, authUser);
      const data = doc.data();
      expect(data?.path).toEqual(doc.ref.path);
      expect(data?.name).toEqual(newPreem.name);
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
        'preems/first-lap',
        contribution,
        authUser,
      );

      const snapshot = await firestore
        .collection('contributions')
        .where('preemId', '==', 'first-lap')
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

  describe('createUser', () => {
    it('should create a new user and consume matching invites', async () => {
      const newUserEdits = {
        name: 'Invited User',
        email: 'invited-user@example.com',
        avatarUrl: 'https://placehold.co/100x100.png',
      };
      const newAuthUser: AuthUser = {
        uid: 'invited-user-id',
        email: 'invited-user@example.com',
      };

      await createInvite(
        {
          email: 'invited-user@example.com',
          uid: undefined,
          organizationRefs: [
            { id: 'super-sprinkles', path: 'organizations/super-sprinkles' },
          ],
        },
        authUser,
      );
      await createInvite(
        {
          uid: 'invited-user-id',
          email: undefined,
          organizationRefs: [
            { id: 'another-org', path: 'organizations/another-org' },
          ],
        },
        authUser,
      );

      const { newUserDetails, newUser } = await createUser(
        newUserEdits,
        newAuthUser,
      );

      expect(newUser.ref.path).toBe(`users/${newAuthUser.uid}`);
      expect(newUserDetails?.email).toBe(newAuthUser.email);
      expect(newUserDetails?.organizationRefs).toEqual(
        expect.arrayContaining([
          { id: 'super-sprinkles', path: 'organizations/super-sprinkles' },
          { id: 'another-org', path: 'organizations/another-org' },
        ]),
      );

      const invitesSnapshot = await firestore.collection('invites').get();
      invitesSnapshot.docs.forEach((doc) => {
        expect(doc.data()?.status).toBe('accepted');
      });
    });
  });

  describe('createInvite', () => {
    it('should create a new invite', async () => {
      const invite = {
        email: 'new-user@example.com',
        organizationRefs: [
          {
            id: 'super-sprinkles',
            path: 'organizations/super-sprinkles',
          },
        ],
      };
      const doc = await createInvite({ ...invite, uid: undefined }, authUser);
      const data = doc.data();
      expect(data?.path).toEqual(doc.ref.path);
      expect(data?.email).toEqual(invite.email);
      expect(data?.status).toEqual('pending');
    });

    it('should throw an error if the user is not authorized', async () => {
      (isUserAuthorized as jest.Mock).mockResolvedValue(false);
      const invite = {
        email: 'new-user@example.com',
        organizationRefs: [
          {
            id: 'super-sprinkles',
            path: 'organizations/super-sprinkles',
          },
        ],
      };
      await expect(
        createInvite({ ...invite, uid: undefined }, authUser),
      ).rejects.toThrow('Unauthorized');
    });
  });
});
