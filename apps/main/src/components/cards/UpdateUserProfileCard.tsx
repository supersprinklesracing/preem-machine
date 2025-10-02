'use client';

import {
  Avatar,
  Box,
  Button,
  FileButton,
  Group,
  Overlay,
  Stack,
  Text,
} from '@mantine/core';
import { IconMail, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';

import { ContentCard } from './ContentCard';

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

  const mainContent = (
    <Stack align="center" ta="center">
      <FileButton onChange={onFileChange} accept="image/png,image/jpeg">
        {(props) => (
          <Box
            {...props}
            data-testid="avatar-container"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              position: 'relative',
              cursor: 'pointer',
              borderRadius: '50%',
            }}
          >
            <Avatar src={avatarUrl} alt={name ?? ''} size={120} radius="50%" />
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
          </Box>
        )}
      </FileButton>
    </Stack>
  );

  const bottomContent = (
    <Stack>
      <Button variant="outline" onClick={onRemovePhoto} disabled={!avatarUrl}>
        Remove Photo
      </Button>
      {error && <Text c="red">{error}</Text>}
    </Stack>
  );

  return (
    <ContentCard
      title={name}
      subheadings={[
        <Group key="email-group" gap="xs">
          <IconMail size={16} />
          <Text c="dimmed">{email}</Text>
        </Group>,
      ]}
      mainContent={mainContent}
      bottomContent={bottomContent}
    />
  );
}