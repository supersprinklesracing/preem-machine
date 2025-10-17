import userEvent from '@testing-library/user-event';

import { Organization, User } from '@/datastore/schema';
import {
  act,
  render,
  screen,
  setupTimeMocking,
  waitFor,
} from '@/test-utils';

import * as actions from './assign-org-action';
import { AssignOrgModal } from './AssignOrgModal';

// Mock the server action
jest.mock('./assign-org-action', () => ({
  assignOrg: jest.fn(() => Promise.resolve()),
}));

const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'user@example.com',
  path: 'users/1',
};

const mockOrgs: Organization[] = [
  { id: '1', name: 'Org 1', path: 'organizations/1' },
  { id: '2', name: 'Org 2', path: 'organizations/2' },
];

const mockOnClose = jest.fn();

describe('AssignOrgModal', () => {
  setupTimeMocking();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with the user name', () => {
    render(
      <AssignOrgModal
        user={mockUser}
        organizations={mockOrgs}
        onClose={mockOnClose}
      />,
    );
    expect(
      screen.getByText('Assign Organization to Test User'),
    ).toBeInTheDocument();
  });

  it('disables the assign button when no organization is selected', () => {
    render(
      <AssignOrgModal
        user={mockUser}
        organizations={mockOrgs}
        onClose={mockOnClose}
      />,
    );
    expect(screen.getByRole('button', { name: 'Assign' })).toBeDisabled();
  });

  it('calls assignOrg and onClose when an organization is selected and assign is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <AssignOrgModal
        user={mockUser}
        organizations={mockOrgs}
        onClose={mockOnClose}
      />,
    );

    const select = screen.getByPlaceholderText('Select an organization');
    await act(async () => {
      await user.click(select);
    });
    const option = await screen.findByText('Org 1');
    await user.click(option);

    const assignButton = screen.getByRole('button', { name: 'Assign' });
    expect(assignButton).not.toBeDisabled();
    await user.click(assignButton);

    await waitFor(() => {
      expect(actions.assignOrg).toHaveBeenCalledWith('1', '1');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});