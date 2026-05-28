import userEvent from '@testing-library/user-event';

import { Organization, User } from '@/datastore/schema';
import { act, render, screen } from '@/test-utils';

import { Admin } from './Admin';

jest.mock('./invite-user-action', () => ({
  inviteUser: jest.fn(),
}));

const mockUsers: User[] = [
  { id: '1', name: 'Test User 1', email: 'user1@example.com', path: 'users/1' },
  { id: '2', name: 'Test User 2', email: 'user2@example.com', path: 'users/2' },
];

const mockOrgs: Organization[] = [
  { id: '1', name: 'Org 1', path: 'organizations/1' },
  { id: '2', name: 'Org 2', path: 'organizations/2' },
];

describe('Admin', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders a table of users', () => {
    render(<Admin users={mockUsers} organizations={mockOrgs} />);
    expect(
      screen.getByRole('cell', { name: 'Test User 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Test User 2' }),
    ).toBeInTheDocument();
  });

  it('opens the assign organization modal when edit is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<Admin users={mockUsers} organizations={mockOrgs} />);
    const editButtons = screen.getAllByRole('button', { name: 'Assign Org' });
    await act(async () => {
      await user.click(editButtons[0]);
    });
    expect(
      screen.getByText('Assign Organization to Test User 1'),
    ).toBeInTheDocument();
  });
});
