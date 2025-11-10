'use client';

import { useState } from 'react';
import { Button } from '@mantine/core';
import { IconStar, IconStarFilled } from '@tabler/icons-react';
import {
  addFavorite,
  removeFavorite,
} from '@/datastore/server/update/favorites';
import { User } from '@/datastore/schema';

interface DocRef {
  id: string;
  path: string;
}

interface Props {
  docRef: DocRef;
  user: User | null;
}

export function FavoriteButton({ docRef, user }: Props) {
  const isFavorited =
    user?.favoriteRefs?.some((ref) => ref.path === docRef.path) || false;
  const [favorited, setFavorited] = useState(isFavorited);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (favorited) {
        await removeFavorite(docRef);
        setFavorited(false);
      } else {
        await addFavorite(docRef);
        setFavorited(true);
      }
    } catch (error) {
      console.error('Failed to update favorite status', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      loading={loading}
      variant={favorited ? 'filled' : 'outline'}
      leftSection={
        favorited ? <IconStarFilled size={16} /> : <IconStar size={16} />
      }
    >
      {favorited ? 'Favorited' : 'Favorite'}
    </Button>
  );
}
