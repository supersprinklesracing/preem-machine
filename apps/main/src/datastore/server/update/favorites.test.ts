import {
  addFavorite,
  removeFavorite,
} from '@/datastore/server/update/favorites';
import { getFirestore } from '@/firebase/server/firebase-admin';
import { User, DocRef } from '@/datastore/schema';
import { verifyUserContext } from '@/user/server/user';
import { FakeFirestore } from 'firestore-jest-mock';

jest.mock('@/user/server/user', () => ({
  verifyUserContext: jest.fn(),
}));

describe('favorites', () => {
  let testUser: User;
  let docRef: DocRef;
  let firestore: FakeFirestore;

  beforeEach(async () => {
    const userRef = (await getFirestore()).collection('users').doc('test-user');
    testUser = {
      id: 'test-user',
      path: userRef.path,
      favoriteRefs: [],
    };
    await userRef.set(testUser);

    docRef = {
      id: 'test-doc',
      path: 'organizations/test-doc',
    };

    (verifyUserContext as jest.Mock).mockResolvedValue({
      user: testUser,
      authUser: { uid: 'test-user' } as any,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('adds a favorite to the user', async () => {
    await addFavorite(docRef);

    const userDoc = await (await getFirestore())
      .collection('users')
      .doc(testUser.id)
      .get();
    const userData = userDoc.data() as any;

    expect(userData.favoriteRefs.type).toBe('arrayUnion');
    expect(userData.favoriteRefs.value).toEqual([docRef]);
  });

  it('removes a favorite from the user', async () => {
    await addFavorite(docRef);
    await removeFavorite(docRef);

    const userDoc = await (await getFirestore())
      .collection('users')
      .doc(testUser.id)
      .get();
    const userData = userDoc.data() as any;

    expect(userData.favoriteRefs.type).toBe('arrayRemove');
    expect(userData.favoriteRefs.value).toEqual([docRef]);
  });
});
