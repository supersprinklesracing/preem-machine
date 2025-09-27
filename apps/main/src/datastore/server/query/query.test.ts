import { AuthUser } from '@/auth/user';
import { getFirestore } from '@/firebase/server/firebase-admin';
import { setupMockDb } from '@/test-utils';
import { createPendingContribution } from '../create/create';
import { getRenderableHomeDataForPage } from './query';
import { RaceBriefSchema, RaceSchema } from '../../schema';
import { getDoc } from '../query/query';

jest.setTimeout(30000);

describe('getRenderableHomeDataForPage', () => {
  setupMockDb();

  it('should not deduplicate preems with the same ID but different paths', async () => {
    const authUser: AuthUser = {
      uid: 'test-user-1',
      displayName: 'Test User 1',
      photoURL: '',
    };

    const db = await getFirestore();

    const racePath1 =
      'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women';
    const racePath2 =
      'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/juniors';

    const race1 = await getDoc(RaceSchema, racePath1);
    const raceBrief1 = RaceBriefSchema.parse(race1);
    const race2 = await getDoc(RaceSchema, racePath2);
    const raceBrief2 = RaceBriefSchema.parse(race2);

    const preemId = 'shared-preem-id';
    const preemPath1 = `${racePath1}/preems/${preemId}`;
    const preemPath2 = `${racePath2}/preems/${preemId}`;

    const preemData1 = {
      id: preemId,
      path: preemPath1,
      name: 'Preem 1',
      raceBrief: raceBrief1,
    };
    const preemData2 = {
      id: preemId,
      path: preemPath2,
      name: 'Preem 2',
      raceBrief: raceBrief2,
    };

    await db.doc(preemPath1).set(preemData1);
    await db.doc(preemPath2).set(preemData2);

    const contribution1Snap = await createPendingContribution(
      preemPath1,
      { amount: 10, message: 'test 1', isAnonymous: false },
      authUser,
    );
    const contribution2Snap = await createPendingContribution(
      preemPath2,
      { amount: 20, message: 'test 2', isAnonymous: false },
      authUser,
    );

    const contribution1Id = contribution1Snap.id;
    const contribution2Id = contribution2Snap.id;

    const { contributions } = await getRenderableHomeDataForPage();

    const contribution1 = contributions.find((c) => c.id === contribution1Id);
    const contribution2 = contributions.find((c) => c.id === contribution2Id);

    expect(contribution1).toBeDefined();
    expect(contribution2).toBeDefined();

    expect(contribution1?.preemBrief?.path).toBe(preemPath1);
    expect(contribution2?.preemBrief?.path).toBe(preemPath2);
    expect(contribution1?.preemBrief).not.toEqual(contribution2?.preemBrief);
    expect(contribution1?.preemBrief?.name).toBe('Preem 1');
    expect(contribution2?.preemBrief?.name).toBe('Preem 2');
  });
});