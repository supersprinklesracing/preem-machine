import { User } from '@/datastore/schema';
import { getDoc } from '@/datastore/server/query/query';
import { updateUser } from '@/datastore/server/update/update';
import { getFirebaseStorage } from '@/firebase/server/firebase-admin';
import { MOCK_AUTH_USER, setupValidUserContext } from '@/test-utils';
import { verifyUserContext } from '@/user/server/user';

import { editUserAction } from './edit-user-action';
import { updateUserSchema } from './user-schema';

jest.mock('@/user/server/user');
jest.mock('@/datastore/server/query/query');
jest.mock('@/datastore/server/update/update');
jest.mock('@/firebase/server/firebase-admin', () => ({
  getFirebaseStorage: jest.fn(),
}));

describe('editUserAction', () => {
  setupValidUserContext();

  const mockedGetFirebaseStorage = jest.mocked(getFirebaseStorage);
  const mockedGetDoc = jest.mocked(getDoc);
  const mockedUpdateUser = jest.mocked(updateUser);

  const mockDelete = jest.fn();
  const mockFile = jest.fn(() => ({
    delete: mockDelete,
  }));
  const mockBucket = {
    file: mockFile,
  };
  (mockedGetFirebaseStorage as jest.Mock).mockReturnValue({
    bucket: () => mockBucket,
  });

  const edits = updateUserSchema.parse({
    name: 'New Name',
    avatarUrl: 'https://new.com/avatar.png',
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetDoc.mockResolvedValue({
      name: 'Old Name',
      avatarUrl: 'https://old.com/avatar.png',
    } as User);
  });

  it('should update user and delete old avatar on success', async () => {
    await editUserAction({ edits });

    expect(mockedGetDoc).toHaveBeenCalledWith(
      updateUserSchema,
      `users/${MOCK_AUTH_USER.uid}`,
    );
    expect(mockedUpdateUser).toHaveBeenCalledWith(edits, MOCK_AUTH_USER);
    expect(mockFile).toHaveBeenCalledWith('avatar.png');
    expect(mockDelete).toHaveBeenCalled();
  });

  it('should not delete avatar if the url is the same', async () => {
    mockedGetDoc.mockResolvedValue({
      name: 'Old Name',
      avatarUrl: edits.avatarUrl,
    } as User);

    await editUserAction({ edits });

    expect(mockedUpdateUser).toHaveBeenCalledWith(edits, MOCK_AUTH_USER);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('should not attempt to delete if there was no old avatar', async () => {
    mockedGetDoc.mockResolvedValue({
      name: 'Old Name',
      avatarUrl: undefined,
    } as User);

    await editUserAction({ edits });

    expect(mockedUpdateUser).toHaveBeenCalledWith(edits, MOCK_AUTH_USER);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('should handle storage deletion errors gracefully', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {
        /* empty */
      });
    mockDelete.mockRejectedValue(new Error('Storage failed'));

    await editUserAction({ edits });

    expect(mockedUpdateUser).toHaveBeenCalledWith(edits, MOCK_AUTH_USER);
    expect(mockDelete).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to delete old avatar:',
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });

  it('should throw a FormActionError on failure', async () => {
    jest
      .mocked(verifyUserContext)
      .mockRejectedValue(new Error('Not authenticated'));

    await expect(editUserAction({ edits })).rejects.toThrow(
      'Failed to save profile: Not authenticated',
    );
  });
});
