import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import { App } from 'firebase-admin/app';

import {
  getFirebaseAdminApp,
  getFirebaseStorage,
} from '@/firebase/server/firebase-admin';
import {
  setupLoggedInUserContext,
  setupLoggedOutUserContext,
} from '@/test-utils';

import { generateSignedUploadUrl } from './upload-action';

jest.mock('@/user/server/user');
jest.mock('@/firebase/server/firebase-admin');
jest.mock('crypto');

describe('generateSignedUploadUrl', () => {
  const mockedGetFirebaseAdminApp = jest.mocked(getFirebaseAdminApp);
  const mockedGetFirebaseStorage = jest.mocked(getFirebaseStorage);
  const mockedRandomUUID = jest.mocked(randomUUID);

  const mockGetSignedUrl = jest.fn();
  const mockFile = jest.fn(() => ({
    getSignedUrl: mockGetSignedUrl,
  }));
  const mockBucket = {
    file: mockFile,
    name: 'test-bucket',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when authenticated', () => {
    setupLoggedInUserContext();

    beforeEach(() => {
      mockedGetFirebaseAdminApp.mockResolvedValue({} as App);
      mockedGetFirebaseStorage.mockResolvedValue({
        bucket: () => mockBucket,
      } as unknown as Storage);
      mockedRandomUUID.mockReturnValue('test-photo-id');
      mockGetSignedUrl.mockResolvedValue(['https://fake-signed-url.com']);
    });

    it('should return a signed URL and public URL on success', async () => {
      const result = await generateSignedUploadUrl({
        contentType: 'image/png',
      });

      expect(mockedGetFirebaseAdminApp).toHaveBeenCalled();
      expect(mockedGetFirebaseStorage).toHaveBeenCalled();
      expect(mockedRandomUUID).toHaveBeenCalled();
      expect(mockFile).toHaveBeenCalledWith(
        'users/photos/test-user-id/test-photo-id',
      );
      expect(mockGetSignedUrl).toHaveBeenCalledWith({
        version: 'v4',
        action: 'write',
        expires: expect.any(Number),
        contentType: 'image/png',
      });
      expect(result).toEqual({
        signedUrl: 'https://fake-signed-url.com',
        publicUrl:
          'https://firebasestorage.googleapis.com/v0/b/test-bucket/o/users%2Fphotos%2Ftest-user-id%2Ftest-photo-id?alt=media',
      });
    });
  });

  describe('when not authenticated', () => {
    const { mockedVerifyUserContext } = setupLoggedOutUserContext();

    beforeEach(() => {
      mockedVerifyUserContext.mockRejectedValue(new Error('Not authenticated'));
    });

    it('should throw an error if user is not authenticated', async () => {
      await expect(
        generateSignedUploadUrl({ contentType: 'image/png' }),
      ).rejects.toThrow('Not authenticated');
    });
  });
});
