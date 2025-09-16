'use server';

import { getAuthUser } from '@/auth/server/auth';
import { UserProvider } from '@/user/client/UserProvider';
import { getUser } from '@/user/server/user';
import {
  ColorSchemeScript,
  MantineColorScheme,
  mantineHtmlProps,
  MantineProvider,
} from '@mantine/core';
import { cookies } from 'next/headers';
import './global.css';
import { theme } from './theme';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();
  const user = await getUser();
  const userContext = { authUser, user };

  const colorScheme = ((await cookies()).get('mantine-color-scheme')?.value ||
    'dark') as MantineColorScheme;

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme={colorScheme} />
      </head>
      <body>
        <UserProvider userContext={userContext}>
          <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
            {children}
          </MantineProvider>
        </UserProvider>
      </body>
    </html>
  );
}
