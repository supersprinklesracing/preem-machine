import { act, renderHook } from '@testing-library/react';
import { useForm } from '@mantine/form';
import imageCompression from 'browser-image-compression';
import { getDownloadURL, uploadBytes } from 'firebase/storage';
import { useAvatarUpload } from './useAvatarUpload';
import { ENV_MAX_IMAGE_SIZE_BYTES } from '@/env/env';
import { useUserContext } from '@/user/client/UserContext';

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));
jest.mock('@/user/client/UserContext');
jest.mock('browser-image-compression');

const mockUploadBytes = uploadBytes as jest.Mock;
const mockGetDownloadURL = getDownloadURL as jest.Mock;
const mockImageCompression = imageCompression as unknown as jest.Mock;
const mockUseUserContext = useUserContext as jest.Mock;

describe('useAvatarUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUserContext.mockReturnValue({
      authUser: { uid: 'test-uid' },
    });
  });

  it('should handle photo removal', () => {
    const { result: formResult } = renderHook(() =>
      useForm({ initialValues: { avatarUrl: 'http://example.com/old.png' } }),
    );
    const { result } = renderHook(() =>
      useAvatarUpload(formResult.current, 'avatarUrl'),
    );

    act(() => {
      result.current.handleRemovePhoto();
    });

    expect(formResult.current.values.avatarUrl).toBe('');
  });

  it('should set an error if the file is too large', async () => {
    const { result: formResult } = renderHook(() =>
      useForm({ initialValues: { avatarUrl: '' } }),
    );
    const { result } = renderHook(() =>
      useAvatarUpload(formResult.current, 'avatarUrl'),
    );
    const largeFile = new File([''], 'test.png', { type: 'image/png' });
    Object.defineProperty(largeFile, 'size', {
      value: ENV_MAX_IMAGE_SIZE_BYTES + 1,
    });

    await act(async () => {
      await result.current.handleFileChange(largeFile);
    });

    expect(result.current.error).not.toBeNull();
    expect(mockImageCompression).not.toHaveBeenCalled();
  });

  it('should handle successful file upload', async () => {
    const { result: formResult } = renderHook(() =>
      useForm({ initialValues: { avatarUrl: '' } }),
    );
    const { result } = renderHook(() =>
      useAvatarUpload(formResult.current, 'avatarUrl'),
    );
    const file = new File([''], 'test.png', { type: 'image/png' });
    const compressedFile = new File([''], 'compressed.png', {
      type: 'image/png',
    });
    const publicUrl = 'http://example.com/avatar.png';

    mockImageCompression.mockResolvedValue(compressedFile);
    mockUploadBytes.mockResolvedValue({ ref: 'test-ref' });
    mockGetDownloadURL.mockResolvedValue(publicUrl);

    await act(async () => {
      await result.current.handleFileChange(file);
    });

    expect(mockImageCompression).toHaveBeenCalledWith(file, expect.any(Object));
    expect(uploadBytes).toHaveBeenCalled();
    expect(getDownloadURL).toHaveBeenCalledWith('test-ref');
    expect(formResult.current.values.avatarUrl).toBe(publicUrl);
    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle failed file upload', async () => {
    const { result: formResult } = renderHook(() =>
      useForm({ initialValues: { avatarUrl: '' } }),
    );
    const { result } = renderHook(() =>
      useAvatarUpload(formResult.current, 'avatarUrl'),
    );
    const file = new File([''], 'test.png', { type: 'image/png' });
    const compressedFile = new File([''], 'compressed.png', {
      type: 'image/png',
    });
    const uploadError = new Error('Upload failed');

    mockImageCompression.mockResolvedValue(compressedFile);
    mockUploadBytes.mockRejectedValue(uploadError);

    await act(async () => {
      await result.current.handleFileChange(file);
    });

    expect(result.current.error).toBe(uploadError.message);
    expect(formResult.current.values.avatarUrl).toBe('');
    expect(result.current.uploading).toBe(false);
  });

  it('should set an error if user is not authenticated', async () => {
    mockUseUserContext.mockReturnValue({ authUser: null });
    const { result: formResult } = renderHook(() =>
      useForm({ initialValues: { avatarUrl: '' } }),
    );
    const { result } = renderHook(() =>
      useAvatarUpload(formResult.current, 'avatarUrl'),
    );
    const file = new File([''], 'test.png', { type: 'image/png' });

    await act(async () => {
      await result.current.handleFileChange(file);
    });

    expect(result.current.error).toBe('You must be logged in to upload files.');
    expect(mockUploadBytes).not.toHaveBeenCalled();
  });
});