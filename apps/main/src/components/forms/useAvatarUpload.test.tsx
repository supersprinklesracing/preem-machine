import { renderHook, act } from '@testing-library/react';
import { useForm } from '@mantine/form';
import imageCompression from 'browser-image-compression';
import { useAvatarUpload } from './useAvatarUpload';
import { generateSignedUploadUrl } from '@/app/(main)/account/upload-action';
import { ENV_MAX_IMAGE_SIZE_BYTES } from '@/env/env';

jest.mock('@/app/(main)/account/upload-action');
jest.mock('browser-image-compression');

const mockGenerateSignedUploadUrl = generateSignedUploadUrl as jest.Mock;
const mockImageCompression = imageCompression as unknown as jest.Mock;

global.fetch = jest.fn();

describe('useAvatarUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    const { result: formResult, rerender: rerenderForm } = renderHook(() =>
      useForm({ initialValues: { avatarUrl: '' } }),
    );
    const { result, rerender } = renderHook(() =>
      useAvatarUpload(formResult.current, 'avatarUrl'),
    );
    const file = new File([''], 'test.png', { type: 'image/png' });
    const compressedFile = new File([''], 'compressed.png', {
      type: 'image/png',
    });
    const publicUrl = 'http://example.com/avatar.png';

    mockImageCompression.mockResolvedValue(compressedFile);
    mockGenerateSignedUploadUrl.mockResolvedValue({
      signedUrl: 'http://example.com/signed-url',
      publicUrl,
    });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    await act(async () => {
      await result.current.handleFileChange(file);
    });

    rerender();
    rerenderForm();

    expect(mockImageCompression).toHaveBeenCalledWith(file, expect.any(Object));
    expect(mockGenerateSignedUploadUrl).toHaveBeenCalledWith({
      contentType: compressedFile.type,
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://example.com/signed-url',
      expect.any(Object),
    );
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

    mockImageCompression.mockResolvedValue(compressedFile);
    mockGenerateSignedUploadUrl.mockResolvedValue({
      signedUrl: 'http://example.com/signed-url',
      publicUrl: 'http://example.com/avatar.png',
    });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    await act(async () => {
      await result.current.handleFileChange(file);
    });

    expect(result.current.error).toBe('Failed to upload file.');
    expect(formResult.current.values.avatarUrl).toBe('');
    expect(result.current.uploading).toBe(false);
  });
});
