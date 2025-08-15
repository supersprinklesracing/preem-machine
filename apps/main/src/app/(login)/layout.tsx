'use server';

import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from '@mantine/core';
import { getUserFromCookies } from '@/auth/user';
import { theme } from '../../app/theme';
import { AuthProvider } from '../../auth/AuthProvider';
import '../global.css';

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
        <MantineProvider theme={theme}>
          <AuthProvider user={user}>{children}</AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
