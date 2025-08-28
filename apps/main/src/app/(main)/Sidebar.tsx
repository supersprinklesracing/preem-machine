'use client';

import type { ClientCompat, Event } from '@/datastore/types';
import {
  Box,
  Divider,
  NavLink,
  ScrollArea,
  Stack,
  useMantineTheme,
} from '@mantine/core';
import {
  IconBike,
  IconBug,
  IconCrown,
  IconDeviceTv,
  IconHome,
  IconUser,
} from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useMediaQuery } from '@mantine/hooks';
import Link from 'next/link';

interface SidebarData {
  events: ClientCompat<Event>[];
}

interface SidebarProps {
  data: SidebarData;
  onLinkClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ data, onLinkClick }) => {
  const pathname = usePathname();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const handleLinkClick = () => {
    if (isMobile && onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <ScrollArea h="100%">
      <Stack justify="space-between" style={{ minHeight: '100%' }}>
        <div>
          <NavLink
            href="/"
            label="Home"
            leftSection={<IconHome size={18} />}
            active={pathname === '/'}
            component={Link}
            onClick={handleLinkClick}
          />
          <NavLink
            href="/manage"
            label="Live Hub"
            leftSection={<IconCrown size={18} />}
            active={pathname.startsWith('/manage')}
            component={Link}
            onClick={handleLinkClick}
          />
          <NavLink
            label="Events"
            leftSection={<IconBike size={18} />}
            active={pathname.startsWith('/manage')}
            defaultOpened
          >
            {data.events.map((event) => {
              const href = `/manage/event/${event.id}`;
              return (
                <NavLink
                  key={event.id}
                  href={href}
                  label={event.name}
                  active={pathname === href}
                  component={Link}
                  onClick={handleLinkClick}
                />
              );
            })}
          </NavLink>
        </div>
        <div>
          <NavLink
            href="/user"
            label="My Profile"
            leftSection={<IconUser size={18} />}
            active={pathname.startsWith('/user')}
            component={Link}
            onClick={handleLinkClick}
          />
          <Divider my="sm" />
          <Box p="xs" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
            <NavLink
              label="Debug"
              leftSection={<IconBug size={18} />}
              defaultOpened
            >
              <NavLink href="/admin" label="Admin" onClick={handleLinkClick} />
            </NavLink>
            <NavLink
              label="Details"
              leftSection={<IconDeviceTv size={18} />}
              defaultOpened
            >
              <NavLink
                href="/user"
                label="User"
                component={Link}
                onClick={handleLinkClick}
              />
              <NavLink
                href="/race/race-giro-sf-2025-masters-women"
                label="Race"
                component={Link}
                onClick={handleLinkClick}
              />
              <NavLink
                href="/preem/preem-giro-sf-2025-masters-women-first-lap"
                label="Preem"
                component={Link}
                onClick={handleLinkClick}
              />
              <NavLink
                href="/organization/org-super-sprinkles"
                label="Organization"
                component={Link}
                onClick={handleLinkClick}
              />
              <NavLink
                href="/series/series-giro-sf"
                label="Series"
                component={Link}
                onClick={handleLinkClick}
              />
              <NavLink
                href="/event/event-giro-sf-2025"
                label="Event"
                component={Link}
                onClick={handleLinkClick}
              />
            </NavLink>
            <NavLink
              label="Manage"
              leftSection={<IconCrown size={18} />}
              defaultOpened
            >
              <NavLink
                href="/manage"
                label="Org (Live)"
                component={Link}
                onClick={handleLinkClick}
              />
              <NavLink
                href="/manage/organization/org-super-sprinkles/edit"
                label="Org (Edit)"
                component={Link}
                onClick={handleLinkClick}
              />
              <NavLink
                href="/manage/series/series-giro-sf/edit"
                label="Series (Edit)"
                component={Link}
                onClick={handleLinkClick}
              />
              <NavLink
                href="/manage/event/event-giro-sf-2025"
                label="Event (Live)"
                component={Link}
                onClick={handleLinkClick}
              />
              <NavLink
                href="/manage/event/event-giro-sf-2025/edit"
                label="Event (Edit)"
                component={Link}
                onClick={handleLinkClick}
              />
              <NavLink
                href="/manage/race/race-giro-sf-2025-masters-women"
                label="Race (Live)"
                component={Link}
                onClick={handleLinkClick}
              />
            </NavLink>
          </Box>
        </div>
      </Stack>
    </ScrollArea>
  );
};

export default Sidebar;
