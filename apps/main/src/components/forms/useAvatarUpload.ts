'use client';

import imageCompression from 'browser-image-compression';
import { useState } from 'react';

import { generateSignedUploadUrl } from '@/app/(main)/account/upload-action';
import { ENV_MAX_IMAGE_SIZE_BYTES } from '@/env/env';

export interface UseAvatarUploadOptions {
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export function useAvatarUpload({
  onUpload,
  onRemove,
}: UseAvatarUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    if (file.size > ENV_MAX_IMAGE_SIZE_BYTES) {
      setError(
        `File is too large. Maximum size is ${
          ENV_MAX_IMAGE_SIZE_BYTES / 1024 / 1024
        }MB.`,
      );
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // TODO: Replace with server-side resizing via Firebase Extension. See issue #173.
      const compressedFile = await imageCompression(file, {
        maxSizeMB: ENV_MAX_IMAGE_SIZE_BYTES / 1024 / 1024,
        maxWidthOrHeight: 256,
        useWebWorker: true,
      });

      const { signedUrl, publicUrl } = await generateSignedUploadUrl({
        contentType: compressedFile.type,
      });

      const response = await fetch(signedUrl, {
        method: 'PUT',
        body: compressedFile,
        headers: {
          'Content-Type': compressedFile.type,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload file.');
      }

      onUpload(publicUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    onRemove();
  };

  return {
    uploading,
    error,
    handleFileChange,
    handleRemovePhoto,
  };
}
