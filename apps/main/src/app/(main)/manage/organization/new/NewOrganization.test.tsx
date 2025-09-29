import { act, fireEvent, render, screen, waitFor } from '@/test-utils';

import { NewOrganization } from './NewOrganization';

describe('NewOrganization component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call newOrganizationAction with the correct data on form submission', async () => {
    const newOrganizationAction = jest.fn(() =>
      Promise.resolve({ path: 'new-org-id' }),
    );

    render(<NewOrganization newOrganizationAction={newOrganizationAction} />);

    // Fill out the form
    const nameInput = screen.getByTestId('name-input');
    const descriptionInput = screen.getByTestId('description-input');
    const websiteInput = screen.getByTestId('website-input');

    await act(async () => {
      fireEvent.change(nameInput, {
        target: { value: 'New Test Organization' },
      });
      fireEvent.change(descriptionInput, {
        target: { value: 'This is a test description' },
      });
      fireEvent.change(websiteInput, {
        target: { value: 'https://new-example.com' },
      });
      jest.advanceTimersByTime(500);
    });

    // Click the create button
    const createButton = screen.getByRole('button', {
      name: /create organization/i,
    });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(newOrganizationAction).toHaveBeenCalledWith({
        values: {
          name: 'New Test Organization',
          description: 'This is a test description',
          website: 'https://new-example.com',
        },
      });
    });

    // Assert that the action was called with the correct data
    expect(newOrganizationAction).toHaveBeenCalledWith({
      values: {
        name: 'New Test Organization',
        description: 'This is a test description',
        website: 'https://new-example.com',
      },
    });
  });

  it('should display an error message if the action fails', async () => {
    const newOrganizationAction = jest.fn(() =>
      Promise.reject(new Error('Failed to create')),
    );

    render(<NewOrganization newOrganizationAction={newOrganizationAction} />);

    // Fill out the form
    const nameInput = screen.getByTestId('name-input');
    const descriptionInput = screen.getByTestId('description-input');
    const websiteInput = screen.getByTestId('website-input');
    await act(async () => {
      fireEvent.change(nameInput, {
        target: { value: 'New Test Organization' },
      });
      fireEvent.change(descriptionInput, {
        target: { value: 'This is a test description' },
      });
      fireEvent.change(websiteInput, {
        target: { value: 'https://new-example.com' },
      });
      jest.advanceTimersByTime(500);
    });

    const createButton = screen.getByRole('button', {
      name: /create organization/i,
    });

    // Wait for the button to be enabled
    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    // Click the create button
    await act(async () => {
      fireEvent.click(createButton);
    });

    // Wait for the error message to appear
    expect(await screen.findByText('Failed to create')).toBeInTheDocument();
  });
});
