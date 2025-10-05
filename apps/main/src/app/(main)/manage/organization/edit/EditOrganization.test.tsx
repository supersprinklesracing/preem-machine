import userEvent from '@testing-library/user-event';

import { Organization } from '@/datastore/schema';
import { act, render, screen, waitFor } from '@/test-utils';

import { EditOrganization } from './EditOrganization';

jest.mock('./StripeConnectCard', () => ({
  __esModule: true,
  StripeConnectCard: jest.fn(() => <div>Mock StripeConnectCard</div>),
}));

const mockOrganization: Organization = {
  id: 'org-1',
  path: 'organizations/org-1',
  name: 'Test Organization',
  website: 'https://example.com',
  description: 'This is a test description',
};

describe('EditOrganization component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call updateOrganizationAction with the correct data on form submission', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const updateOrganizationAction = jest.fn(() =>
      Promise.resolve({ ok: true }),
    );

    render(
      <EditOrganization
        organization={mockOrganization}
        editOrganizationAction={updateOrganizationAction}
      />,
    );

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Organization');
    const descriptionInput = screen.getByDisplayValue(
      'This is a test description',
    );

    await user.clear(nameInput);
    await user.type(nameInput, 'New Org Name');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'New Description');

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    // Wait for the action to be called
    await waitFor(() => {
      expect(updateOrganizationAction).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'organizations/org-1',
          edits: expect.objectContaining({
            name: 'New Org Name',
            description: 'New Description',
          }),
        }),
      );
    });
  });

  it('should display an error message if the action fails', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const editOrganizationAction = jest.fn(() =>
      Promise.reject(new Error('Failed to save')),
    );

    render(
      <EditOrganization
        organization={mockOrganization}
        editOrganizationAction={editOrganizationAction}
      />,
    );

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Organization');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Org Name');

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    // Wait for the error message to appear
    await screen.findByText('Failed to save');
  });
});
