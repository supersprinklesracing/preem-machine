import { createToast } from '@/app/(main)/admin/createToast';

import { fireEvent, render, screen } from '@/test-utils';
import Admin from './Admin';

// Mock the toast hook
jest.mock('./createToast');

const mockToast = jest.fn();
(createToast as jest.Mock).mockReturnValue({ toast: mockToast });

const mockData = {
  users: [
    {
      id: 'user-1',
      path: 'users/user-1',
      name: 'Alice',
      email: 'alice@example.com',
    },
    {
      id: 'user-2',
      path: 'users/user-2',
      name: 'Bob',
      email: 'bob@example.com',
    },
  ],
};

describe('Admin component', () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  it('should filter users based on search and allow impersonation', () => {
    render(<Admin {...mockData} />);

    // Search for a user
    const searchInput = screen.getByPlaceholderText(
      'Search by name or email...',
    );
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    // Click the impersonate button
    const impersonateButton = screen.getByText('Impersonate');
    fireEvent.click(impersonateButton);

    // Assert that the toast was called
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Impersonation Started',
      description: 'You are now viewing the app as Alice.',
    });
  });
});
