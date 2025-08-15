'use server';

import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from '@mantine/core';
import { AuthProvider } from '../auth/AuthProvider';
import './global.css';
import { theme } from './theme';
import { getUserFromCookies } from '@/auth/user';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookies();

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
        <AuthProvider user={user}>
          <MantineProvider theme={theme}>{children}</MantineProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
