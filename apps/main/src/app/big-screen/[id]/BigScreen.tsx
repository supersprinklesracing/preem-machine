'use client';

export const dynamic = 'force-dynamic';

import AnimatedNumber from '@/components/animated-number';
import type { Contribution, Race, User } from '@/datastore/types';
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

const BigScreen: React.FC<{ initialRace: Race; users: User[] }> = ({
  initialRace,
  users,
}) => {
  const [race, setRace] = useState<Race | undefined>(initialRace);
  const [liveContributions, setLiveContributions] = useState<
    (Contribution & { preemName: string })[]
  >([]);

  useEffect(() => {
    if (!initialRace) return;

    const allInitialContributions = initialRace.preems
      .flatMap((p) =>
        p.contributionHistory.map((c) => ({ ...c, preemName: p.name }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setLiveContributions(allInitialContributions.slice(0, 5));

    const interval = setInterval(() => {
      setRace((prevRace) => {
        if (!prevRace) return undefined;
        const newPreems = prevRace.preems.map((p) => {
          if (p.status !== 'Awarded' && Math.random() > 0.6) {
            const newAmount = Math.floor(Math.random() * 75) + 10;
            const newContributorId =
              users[Math.floor(Math.random() * users.length)].id;
            const newContribution: Contribution = {
              id: `c-live-${Date.now()}`,
              contributorId: newContributorId,
              amount: newAmount,
              date: new Date().toISOString(),
              message: Math.random() > 0.4 ? 'For the win!' : 'Go go go!',
            };
            setLiveContributions((prev) =>
              [{ ...newContribution, preemName: p.name }, ...prev].slice(0, 10)
            );
            return {
              ...p,
              prizePool: p.prizePool + newAmount,
              contributionHistory: [...p.contributionHistory, newContribution],
            };
          }
          return p;
        });
        return { ...prevRace, preems: newPreems };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [initialRace, users]);

  const getContributor = (id: string | null) => {
    if (!id)
      return {
        name: 'Anonymous',
        avatarUrl: 'https://placehold.co/100x100.png',
      };
    return (
      users.find((u) => u.id === id) || {
        name: 'A Fan',
        avatarUrl: 'https://placehold.co/100x100.png',
      }
    );
  };

  if (!race) {
    return <div>Race not found</div>;
  }

  const nextPreem =
    race.preems.find(
      (p) => p.status === 'Minimum Met' || p.status === 'Open'
    ) || race.preems[0];
  const sponsor = nextPreem.sponsorInfo
    ? users.find((u) => u.id === nextPreem.sponsorInfo?.userId)
    : null;

  const contributionCards = liveContributions.map((c) => {
    const contributor = getContributor(c.contributorId);
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
      <Link href={`/race-detail/${race.id}`}>
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
              $<AnimatedNumber value={nextPreem.prizePool} />
            </Title>
            <Text size="1.2rem" c="dimmed" mt="xl">
              Sponsored by{' '}
              <Text span fw={700} c="white">
                {sponsor ? sponsor.name : 'The Community'}
              </Text>
            </Text>
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default BigScreen;
