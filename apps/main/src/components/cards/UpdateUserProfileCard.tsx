'use client';

import {
  Avatar,
  Button,
  Card,
  FileButton,
  Group,
  Overlay,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { IconMail, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';

interface UserProfileCardProps {
  name?: string;
  email?: string;
  avatarUrl?: string;
  uploading: boolean;
  error: string | null;
  onFileChange: (file: File | null) => void;
  onRemovePhoto: () => void;
}

export function UpdateUserProfileCard({
  name,
  email,
  avatarUrl,
  uploading,
  error,
  onFileChange,
  onRemovePhoto,
}: UserProfileCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Card withBorder padding="lg" radius="md">
      <Stack align="center" ta="center">
        <FileButton onChange={onFileChange} accept="image/png,image/jpeg">
          {(props) => (
            <UnstyledButton
              {...props}
              data-testid="avatar-container"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                position: 'relative',
                cursor: 'pointer',
                borderRadius: '50%',
              }}
              aria-label="Upload profile photo"
            >
              <Avatar
                src={avatarUrl}
                alt={name ?? ''}
                size={120}
                radius="50%"
              />
              {(hovered || uploading) && (
                <Overlay
                  color="#000"
                  backgroundOpacity={0.5}
                  zIndex={1}
                  radius="50%"
                  style={{ pointerEvents: 'none' }}
                >
                  <Stack
                    align="center"
                    justify="center"
                    style={{ height: '100%' }}
                  >
                    <IconUpload size={24} />
                    <Text size="sm" fw={500}>
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                    </Text>
                  </Stack>
                </Overlay>
              )}
            </UnstyledButton>
          )}
        </FileButton>

        <Title order={2}>{name}</Title>
        <Group gap="xs" wrap="nowrap">
          <IconMail size={16} aria-hidden="true" />
          <Text c="dimmed">{email}</Text>
        </Group>
        <Stack>
          <Button
            variant="outline"
            onClick={onRemovePhoto}
            disabled={!avatarUrl}
          >
            Remove Photo
          </Button>
          {error && <Text c="red">{error}</Text>}
        </Stack>
      </Stack>
    </Card>
  );
}
