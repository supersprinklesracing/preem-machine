import userEvent from '@testing-library/user-event';

import {
  act,
  MOCK_AUTH_USER,
  render,
  screen,
  setupTimeMocking,
  waitFor,
} from '@/test-utils';

import { NewUser } from './NewUser';

describe('NewUser component', () => {
  setupTimeMocking();

  it('should call newUserAction with the correct data on form submission', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const mockNewUserAction = jest.fn(() => Promise.resolve({}));
    render(<NewUser newUserAction={mockNewUserAction} />, {
      userContext: { authUser: MOCK_AUTH_USER, user: null },
    });

    // Change the name in the form
    const nameInput = screen.getAllByDisplayValue('Test User')[0];
    await user.clear(nameInput);
    await user.type(nameInput, 'New Name');

    // Wait for the debounced value to update
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    // Click the save button
    const saveButton = screen.getByText('Save and Continue');
    await user.click(saveButton);

    // Wait for the action to be called
    await waitFor(() => {
      expect(mockNewUserAction).toHaveBeenCalledWith({
        values: {
          name: 'New Name',
          email: 'test-user@example.com',
          avatarUrl: 'https://placehold.co/100x100.png',
          termsAccepted: true,
          affiliation: '',
          raceLicenseId: '',
          address: '',
        },
      });
    });
  });

  it('should allow editing the avatar URL', () => {
    const mockNewUserAction = jest.fn(() => Promise.resolve({}));
    render(<NewUser newUserAction={mockNewUserAction} />, {
      userContext: { authUser: MOCK_AUTH_USER, user: null },
    });

    const avatarUrlInput = screen.getByLabelText('Avatar URL');
    expect(avatarUrlInput).not.toHaveAttribute('readOnly');
  });
});