import userEvent from '@testing-library/user-event';

import { Organization } from '@/datastore/schema';
import { render, screen, setupTimeMocking, waitFor } from '@/test-utils';

import { InviteUser } from './InviteUser';

const mockOrganizations: Organization[] = [
  { id: 'org1', path: 'organizations/org1', name: 'Organization 1' },
  { id: 'org2', path: 'organizations/org2', name: 'Organization 2' },
];

describe('InviteUser', () => {
  setupTimeMocking();

  it('should call inviteUserAction with the correct values on form submission', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const inviteuserAction = jest.fn(() => Promise.resolve({}));
    render(
      <InviteUser
        organizations={mockOrganizations}
        inviteUserAction={inviteuserAction}
      />,
    );
    const emailInput = screen.getByTestId('email-input');
    await user.type(emailInput, 'new-user@example.com');

    const orgInput = screen.getByTestId('organization-refs-input');
    await user.click(orgInput);
    await user.click(screen.getByText('Organization 1'));

    const saveButton = screen.getByRole('button', { name: /Send Invitation/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(inviteuserAction).toHaveBeenCalledWith({
        edits: {
          email: 'new-user@example.com',
          organizationRefs: [{ id: 'org1', path: 'organizations/org1' }],
        },
      });
    });
  });
});