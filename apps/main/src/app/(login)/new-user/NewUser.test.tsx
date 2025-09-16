import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  MOCK_AUTH_USER,
} from '@/test-utils';
import NewUser from './NewUser';

describe('NewUser component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call newUserAction with the correct data on form submission', async () => {
    const mockNewUserAction = jest.fn(() => Promise.resolve({}));
    render(<NewUser newUserAction={mockNewUserAction} />, {
      userContext: { authUser: MOCK_AUTH_USER, user: null },
    });

    // Change the name in the form
    const nameInput = screen.getAllByDisplayValue('Test User')[0];
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    // Wait for the debounced value to update
    act(() => {
      jest.advanceTimersByTime(600);
    });

    // Wait for the save button to be enabled
    await waitFor(() => {
      expect(screen.getByText('Save and Continue')).not.toBeDisabled();
    });

    // Click the save button
    const saveButton = screen.getByText('Save and Continue');
    fireEvent.click(saveButton);

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
});
