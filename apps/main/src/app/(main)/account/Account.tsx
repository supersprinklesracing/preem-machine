import { Container, Stack } from '@mantine/core';
import { AccountDebug, AccountDebugProps } from './account-debug/AccountDebug';
import { AccountDetails } from './AccountDetails';
import { EditUserOptions } from './edit-user-action';

import { FormActionResult } from '@/components/forms/forms';

export interface AccountDetailsProps {
  debugProps: AccountDebugProps;
  editUserAction: (options: EditUserOptions) => Promise<FormActionResult>;
}

export default async function AccountPage(props: AccountDetailsProps) {
  return (
    <Container size="lg" pt="xl">
      <Stack>
        <AccountDetails editUserAction={props.editUserAction} />
        <AccountDebug {...props.debugProps} />
      </Stack>
    </Container>
  );
}
