'use client';

import { toUrlPath } from '@/datastore/paths';
import { Event } from '@/datastore/schema';
import { ENV_DEBUG_LINKS } from '@/env/env';
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

interface SidebarProps {
  events: Event[];
  onLinkClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ events, onLinkClick }) => {
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
            {events.map((event) => {
              const href = `/manage/${toUrlPath(event.path)}`;
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
          {ENV_DEBUG_LINKS && (
            <Box p="xs" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
              <Divider my="sm" />
              <NavLink
                label="Debug"
                leftSection={<IconBug size={18} />}
                defaultOpened
              >
                <NavLink
                  href="/admin"
                  label="Admin"
                  onClick={handleLinkClick}
                />
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
                {/* "/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women/preem-giro-sf-2025-masters-women-mid-sprint/contrib-2" */}
                <NavLink
                  href="/org-super-sprinkles"
                  label="Organization"
                  component={Link}
                  onClick={handleLinkClick}
                />
                <NavLink
                  href="/org-super-sprinkles/series-sprinkles-2025"
                  label="Series"
                  component={Link}
                  onClick={handleLinkClick}
                />
                <NavLink
                  href="/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025"
                  label="Event"
                  component={Link}
                  onClick={handleLinkClick}
                />
                <NavLink
                  href="/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women"
                  label="Race"
                  component={Link}
                  onClick={handleLinkClick}
                />
                <NavLink
                  href="/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women/preem-giro-sf-2025-masters-women-mid-sprint"
                  label="Preem"
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
                  href="/manage/org-super-sprinkles"
                  label="Organization (Live)"
                  component={Link}
                  onClick={handleLinkClick}
                />
                <NavLink
                  href="/manage/org-super-sprinkles/edit"
                  label="Organization (Edit)"
                  component={Link}
                  onClick={handleLinkClick}
                />
                <NavLink
                  href="/manage/org-super-sprinkles/series-sprinkles-2025"
                  label="Series (Live)"
                  component={Link}
                  onClick={handleLinkClick}
                />
                <NavLink
                  href="/manage/org-super-sprinkles/series-sprinkles-2025/edit"
                  label="Series (Edit)"
                  component={Link}
                  onClick={handleLinkClick}
                />
                <NavLink
                  href="/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025"
                  label="Event (Live)"
                  component={Link}
                  onClick={handleLinkClick}
                />
                <NavLink
                  href="/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/edit"
                  label="Event (Edit)"
                  component={Link}
                  onClick={handleLinkClick}
                />
                <NavLink
                  href="/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women"
                  label="Race (Live)"
                  component={Link}
                  onClick={handleLinkClick}
                />
                <NavLink
                  href="/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women/edit"
                  label="Race (Edit)"
                  component={Link}
                  onClick={handleLinkClick}
                />
              </NavLink>
            </Box>
          )}
        </div>
      </Stack>
    </ScrollArea>
  );
};

export default Sidebar;
