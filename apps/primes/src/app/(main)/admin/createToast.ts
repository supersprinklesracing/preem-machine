'use client';

import { notifications } from '@mantine/notifications';

type ToastProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  variant?: 'default' | 'destructive';
};

export function createToast() {
  const toast = ({ title, description, variant }: ToastProps) => {
    const color = variant === 'destructive' ? 'red' : undefined;
    notifications.show({
      title,
      message: description,
      color,
    });
  };

  return { toast };
}
