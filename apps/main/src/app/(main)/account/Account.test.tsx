import '@/matchMedia.mock';

import userEvent from '@testing-library/user-event';
import { act } from 'react';

import { User } from '@/datastore/schema';
import { render, screen, waitFor } from '@/test-utils';

import { Account } from './Account';

const mockUser: User = {
  path: 'users/test-user',
  id: 'test-user',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: '',
  address: '',
  termsAccepted: true,
  roles: [],
};

const mockUpdateUserTextAction = jest.fn();
const mockUpdateUserAvatarAction = jest.fn();

describe('Account', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should disable the save button while typing and enable it after debouncing', async () => {
    const userEventUser = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    render(
      <Account
        user={mockUser}
        updateUserTextAction={mockUpdateUserTextAction}
        updateUserAvatarAction={mockUpdateUserAvatarAction}
      />,
    );

    const nameInput = screen.getByRole('textbox', { name: 'Full Name' });
    const saveButton = screen.getByRole('button', { name: 'Save Changes' });

    // Initially, the button should be disabled because the form is pristine
    expect(saveButton).toBeDisabled();

    // Type in the name field
    await userEventUser.type(nameInput, 'A');

    // The button should be disabled immediately after typing (debouncing)
    expect(saveButton).toBeDisabled();

    // Wait for the debounce timeout
    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      // The button should be enabled again
      expect(saveButton).not.toBeDisabled();
    });
  });
});
