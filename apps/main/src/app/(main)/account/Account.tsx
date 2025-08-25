import { Container, Stack } from '@mantine/core';
import { AccountDebug, AccountDebugProps } from './account-debug/AccountDebug';
import { AccountDetails } from './AccountDetails';
import { UpdateUserOptions } from './update-user-action';

export interface AccountDetailsProps {
  debugProps: AccountDebugProps;
  updateUserAction: (
    options: UpdateUserOptions,
  ) => Promise<{ ok: boolean; error?: string }>;
}

export default async function AccountPage(props: AccountDetailsProps) {
  return (
    <Container size="lg" pt="xl">
      <Stack>
        <AccountDetails updateUserAction={props.updateUserAction} />
        <AccountDebug {...props.debugProps} />
      </Stack>
    </Container>
  );
}
