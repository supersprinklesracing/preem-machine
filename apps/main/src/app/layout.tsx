'use server';

import { authConfigFn } from '@/firebase-admin/config';
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { getTokens } from 'next-firebase-auth-edge';
import { cookies, headers } from 'next/headers';
import { AuthProvider } from '../auth/AuthProvider';
import './global.css';
import { AppLayout } from './AppLayout';
import { toUser } from './shared/user';
import { theme } from './theme';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authConfig = await authConfigFn();
  const tokens = await getTokens(await cookies(), {
    ...authConfig,
    headers: await headers(),
  });
  const user = tokens ? toUser(tokens) : null;

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Notifications />
          <AuthProvider user={user}>
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
