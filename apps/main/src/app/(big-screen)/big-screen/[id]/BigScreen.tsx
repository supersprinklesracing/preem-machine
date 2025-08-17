'use client';

export const dynamic = 'force-dynamic';

import AnimatedNumber from '@/components/animated-number';
import { RaceWithPreems } from '@/datastore/firestore';
import type { Contribution, DeepClient, User } from '@/datastore/types';
import {
  Avatar,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface BigScreenProps {
  initialRace: DeepClient<RaceWithPreems>;
  users: User[];
}

const BigScreen: React.FC<BigScreenProps> = ({ initialRace, users }) => {
  const [race, setRace] = useState<DeepClient<RaceWithPreems> | undefined>(
    initialRace
  );
  const [liveContributions, setLiveContributions] = useState<
    (DeepClient<Contribution> & { preemName: string })[]
  >([]);

  useEffect(() => {
    if (!initialRace) return;

    const allInitialContributions =
      initialRace.preems
        ?.flatMap((p) =>
          p.contributions?.map((c) => ({ ...c, preemName: p.name ?? '' }))
        )
        .filter((c): c is NonNullable<typeof c> => !!c) ?? [];
    allInitialContributions.sort((a, b) => {
      if (!a || !b) {
        return 0;
      }
      return new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime();
    });
    setLiveContributions(allInitialContributions.slice(0, 5));

    const interval = setInterval(() => {
      setRace((prevRace) => {
        if (!prevRace) return undefined;
        const newPreems = prevRace.preems?.map((p) => {
          if (p.status !== 'Awarded' && Math.random() > 0.6) {
            const newAmount = Math.floor(Math.random() * 75) + 10;
            const randomUser = users[Math.floor(Math.random() * users.length)];
            if (!randomUser) return p;
            const newContribution: DeepClient<Contribution> = {
              id: `c-live-${Date.now()}`,
              contributorBrief: {
                id: randomUser.id,
                name: randomUser.name,
                avatarUrl: randomUser.avatarUrl,
              },
              amount: newAmount,
              date: new Date().toISOString(),
              message: Math.random() > 0.4 ? 'For the win!' : 'Go go go!',
            };
            setLiveContributions((prev) =>
              [{ ...newContribution, preemName: p.name ?? '' }, ...prev].slice(
                0,
                10
              )
            );
            return {
              ...p,
              prizePool: (p.prizePool ?? 0) + newAmount,
              contributions: [...(p.contributions ?? []), newContribution],
            };
          }
          return p;
        });
        return { ...prevRace, preems: newPreems };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [initialRace, users]);

  const getContributor = (
    contribution: DeepClient<Contribution>
  ): { name: string; avatarUrl: string } => {
    if (!contribution.contributorBrief?.id) {
      return {
        name: 'Anonymous',
        avatarUrl: 'https://placehold.co/100x100.png',
      };
    }
    return {
      name: contribution.contributorBrief.name ?? 'A Fan',
      avatarUrl:
        contribution.contributorBrief.avatarUrl ??
        'https://placehold.co/100x100.png',
    };
  };

  if (!race) {
    return <div>Race not found</div>;
  }

  const nextPreem =
    race.preems?.find(
      (p) => p.status === 'Minimum Met' || p.status === 'Open'
    ) ||
    race.preems
      ?.filter((p) => p.timeLimit)
      .sort(
        (a, b) =>
          new Date(b.timeLimit ?? 0).getTime() -
          new Date(a.timeLimit ?? 0).getTime()
      )[0];

  if (!nextPreem) {
    return (
      <Box
        style={{
          backgroundColor: '#111',
          color: 'white',
          minHeight: '100vh',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Title>No upcoming preems for this race.</Title>
      </Box>
    );
  }

  const contributionCards = liveContributions.map((c) => {
    const contributor = getContributor(c);
    return (
      <Card key={c.id} p="sm" radius="md" bg="dark.7">
        <Group>
          <Avatar
            src={contributor.avatarUrl}
            alt={contributor.name}
            radius="xl"
            size="lg"
          />
          <div>
            <Text>
              <Text span c="yellow" fw={700}>
                ${c.amount}
              </Text>{' '}
              from{' '}
              <Text span fw={700}>
                {contributor.name}
              </Text>
            </Text>
            {c.message && (
              <Text size="sm" fs="italic" c="dimmed">
                &quot;{c.message}&quot;
              </Text>
            )}
          </div>
        </Group>
      </Card>
    );
  });

  return (
    <Box
      style={{
        backgroundColor: '#111',
        color: 'white',
        minHeight: '100vh',
        padding: '2rem',
        position: 'relative',
      }}
    >
      <Link href={`/race/${race.id}`}>
        <Button
          variant="subtle"
          color="gray"
          style={{ position: 'absolute', top: '1rem', left: '1rem' }}
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to details
        </Button>
      </Link>
      <Grid gutter="xl" style={{ height: '100%' }}>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack>
            <Title
              order={2}
              ta="center"
              ff="Space Grotesk, var(--mantine-font-family)"
            >
              Live Contributions
            </Title>
            <Stack
              gap="sm"
              style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}
            >
              {contributionCards}
            </Stack>
          </Stack>
        </Grid.Col>

        <Grid.Col
          span={{ base: 12, lg: 8 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Card
            padding="xl"
            radius="lg"
            w="100%"
            maw={600}
            style={{
              background: 'linear-gradient(135deg, #228be6 0%, #1c3f9b 100%)',
              textAlign: 'center',
              boxShadow: '0 0 30px rgba(34, 139, 230, 0.5)',
            }}
          >
            <Text
              tt="uppercase"
              c="yellow"
              fw={700}
              size="2rem"
              ff="Space Grotesk, var(--mantine-font-family)"
            >
              UP NEXT
            </Text>
            <Title
              order={1}
              style={{ fontSize: '4.5rem' }}
              ff="Space Grotesk, var(--mantine-font-family)"
            >
              {nextPreem.name}
            </Title>
            <Text size="1.5rem" c="dimmed" mt="xl">
              Prize Pool
            </Text>
            <Title
              order={1}
              style={{ fontSize: '8rem', lineHeight: 1 }}
              c="yellow"
              ff="Space Grotesk, var(--mantine-font-family)"
            >
              $<AnimatedNumber value={nextPreem.prizePool ?? 0} />
            </Title>
            <Text size="1.2rem" c="dimmed" mt="xl">
              Sponsored by{' '}
              <Text span fw={700} c="white">
                The Community
              </Text>
            </Text>
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default BigScreen;
