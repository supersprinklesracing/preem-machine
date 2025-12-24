import { act, renderHook } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';

import { generateSignedUploadUrl } from '@/app/(main)/account/upload-action';
import { useAvatarUpload } from '@/components/forms/useAvatarUpload';
import { ENV_MAX_IMAGE_SIZE_BYTES } from '@/env/env';

// Mocks
jest.mock('@/app/(main)/account/upload-action', () => ({
  generateSignedUploadUrl: jest.fn(),
}));

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
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('should set an error if the file is too large', async () => {
    const { result } = renderTestHook();
    const largeFile = mockFile(ENV_MAX_IMAGE_SIZE_BYTES + 1);

    await act(async () => {
      await result.current.handleFileChange(largeFile);
    });

    expect(result.current.error).toMatch(/File is too large/);
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('should handle successful file upload', async () => {
    const { result } = renderTestHook();
    const file = mockFile(1024);
    const signedUrl = 'https://signed.url/upload';
    const publicUrl = 'https://public.url/image.png';

    mockGenerateSignedUploadUrl.mockResolvedValue({ signedUrl, publicUrl });
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 });

    await act(async () => {
      await result.current.handleFileChange(file);
    });

    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockGenerateSignedUploadUrl).toHaveBeenCalledWith({
      contentType: file.type,
    });
    expect(fetchMock).toHaveBeenCalledWith(signedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
    expect(onUpload).toHaveBeenCalledWith(publicUrl);
  });

  it('should handle upload failure from generateSignedUploadUrl', async () => {
    const { result } = renderTestHook();
    const file = mockFile(1024);
    const errorMessage = 'Failed to get signed URL';

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
    const signedUrl = 'https://signed.url/upload';
    const publicUrl = 'https://public.url/image.png';

    mockGenerateSignedUploadUrl.mockResolvedValue({ signedUrl, publicUrl });
    fetchMock.mockResponseOnce('Upload failed', { status: 500 });

    await act(async () => {
      await result.current.handleFileChange(file);
    });

    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBe('Failed to upload file.');
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('should call onRemove when handleRemovePhoto is called', () => {
    const { result } = renderTestHook();

    act(() => {
      result.current.handleRemovePhoto();
    });

    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
