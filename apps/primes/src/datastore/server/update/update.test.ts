import type { Firestore } from 'firebase-admin/firestore';

import { Contribution, ContributionSchema } from '@/datastore/schema';
import {
  getFirebaseAuthAdmin,
  getFirestore,
} from '@/firebase/server/firebase-admin';
import { setupMockDb } from '@/test-utils';

import { isUserAuthorized } from '../access';
import { converter } from '../converters';
import {
  updateEvent,
  updateOrganization,
  updatePreem,
  updateRace,
  updateSeries,
  updateUser,
  updateUserAvatar,
} from './update';

const mockUpdateUser = jest.fn();

jest.mock('@/firebase/server/firebase-admin', () => ({
  ...jest.requireActual('@/firebase/server/firebase-admin'),
  getFirebaseAuthAdmin: jest.fn(() => ({
    updateUser: mockUpdateUser,
  })),
}));

jest.mock('../access', () => ({
  isUserAuthorized: jest.fn().mockResolvedValue(true),
}));

describe('update mutations', () => {
  let firestore: Firestore;
  const authUser = { uid: 'test-user' };

  setupMockDb();

  beforeAll(async () => {
    firestore = await getFirestore();
  });

  beforeEach(async () => {
    (isUserAuthorized as jest.Mock).mockClear();
    (isUserAuthorized as jest.Mock).mockResolvedValue(true);
    mockUpdateUser.mockClear();
    (getFirebaseAuthAdmin as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('authorization', () => {
    beforeEach(() => {
      (isUserAuthorized as jest.Mock).mockResolvedValue(false);
    });

    it('should throw an error if the user is not authorized', async () => {
      await expect(
        updateOrganization('organizations/super-sprinkles', {}, authUser),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateOrganization', () => {
    it('should update an organization and all its descendants and return them', async () => {
      const updates = await updateOrganization(
        'organizations/super-sprinkles',
        {
          name: 'New Org Name',
        },
        authUser,
      );

      expect(updates.length).toBe(1);

      const org = updates[0];
      expect(org?.updates).toEqual({ name: 'New Org Name' });
    });
  });

  describe('updateSeries', () => {
    it('should update a series and all its descendants and return them', async () => {
      const updates = await updateSeries(
        'series/sprinkles-2025',
        {
          name: 'New Series Name',
        },
        authUser,
      );

      expect(updates.length).toBe(1);

      const series = updates[0];
      expect(series?.updates).toEqual({ name: 'New Series Name' });
    });
  });

  describe('updateEvent', () => {
    it('should update an event and all its descendants and return them', async () => {
      const updates = await updateEvent(
        'events/giro-sf-2025',
        {
          name: 'New Event Name',
        },
        authUser,
      );

      expect(updates.length).toBe(1);

      const event = updates[0];
      expect(event?.updates).toEqual({ name: 'New Event Name' });
    });
  });

  describe('updateRace', () => {
    it('should update a race and all its descendants and return them', async () => {
      const updates = await updateRace(
        'races/masters-women',
        {
          name: 'New Race Name',
        },
        authUser,
      );

      expect(updates.length).toBe(1);

      const race = updates[0];
      expect(race?.updates).toEqual({ name: 'New Race Name' });
    });
  });

  describe('updatePreem', () => {
    beforeEach(async () => {
      await firestore
        .collection('contributions')
        .doc('contribution-1')
        .withConverter(converter(ContributionSchema))
        .set({
          path: 'contributions/contribution-1',
        } as Partial<Contribution>);
    });

    it('should update a preem and all its descendants and return them', async () => {
      const updates = await updatePreem(
        'preems/first-lap',
        {
          name: 'New Preem Name',
        },
        authUser,
      );

      expect(updates.length).toBe(1);

      const preem = updates[0];
      expect(preem?.updates).toEqual({ name: 'New Preem Name' });
    });
  });

  describe('updateUser', () => {
    it('should update the user in firestore and in firebase auth', async () => {
      await updateUser({ name: 'New User Name' }, authUser);
      expect(getFirebaseAuthAdmin).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalledWith(authUser.uid, {
        displayName: 'New User Name',
      });
    });
  });

  describe('updateUserAvatar', () => {
    it('should update the user in firestore and in firebase auth', async () => {
      await updateUserAvatar({ avatarUrl: 'https://new-avatar.com' }, authUser);
      expect(getFirebaseAuthAdmin).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalledWith(authUser.uid, {
        photoURL: 'https://new-avatar.com',
      });
    });

    it('should remove the avatarUrl if it is empty', async () => {
      await updateUserAvatar({ avatarUrl: '' }, authUser);
      expect(getFirebaseAuthAdmin).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalledWith(authUser.uid, {
        photoURL: null,
      });
    });
  });
});
