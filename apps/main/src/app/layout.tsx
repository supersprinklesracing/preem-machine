'use server';

import { getAuthUser } from '@/auth/user';
import { getUserById } from '@/datastore/firestore';
import { CurrentUserProvider } from '@/datastore/user/UserProvider';
import {
  ColorSchemeScript,
  MantineColorScheme,
  mantineHtmlProps,
  MantineProvider,
} from '@mantine/core';
import { cookies } from 'next/headers';
import { AuthProvider } from '../auth/AuthProvider';
import './global.css';
import { theme } from './theme';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();
  const currentUser = authUser
    ? ((await getUserById(authUser.uid)) ?? null)
    : null;

  const colorScheme = ((await cookies()).get('mantine-color-scheme')?.value ||
    'dark') as MantineColorScheme;

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme={colorScheme} />
      </head>
      <body>
        <AuthProvider authUser={authUser}>
          <CurrentUserProvider currentUser={currentUser}>
            <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
              {children}
            </MantineProvider>
          </CurrentUserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
