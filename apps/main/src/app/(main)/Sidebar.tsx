'use client';

import { NavLink } from '@mantine/core';
import { IconBike, IconCrown, IconUser, IconUsers } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navLinks = [
    {
      label: 'Home',
      icon: <IconBike size={18} />,
      href: '/',
    },
    {
      label: 'Tuesday Night Crit',
      icon: <IconBike size={18} />,
      href: '/race/race-1',
    },
    {
      label: 'Weekend Road Race',
      icon: <IconBike size={18} />,
      href: '/race/race-2',
    },
    {
      label: 'Organizer Hub',
      icon: <IconCrown size={18} />,
      href: '/organizer',
    },
    {
      label: 'Live Dashboard',
      icon: <IconUsers size={18} />,
      href: '/organizer/race/race-1',
    },
    {
      label: 'My Profile',
      icon: <IconUser size={18} />,
      href: '/user/user-1',
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

export default Sidebar;
