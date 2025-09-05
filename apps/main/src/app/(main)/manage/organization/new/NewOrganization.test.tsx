import '@/matchMedia.mock';
import { act, fireEvent, render, screen } from '@/test-utils';
import { NewOrganization } from './NewOrganization';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('NewOrganization component', () => {
  it('should call newOrganizationAction with the correct data on form submission', async () => {
    const newOrganizationAction = jest.fn(() =>
      Promise.resolve({ path: 'new-org-id' }),
    );

    render(<NewOrganization newOrganizationAction={newOrganizationAction} />);

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
    expect(newOrganizationAction).toHaveBeenCalledWith({
      name: 'New Test Organization',
      website: 'https://new-example.com',
    });
  });

  it('should display an error message if the action fails', async () => {
    const newOrganizationAction = jest.fn(() =>
      Promise.reject(new Error('Failed to create')),
    );

    render(<NewOrganization newOrganizationAction={newOrganizationAction} />);

    // Fill out the form
    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'New Test Organization' } });

    // Click the create button
    const createButton = screen.getByRole('button', {
      name: /create organization/i,
    });
    fireEvent.click(createButton);

    // Wait for the error message to appear
    await screen.findByText('Failed to create');
  });
});
