import { act, renderHook } from '@testing-library/react';
import imageCompression from 'browser-image-compression';
import fetchMock from 'jest-fetch-mock';

import { generateSignedUploadUrl } from '@/app/(main)/account/upload-action';
import { useAvatarUpload } from '@/components/forms/useAvatarUpload';
import { ENV_MAX_IMAGE_SIZE_BYTES } from '@/env/env';

// Mocks
jest.mock('browser-image-compression');
jest.mock('@/app/(main)/account/upload-action', () => ({
  generateSignedUploadUrl: jest.fn(),
}));

const mockImageCompression = jest.mocked(imageCompression);
const mockGenerateSignedUploadUrl = jest.mocked(generateSignedUploadUrl);

const mockFile = (size: number) => {
  const file = new File([''], 'test.png', { type: 'image/png' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('useAvatarUpload', () => {
  let onUpload: jest.Mock;
  let onRemove: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    onUpload = jest.fn();
    onRemove = jest.fn();
  });

  const renderTestHook = () => {
    return renderHook(() => useAvatarUpload({ onUpload, onRemove }));
  };

  it('should do nothing if handleFileChange is called with null', async () => {
    const { result } = renderTestHook();
    await act(async () => {
      await result.current.handleFileChange(null);
    });
    expect(mockImageCompression).not.toHaveBeenCalled();
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('should set an error if the file is too large', async () => {
    const { result } = renderTestHook();
    const largeFile = mockFile(ENV_MAX_IMAGE_SIZE_BYTES + 1);

    await act(async () => {
      await result.current.handleFileChange(largeFile);
    });

    expect(result.current.error).toMatch(/File is too large/);
    expect(mockImageCompression).not.toHaveBeenCalled();
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('should handle successful file upload', async () => {
    const { result } = renderTestHook();
    const file = mockFile(1024);
    const compressedFile = mockFile(512);
    const signedUrl = 'https://signed.url/upload';
    const publicUrl = 'https://public.url/image.png';

    mockImageCompression.mockResolvedValue(compressedFile);
    mockGenerateSignedUploadUrl.mockResolvedValue({ signedUrl, publicUrl });
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 });

    await act(async () => {
      await result.current.handleFileChange(file);
    });

    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockImageCompression).toHaveBeenCalledWith(file, expect.any(Object));
    expect(mockGenerateSignedUploadUrl).toHaveBeenCalledWith({
      contentType: compressedFile.type,
    });
    expect(fetchMock).toHaveBeenCalledWith(signedUrl, {
      method: 'PUT',
      body: compressedFile,
      headers: { 'Content-Type': compressedFile.type },
    });
    expect(onUpload).toHaveBeenCalledWith(publicUrl);
  });

  it('should handle upload failure from generateSignedUploadUrl', async () => {
    const { result } = renderTestHook();
    const file = mockFile(1024);
    const compressedFile = mockFile(512);
    const errorMessage = 'Failed to get signed URL';

    mockImageCompression.mockResolvedValue(compressedFile);
    mockGenerateSignedUploadUrl.mockRejectedValue(new Error(errorMessage));

    await act(async () => {
      await result.current.handleFileChange(file);
    });

    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('should handle upload failure from fetch', async () => {
    const { result } = renderTestHook();
    const file = mockFile(1024);
    const compressedFile = mockFile(512);
    const signedUrl = 'https://signed.url/upload';
    const publicUrl = 'https://public.url/image.png';

    mockImageCompression.mockResolvedValue(compressedFile);
    mockGenerateSignedUploadUrl.mockResolvedValue({ signedUrl, publicUrl });
    fetchMock.mockResponseOnce('Upload failed', { status: 500 });

    await act(async () => {
      await result.current.handleFileChange(file);
    });

    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBe('Failed to upload file.');
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('should catch error from onUpload and set error state', async () => {
    const { result } = renderTestHook();
    const file = mockFile(1024);
    const compressedFile = mockFile(512);
    const signedUrl = 'https://signed.url/upload';
    const publicUrl = 'https://public.url/image.png';
    const errorMessage = 'Failed to update user avatar';

    mockImageCompression.mockResolvedValue(compressedFile);
    mockGenerateSignedUploadUrl.mockResolvedValue({ signedUrl, publicUrl });
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 });
    onUpload.mockRejectedValue(new Error(errorMessage));

    await act(async () => {
      await result.current.handleFileChange(file);
    });

    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(onUpload).toHaveBeenCalledWith(publicUrl);
  });

  it('should call onRemove when handleRemovePhoto is called', async () => {
    const { result } = renderTestHook();

    await act(async () => {
      await result.current.handleRemovePhoto();
    });

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('should catch error from onRemove and set error state', async () => {
    const { result } = renderTestHook();
    const errorMessage = 'Failed to remove avatar';
    onRemove.mockRejectedValue(new Error(errorMessage));

    await act(async () => {
      await result.current.handleRemovePhoto();
    });

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe(errorMessage);
  });
});
