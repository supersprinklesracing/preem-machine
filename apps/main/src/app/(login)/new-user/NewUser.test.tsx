import { act, fireEvent, render, screen, waitFor } from '@/test-utils';
import NewUser from './NewUser';



const mockAuthUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/avatar.png',
};

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
      authUser: mockAuthUser as any,
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
          email: 'test@example.com',
          avatarUrl: 'https://example.com/avatar.png',
          termsAccepted: true,
          affiliation: '',
          raceLicenseId: '',
          address: '',
        },
      });
    });
  });
});
