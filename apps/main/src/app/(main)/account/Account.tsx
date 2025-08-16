import { Container, SimpleGrid, Stack } from '@mantine/core';
import { AccountDebug, AccountDebugProps } from './account-debug/AccountDebug';
import { AccountDetails } from './AccountDetails';
import { PreferencesPanel } from './PreferencesPanel';

export interface AccountDetailsProps {
  debugProps: AccountDebugProps;
}

export default async function AccountPage(props: AccountDetailsProps) {
  return (
    <Container size="lg" pt="xl">
      <SimpleGrid
        cols={{ base: 1, md: 2 }}
        style={{ alignItems: 'flex-start' }}
      >
        <Stack>
          <AccountDetails />
          <PreferencesPanel />
        </Stack>
        <AccountDebug {...props.debugProps} />
      </SimpleGrid>
    </Container>
  );
}
