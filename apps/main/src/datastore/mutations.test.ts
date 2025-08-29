import { getFirestore } from '@/firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';
import { createMockDb } from './mock-db';
import { updateOrganizationAndDescendants } from './mutations';

describe('mutations', () => {
  let firestore: Firestore;
  const authUser = { uid: 'BFGvWNXZoCWayJa0pNEL4bfhtUC3' };

  beforeEach(async () => {
    firestore = await getFirestore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (firestore as unknown as any).database = createMockDb(firestore);
  });

  describe('updateOrganizationAndDescendants', () => {
    it('should update the organization and its direct descendants', async () => {
      const orgId = 'org-super-sprinkles';
      const newName = 'New Super Sprinkles Racing';

      await updateOrganizationAndDescendants(authUser, orgId, {
        name: newName,
      });

      const db = (firestore as any).database;

      // Verify organization is updated
      const org = db.organizations.find((o) => o.id === orgId);
      expect(org.name).toBe(newName);

      // Verify series is updated
      const series = org._collections.series[0];
      expect(series.organizationBrief.name).toBe(newName);
    });
  });
});
