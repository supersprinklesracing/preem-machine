'use client';

import { ENV_MAX_IMAGE_SIZE_BYTES } from '@/env/env';
import { getFirebaseStorage } from '@/firebase/client/firebase-client';
import { useUserContext } from '@/user/client/UserContext';
import { UseFormReturnType } from '@mantine/form';
import imageCompression from 'browser-image-compression';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useAvatarUpload<T>(
  form: UseFormReturnType<T>,
  fieldName: keyof T,
) {
  const { authUser } = useUserContext();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    if (!authUser) {
      setError('You must be logged in to upload files.');
      return;
    }
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

      const storage = getFirebaseStorage();
      const photoId = uuidv4();
      const filePath = `users/photos/${authUser.uid}/${photoId}`;
      const storageRef = ref(storage, filePath);

      const snapshot = await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form.setFieldValue(fieldName as any, downloadURL as any);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.setFieldValue(fieldName as any, '' as any);
  };

  return {
    uploading,
    error,
    handleFileChange,
    handleRemovePhoto,
  };
}
