import type { ClientCompat, Organization } from '@/datastore/types';
import '@/matchMedia.mock';
import { act, fireEvent, render, screen } from '@/test-utils';
import { EditOrganization } from './EditOrganization';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));
jest.mock('./StripeConnectCard', () => ({
  __esModule: true,
  StripeConnectCard: jest.fn(() => <div>Mock StripeConnectCard</div>),
}));

const mockOrganization: ClientCompat<Organization> = {
  id: 'org-1',
  path: 'organizations/org-1',
  name: 'Test Organization',
  website: 'https://example.com',
};

describe('EditOrganization component', () => {
  it('should call updateOrganizationAction with the correct data on form submission', async () => {
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
    fireEvent.change(nameInput, { target: { value: 'New Org Name' } });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the action to be called
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Assert that the action was called with the correct data
    expect(updateOrganizationAction).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'organizations/org-1',
        edits: expect.objectContaining({
          name: 'New Org Name',
        }),
      }),
    );
  });

  it('should display an error message if the action fails', async () => {
    const updateOrganizationAction = jest.fn(() =>
      Promise.reject(new Error('Failed to save')),
    );

    render(
      <EditOrganization
        organization={mockOrganization}
        editOrganizationAction={updateOrganizationAction}
      />,
    );

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Organization');
    fireEvent.change(nameInput, { target: { value: 'New Org Name' } });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the error message to appear
    await screen.findByText('Failed to save');
  });
});
