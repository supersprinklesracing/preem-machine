import { getFirestore } from '@/firebase/server';
import { setupMockDb } from '@/test-utils';
import type { Firestore } from 'firebase-admin/firestore';
import {
  updateEvent,
  updateOrganization,
  updatePreem,
  updateRace,
  updateSeries,
} from './update';

import {
  ContributionSchema,
  OrganizationSchema,
  PreemSchema,
  RaceSchema,
  SeriesSchema,
} from '../../schema';
import { isUserAuthorized } from '../access';
import { converter } from '../converters';

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

      expect(updates.length).toBeGreaterThanOrEqual(4);

      const org = updates.find((u) => u.ref.path.includes('organizations'));
      expect(org?.updates).toEqual({ name: 'New Org Name' });

      const series = updates.find((u) => u.ref.path.includes('series'));
      expect(series?.updates).toEqual({
        organizationBrief: {
          id: 'super-sprinkles',
          path: 'organizations/super-sprinkles',
          name: 'New Org Name',
        },
      });

      const event = updates.find((u) => u.ref.path.includes('events'));
      expect(
        (event?.updates as any).seriesBrief.organizationBrief.name,
      ).toEqual('New Org Name');

      const race = updates.find((u) => u.ref.path.includes('races'));
      expect(
        (race?.updates as any).eventBrief.seriesBrief.organizationBrief.name,
      ).toEqual('New Org Name');
    });

    it('should update the organization brief in a series doc', async () => {
      await updateOrganization(
        'organizations/super-sprinkles',
        {
          name: 'New Org Name',
        },
        authUser,
      );

      const seriesDoc = await firestore
        .doc('organizations/super-sprinkles/series/sprinkles-2025')
        .withConverter(converter(SeriesSchema))
        .get();

      const seriesData = seriesDoc.data();
      expect(seriesData?.path).toEqual(seriesDoc.ref.path);
      expect(seriesData?.organizationBrief?.name).toEqual('New Org Name');
    });
  });

  describe('updateSeries', () => {
    it('should update a series and all its descendants and return them', async () => {
      const updates = await updateSeries(
        'organizations/super-sprinkles/series/sprinkles-2025',
        {
          name: 'New Series Name',
        },
        authUser,
      );

      expect(updates.length).toBeGreaterThanOrEqual(3);

      const series = updates.find((u) => u.ref.path.includes('series'));
      expect(series?.updates).toEqual({ name: 'New Series Name' });

      const event = updates.find((u) => u.ref.path.includes('events'));
      expect((event?.updates as any).seriesBrief.name).toEqual(
        'New Series Name',
      );

      const race = updates.find((u) => u.ref.path.includes('races'));
      expect((race?.updates as any).eventBrief.seriesBrief.name).toEqual(
        'New Series Name',
      );
    });

    it('should update the series brief in an event doc', async () => {
      await updateSeries(
        'organizations/super-sprinkles/series/sprinkles-2025',
        {
          name: 'New Series Name',
        },
        authUser,
      );

      const eventDoc = await firestore
        .doc(
          'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025',
        )
        .withConverter(converter(OrganizationSchema))
        .get();

      const eventData = eventDoc.data();
      expect(eventData?.path).toEqual(eventDoc.ref.path);
      expect((eventData as any)?.seriesBrief?.name).toEqual('New Series Name');
    });
  });

  describe('updateEvent', () => {
    it('should update an event and all its descendants and return them', async () => {
      const updates = await updateEvent(
        'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025',
        {
          name: 'New Event Name',
        },
        authUser,
      );

      expect(updates.length).toBeGreaterThanOrEqual(2);

      const event = updates.find((u) => u.ref.path.includes('events'));
      expect(event?.updates).toEqual({ name: 'New Event Name' });

      const race = updates.find((u) => u.ref.path.includes('races'));
      expect((race?.updates as any).eventBrief.name).toEqual('New Event Name');
    });

    it('should update the event brief in a race doc', async () => {
      await updateEvent(
        'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025',
        {
          name: 'New Event Name',
        },
        authUser,
      );

      const raceDoc = await firestore
        .doc(
          'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women',
        )
        .withConverter(converter(RaceSchema))
        .get();

      const raceData = raceDoc.data();
      expect(raceData?.path).toEqual(raceDoc.ref.path);
      expect(raceData?.eventBrief?.name).toEqual('New Event Name');
    });
  });

  describe('updateRace', () => {
    it('should update a race and all its descendants and return them', async () => {
      const updates = await updateRace(
        'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women',
        {
          name: 'New Race Name',
        },
        authUser,
      );

      expect(updates.length).toBeGreaterThanOrEqual(2);

      const race = updates.find((u) => u.ref.path.includes('races'));
      expect(race?.updates).toEqual({ name: 'New Race Name' });

      const preem = updates.find((u) => u.ref.path.includes('preems'));
      expect((preem?.updates as any).raceBrief.name).toEqual('New Race Name');
    });

    it('should update the race brief in a preem doc', async () => {
      await updateRace(
        'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women',
        {
          name: 'New Race Name',
        },
        authUser,
      );

      const preemDoc = await firestore
        .doc(
          'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women/preems/first-lap',
        )
        .withConverter(converter(PreemSchema))
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
          'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women/preems/first-lap/contributions',
        )
        .doc('contribution-1')
        .withConverter(converter(ContributionSchema))
        .set({
          path: 'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women/preems/first-lap/contributions/contribution-1',
        } as any);
    });

    it('should update a preem and all its descendants and return them', async () => {
      const updates = await updatePreem(
        'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women/preems/first-lap',
        {
          name: 'New Preem Name',
        },
        authUser,
      );

      expect(updates.length).toBeGreaterThanOrEqual(2);

      const preem = updates.find((u) => u.ref.path.includes('preems'));
      expect(preem?.updates).toEqual({ name: 'New Preem Name' });

      const contribution = updates.find((u) =>
        u.ref.path.includes('contributions'),
      );
      expect((contribution?.updates as any).preemBrief.name).toEqual(
        'New Preem Name',
      );
    });

    it('should update the preem brief in a contribution doc', async () => {
      await updatePreem(
        'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women/preems/first-lap',
        {
          name: 'New Preem Name',
        },
        authUser,
      );

      const contributionDoc = await firestore
        .doc(
          'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women/preems/first-lap/contributions/contribution-1',
        )
        .withConverter(converter(ContributionSchema))
        .get();

      const contributionData = contributionDoc.data();
      expect(contributionData?.path).toEqual(contributionDoc.ref.path);
      expect(contributionData?.preemBrief?.name).toEqual('New Preem Name');
    });
  });
});
