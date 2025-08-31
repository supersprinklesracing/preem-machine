import { getFirestore } from '@/firebase-admin';
import { setupMockDb } from '@/test-utils';
import type { Firestore } from 'firebase-admin/firestore';
import {
  updateEventAndDescendants,
  updateOrganizationAndDescendants,
  updateRaceAndDescendants,
  updateSeriesAndDescendants,
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
        updateOrganizationAndDescendants(
          authUser,
          'organizations/org-super-sprinkles',
          {},
        ),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateOrganizationAndDescendants', () => {
    it('should update an organization and all its descendants and return them', async () => {
      const modifiedDocs = await updateOrganizationAndDescendants(
        authUser,
        'organizations/org-super-sprinkles',
        {
          name: 'New Org Name',
        },
      );

      expect(modifiedDocs.length).toBeGreaterThanOrEqual(4);

      const org = modifiedDocs.find((d) => d.name === 'New Org Name');
      expect(org).toBeDefined();

      const series = modifiedDocs.find(
        (d) => d.organizationBrief?.name === 'New Org Name',
      );
      expect(series).toBeDefined();

      const event = modifiedDocs.find(
        (d) => d.seriesBrief?.organizationBrief?.name === 'New Org Name',
      );
      expect(event).toBeDefined();

      const race = modifiedDocs.find(
        (d) =>
          d.eventBrief?.seriesBrief?.organizationBrief?.name === 'New Org Name',
      );
      expect(race).toBeDefined();
    });

    it('should update the organization brief in a series doc', async () => {
      await updateOrganizationAndDescendants(
        authUser,
        'organizations/org-super-sprinkles',
        {
          name: 'New Org Name',
        },
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

  describe('updateSeriesAndDescendants', () => {
    it('should update a series and all its descendants and return them', async () => {
      const modifiedDocs = await updateSeriesAndDescendants(
        authUser,
        'organizations/org-super-sprinkles/series/series-sprinkles-2025',
        {
          name: 'New Series Name',
        },
      );

      expect(modifiedDocs.length).toBeGreaterThanOrEqual(3);

      const series = modifiedDocs.find((d) => d.name === 'New Series Name');
      expect(series).toBeDefined();

      const event = modifiedDocs.find(
        (d) => d.seriesBrief?.name === 'New Series Name',
      );
      expect(event).toBeDefined();

      const race = modifiedDocs.find(
        (d) => d.eventBrief?.seriesBrief?.name === 'New Series Name',
      );
      expect(race).toBeDefined();
    });

    it('should update the series brief in an event doc', async () => {
      await updateSeriesAndDescendants(
        authUser,
        'organizations/org-super-sprinkles/series/series-sprinkles-2025',
        {
          name: 'New Series Name',
        },
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

  describe('updateEventAndDescendants', () => {
    it('should update an event and all its descendants and return them', async () => {
      const modifiedDocs = await updateEventAndDescendants(
        authUser,
        'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025',
        {
          name: 'New Event Name',
        },
      );

      expect(modifiedDocs.length).toBeGreaterThanOrEqual(2);

      const event = modifiedDocs.find((d) => d.name === 'New Event Name');
      expect(event).toBeDefined();

      const race = modifiedDocs.find(
        (d) => d.eventBrief?.name === 'New Event Name',
      );
      expect(race).toBeDefined();
    });

    it('should update the event brief in a race doc', async () => {
      await updateEventAndDescendants(
        authUser,
        'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025',
        {
          name: 'New Event Name',
        },
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

  describe('updateRaceAndDescendants', () => {
    it('should update a race and all its descendants and return them', async () => {
      const modifiedDocs = await updateRaceAndDescendants(
        authUser,
        'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women',
        {
          name: 'New Race Name',
        },
      );

      expect(modifiedDocs.length).toBeGreaterThanOrEqual(2);

      const race = modifiedDocs.find((d) => d.name === 'New Race Name');
      expect(race).toBeDefined();

      const preem = modifiedDocs.find(
        (d) => d.raceBrief?.name === 'New Race Name',
      );
      expect(preem).toBeDefined();
    });

    it('should update the race brief in a preem doc', async () => {
      await updateRaceAndDescendants(
        authUser,
        'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women',
        {
          name: 'New Race Name',
        },
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
});
