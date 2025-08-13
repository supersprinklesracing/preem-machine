'use client';

import { NavLink } from '@mantine/core';
import {
  IconBike,
  IconCrown,
  IconDeviceTv,
  IconShield,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const SidebarNav: React.FC = () => {
  const pathname = usePathname();

  const navLinks = [
    {
      label: 'Tuesday Night Crit',
      icon: <IconBike size={18} />,
      href: '/race-detail/race-1',
    },
    {
      label: 'Weekend Road Race',
      icon: <IconBike size={18} />,
      href: '/race-detail/race-2',
    },
    {
      label: 'Organizer Hub',
      icon: <IconCrown size={18} />,
      href: '/organizer-hub',
    },
    {
      label: 'Live Dashboard',
      icon: <IconUsers size={18} />,
      href: '/live-dashboard/race-1',
    },
    {
      label: 'Big Screen',
      icon: <IconDeviceTv size={18} />,
      href: '/big-screen/race-1',
    },
    {
      label: 'My Profile',
      icon: <IconUser size={18} />,
      href: '/user-profile/user-1',
    },
    {
      label: 'Admin',
      icon: <IconShield size={18} />,
      href: '/admin',
    },
  ];

  return (
    <>
      {navLinks.map((link) => (
        <NavLink
          key={link.label}
          href={link.href}
          label={link.label}
          leftSection={link.icon}
          active={pathname === link.href}
          component={Link}
        />
      ))}
    </>
  );
};

export default SidebarNav;