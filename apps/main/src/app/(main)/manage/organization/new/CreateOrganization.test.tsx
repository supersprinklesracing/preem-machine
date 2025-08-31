import '@/matchMedia.mock';
import { act, fireEvent, render, screen } from '@/test-utils';
import { CreateOrganization } from './CreateOrganization';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('CreateOrganization component', () => {
  it('should call createOrganizationAction with the correct data on form submission', async () => {
    const createOrganizationAction = jest.fn(() =>
      Promise.resolve({ ok: true, organizationId: 'new-org-id' }),
    );

    render(
      <CreateOrganization
        createOrganizationAction={createOrganizationAction}
      />,
    );

    // Fill out the form
    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'New Test Organization' } });

    const websiteInput = screen.getByTestId('website-input');
    fireEvent.change(websiteInput, {
      target: { value: 'https://new-example.com' },
    });

    // Click the create button
    const createButton = screen.getByRole('button', {
      name: /create organization/i,
    });
    fireEvent.click(createButton);

    // Wait for the action to be called
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Assert that the action was called with the correct data
    expect(createOrganizationAction).toHaveBeenCalledWith({
      name: 'New Test Organization',
      website: 'https://new-example.com',
    });
  });
});
