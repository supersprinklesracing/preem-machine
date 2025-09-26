import { MOCK_AUTH_USER } from '@/test-utils';
import {
  getFirebaseAdminApp,
  getFirebaseStorage,
} from '@/firebase/server/firebase-admin';
import { verifyUserContext } from '@/user/server/user';
import { randomUUID } from 'crypto';
import { generateSignedUploadUrl } from './upload-action';
import { App } from 'firebase-admin/app';
import { Storage } from '@google-cloud/storage';

jest.mock('@/user/server/user');
jest.mock('@/firebase/server/firebase-admin');
jest.mock('crypto');

describe('generateSignedUploadUrl', () => {
  const mockedVerifyUserContext = jest.mocked(verifyUserContext);
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
    mockedVerifyUserContext.mockResolvedValue({
      authUser: MOCK_AUTH_USER,
      user: null,
    });
    mockedGetFirebaseAdminApp.mockResolvedValue({} as App);
    mockedGetFirebaseStorage.mockResolvedValue({
      bucket: () => mockBucket,
    } as unknown as Storage);
    mockedRandomUUID.mockReturnValue('test-photo-id');
    mockGetSignedUrl.mockResolvedValue(['https://fake-signed-url.com']);
  });

  it('should return a signed URL and public URL on success', async () => {
    const result = await generateSignedUploadUrl({ contentType: 'image/png' });

    expect(mockedVerifyUserContext).toHaveBeenCalled();
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
        'https://storage.googleapis.com/test-bucket/users/photos/test-user-id/test-photo-id',
    });
  });

  it('should throw an error if user is not authenticated', async () => {
    mockedVerifyUserContext.mockRejectedValue(new Error('Not authenticated'));

    await expect(
      generateSignedUploadUrl({ contentType: 'image/png' }),
    ).rejects.toThrow('Not authenticated');
  });
});
