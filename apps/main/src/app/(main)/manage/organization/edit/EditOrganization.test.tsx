import type { Organization } from '@/datastore/schema';
import '@/matchMedia.mock';
import { act, fireEvent, render, screen, waitFor } from '@/test-utils';
import { EditOrganization } from './EditOrganization';

// Mock dependencies
jest.mock('next/navigation', () => ({
  // eslint-disable-next-line @eslint-react/hooks-extra/no-unnecessary-use-prefix
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));
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
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Org Name' } });
      jest.advanceTimersByTime(500);
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the action to be called
    await waitFor(() => {
      expect(updateOrganizationAction).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'organizations/org-1',
          edits: expect.objectContaining({
            name: 'New Org Name',
          }),
        }),
      );
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
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Org Name' } });
      jest.advanceTimersByTime(500);
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the error message to appear
    await screen.findByText('Failed to save');
  });
});
