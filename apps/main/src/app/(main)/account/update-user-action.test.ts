import { updateUser } from '@/datastore/server/update/update';
import {
  MOCK_USER_CONTEXT,
  setupLoggedInUserContext,
  setupLoggedOutUserContext,
} from '@/test-utils';

import { updateUserAction } from './update-user-action';
import { updateUserSchema } from './user-schema';

jest.mock('@/user/server/user');
jest.mock('@/datastore/server/update/update');

describe('updateUserAction', () => {
  const mockedUpdateUser = jest.mocked(updateUser);

  const edits = updateUserSchema.parse({
    name: 'New Name',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when authenticated', () => {
    setupLoggedInUserContext();

    it('should update user', async () => {
      await updateUserAction({ edits });

      expect(mockedUpdateUser).toHaveBeenCalledWith(
        edits,
        MOCK_USER_CONTEXT.authUser,
      );
    });
  });

  describe('when not authenticated', () => {
    const { mockedRequireLoggedInUserContext } = setupLoggedOutUserContext();

    beforeEach(() => {
      mockedRequireLoggedInUserContext.mockRejectedValue(
        new Error('Not authenticated'),
      );
    });

    it('should throw a FormActionError on failure', async () => {
      await expect(updateUserAction({ edits })).rejects.toThrow(
        'Failed to save profile: Not authenticated',
      );
    });
  });
});
