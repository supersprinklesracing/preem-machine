'use server';

import { getUserFromCookies } from '@/auth/user';
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
  const user = await getUserFromCookies();
  const colorScheme = ((await cookies()).get('mantine-color-scheme')?.value ||
    'dark') as MantineColorScheme;

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme={colorScheme} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AuthProvider user={user}>
          <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
            {children}
          </MantineProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
