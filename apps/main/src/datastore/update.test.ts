import { getFirestore } from '@/firebase-admin';
import { setupMockDb } from '@/test-utils';
import type { Firestore } from 'firebase-admin/firestore';
import {
  updateEvent,
  updateOrganization,
  updatePreem,
  updateRace,
  updateSeries,
} from './update';

import { isUserAuthorized } from './access';

jest.mock('./access', () => ({
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authorization', () => {
    beforeEach(() => {
      (isUserAuthorized as jest.Mock).mockResolvedValue(false);
    });

    it('should throw an error if the user is not authorized', async () => {
      await expect(
        updateOrganization('organizations/org-super-sprinkles', {}, authUser),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateOrganization', () => {
    it('should update an organization and all its descendants and return them', async () => {
      const updates = await updateOrganization(
        'organizations/org-super-sprinkles',
        {
          name: 'New Org Name',
        },
        authUser,
      );

      expect(updates.length).toBeGreaterThanOrEqual(4);

      const org = updates.find((u) => u.updates.name === 'New Org Name');
      expect(org).toBeDefined();

      const series = updates.find(
        (u) => u.updates.organizationBrief?.name === 'New Org Name',
      );
      expect(series).toBeDefined();

      const event = updates.find(
        (u) =>
          u.updates.seriesBrief?.organizationBrief?.name === 'New Org Name',
      );
      expect(event).toBeDefined();

      const race = updates.find(
        (u) =>
          u.updates.eventBrief?.seriesBrief?.organizationBrief?.name ===
          'New Org Name',
      );
      expect(race).toBeDefined();
    });

    it('should update the organization brief in a series doc', async () => {
      await updateOrganization(
        'organizations/org-super-sprinkles',
        {
          name: 'New Org Name',
        },
        authUser,
      );

      const seriesDoc = await firestore
        .collection('organizations/org-super-sprinkles/series')
        .doc('series-sprinkles-2025')
        .get();

      const seriesData = seriesDoc.data();
      expect(seriesData?.path).toEqual(seriesDoc.ref.path);
      expect(seriesData?.organizationBrief?.name).toEqual('New Org Name');
    });
  });

  describe('updateSeries', () => {
    it('should update a series and all its descendants and return them', async () => {
      const updates = await updateSeries(
        'organizations/org-super-sprinkles/series/series-sprinkles-2025',
        {
          name: 'New Series Name',
        },
        authUser,
      );

      expect(updates.length).toBeGreaterThanOrEqual(3);

      const series = updates.find((u) => u.updates.name === 'New Series Name');
      expect(series).toBeDefined();

      const event = updates.find(
        (u) => u.updates.seriesBrief?.name === 'New Series Name',
      );
      expect(event).toBeDefined();

      const race = updates.find(
        (u) => u.updates.eventBrief?.seriesBrief?.name === 'New Series Name',
      );
      expect(race).toBeDefined();
    });

    it('should update the series brief in an event doc', async () => {
      await updateSeries(
        'organizations/org-super-sprinkles/series/series-sprinkles-2025',
        {
          name: 'New Series Name',
        },
        authUser,
      );

      const eventDoc = await firestore
        .collection(
          'organizations/org-super-sprinkles/series/series-sprinkles-2025/events',
        )
        .doc('event-giro-sf-2025')
        .get();

      const eventData = eventDoc.data();
      expect(eventData?.path).toEqual(eventDoc.ref.path);
      expect(eventData?.seriesBrief?.name).toEqual('New Series Name');
    });
  });

  describe('updateEvent', () => {
    it('should update an event and all its descendants and return them', async () => {
      const updates = await updateEvent(
        'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025',
        {
          name: 'New Event Name',
        },
        authUser,
      );

      expect(updates.length).toBeGreaterThanOrEqual(2);

      const event = updates.find((u) => u.updates.name === 'New Event Name');
      expect(event).toBeDefined();

      const race = updates.find(
        (u) => u.updates.eventBrief?.name === 'New Event Name',
      );
      expect(race).toBeDefined();
    });

    it('should update the event brief in a race doc', async () => {
      await updateEvent(
        'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025',
        {
          name: 'New Event Name',
        },
        authUser,
      );

      const raceDoc = await firestore
        .collection(
          'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races',
        )
        .doc('race-giro-sf-2025-masters-women')
        .get();

      const raceData = raceDoc.data();
      expect(raceData?.path).toEqual(raceDoc.ref.path);
      expect(raceData?.eventBrief?.name).toEqual('New Event Name');
    });
  });

  describe('updateRace', () => {
    it('should update a race and all its descendants and return them', async () => {
      const updates = await updateRace(
        'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women',
        {
          name: 'New Race Name',
        },
        authUser,
      );

      expect(updates.length).toBeGreaterThanOrEqual(2);

      const race = updates.find((u) => u.updates.name === 'New Race Name');
      expect(race).toBeDefined();

      const preem = updates.find(
        (u) => u.updates.raceBrief?.name === 'New Race Name',
      );
      expect(preem).toBeDefined();
    });

    it('should update the race brief in a preem doc', async () => {
      await updateRace(
        'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women',
        {
          name: 'New Race Name',
        },
        authUser,
      );

      const preemDoc = await firestore
        .collection(
          'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems',
        )
        .doc('preem-giro-sf-2025-masters-women-first-lap')
        .get();

      const preemData = preemDoc.data();
      expect(preemData?.path).toEqual(preemDoc.ref.path);
      expect(preemData?.raceBrief?.name).toEqual('New Race Name');
    });
  });

  describe('updatePreem', () => {
    beforeEach(async () => {
      await firestore
        .collection(
          'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap/contributions',
        )
        .doc('contribution-1')
        .set({
          path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap/contributions/contribution-1',
        });
    });

    it('should update a preem and all its descendants and return them', async () => {
      const updates = await updatePreem(
        'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap',
        {
          name: 'New Preem Name',
        },
        authUser,
      );

      expect(updates.length).toBeGreaterThanOrEqual(2);

      const preem = updates.find((u) => u.updates.name === 'New Preem Name');
      expect(preem).toBeDefined();

      const contribution = updates.find(
        (u) => u.updates.preemBrief?.name === 'New Preem Name',
      );
      expect(contribution).toBeDefined();
    });

    it('should update the preem brief in a contribution doc', async () => {
      await updatePreem(
        'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap',
        {
          name: 'New Preem Name',
        },
        authUser,
      );

      const contributionDoc = await firestore
        .collection(
          'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap/contributions',
        )
        .doc('contribution-1')
        .get();

      const contributionData = contributionDoc.data();
      expect(contributionData?.path).toEqual(contributionDoc.ref.path);
      expect(contributionData?.preemBrief?.name).toEqual('New Preem Name');
    });
  });
});
