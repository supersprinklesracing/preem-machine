'use client';

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
      const { signedUrl, publicUrl } = await generateSignedUploadUrl({
        contentType: file.type,
      });

      const response = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
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
