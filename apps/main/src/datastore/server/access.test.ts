import { setupMockDb } from '@/test-utils';

import { MOCK_USER_1 } from '../mock-db';
import { isUserAuthorized } from './access';

describe('isUserAuthorized', () => {
  setupMockDb();

  it('should return true if the user is a member of the organization', async () => {
    const authUser = { uid: MOCK_USER_1.id, email: MOCK_USER_1.email };
    const result = await isUserAuthorized(
      authUser,
      'organizations/super-sprinkles',
    );
    expect(result).toBe(true);
  });

  it('should return false if the user is not a member of the organization', async () => {
    const authUser = { uid: 'some-other-user', email: 'other@test.com' };
    const result = await isUserAuthorized(
      authUser,
      'organizations/super-sprinkles',
    );
    expect(result).toBe(false);
  });

  it('should return true if the user is the owner of the user document', async () => {
    const authUser = { uid: MOCK_USER_1.id, email: MOCK_USER_1.email };
    const result = await isUserAuthorized(authUser, `users/${MOCK_USER_1.id}`);
    expect(result).toBe(true);
  });

  it('should return false if the user is not the owner of the user document', async () => {
    const authUser = { uid: 'some-other-user', email: 'other@test.com' };
    const result = await isUserAuthorized(authUser, `users/${MOCK_USER_1.id}`);
    expect(result).toBe(false);
  });

  it('should return false if the document does not exist', async () => {
    const authUser = { uid: MOCK_USER_1.id, email: MOCK_USER_1.email };
    const result = await isUserAuthorized(
      authUser,
      'organizations/does-not-exist',
    );
    expect(result).toBe(false);
  });

  it('should return true for a sub-collection document if the user has access to the root document', async () => {
    const authUser = { uid: MOCK_USER_1.id, email: MOCK_USER_1.email };
    const result = await isUserAuthorized(
      authUser,
      'organizations/super-sprinkles/series/sprinkles-2025',
    );
    expect(result).toBe(true);
  });

  it('should return false for a sub-collection document if the user does not have access to the root document', async () => {
    const authUser = { uid: 'some-other-user', email: 'other@test.com' };
    const result = await isUserAuthorized(
      authUser,
      'organizations/super-sprinkles/series/sprinkles-2025',
    );
    expect(result).toBe(false);
  });
});
