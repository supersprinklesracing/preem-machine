import './global.css';

import {
  ColorSchemeScript,
  MantineColorScheme,
  mantineHtmlProps,
  MantineProvider,
} from '@mantine/core';
import { cookies } from 'next/headers';

import { UserProvider } from '@/user/client/UserProvider';
import { requireAnyUserContext } from '@/user/server/user';

import { theme } from './theme';

export const metadata = {
  title: {
    template: '%s | Preem Machine',
    default: 'Preem Machine',
  },
  icons: '/logo.png',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userContext = await requireAnyUserContext();

  const colorScheme = ((await cookies()).get('mantine-color-scheme')?.value ||
    'dark') as MantineColorScheme;

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
