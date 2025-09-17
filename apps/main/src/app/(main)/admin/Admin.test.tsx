import { render, screen, fireEvent } from '@/test-utils';
import { Admin } from './Admin';
import { User, Organization } from '@/datastore/schema';

const mockUsers: User[] = [
  { id: '1', name: 'Test User 1', email: 'user1@example.com', path: 'users/1' },
  { id: '2', name: 'Test User 2', email: 'user2@example.com', path: 'users/2' },
];

const mockOrgs: Organization[] = [
  { id: '1', name: 'Org 1', path: 'organizations/1' },
  { id: '2', name: 'Org 2', path: 'organizations/2' },
];

describe('Admin', () => {
  it('renders a table of users', () => {
    render(<Admin users={mockUsers} organizations={mockOrgs} />);
    expect(
      screen.getByRole('cell', { name: 'Test User 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Test User 2' }),
    ).toBeInTheDocument();
  });

  it('opens the assign organization modal when edit is clicked', () => {
    render(<Admin users={mockUsers} organizations={mockOrgs} />);
    const editButtons = screen.getAllByRole('button', { name: 'Assign Org' });
    fireEvent.click(editButtons[0]);
    expect(
      screen.getByText('Assign Organization to Test User 1'),
    ).toBeInTheDocument();
  });
});
