'use server';

import { authConfigFn } from '@/firebase-admin/config';
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from '@mantine/core';
import { getTokens } from 'next-firebase-auth-edge';
import { cookies, headers } from 'next/headers';
import { AuthProvider } from './auth/AuthProvider';
import './global.css';
import { Layout } from './layout/Layout';
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
      </head>
      <body>
        <MantineProvider theme={theme}>
          <AuthProvider user={user}>
            <Layout>{children}</Layout>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
