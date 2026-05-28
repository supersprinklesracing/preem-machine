import userEvent from '@testing-library/user-event';

import { act, render, screen, waitFor } from '@/test-utils';

import { NewOrganization } from './NewOrganization';

describe('NewOrganization component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call newOrganizationAction with the correct data on form submission', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const newOrganizationAction = jest.fn(() =>
      Promise.resolve({ path: 'new-org-id' }),
    );

    render(<NewOrganization newOrganizationAction={newOrganizationAction} />);

    // Fill out the form
    const nameInput = screen.getByTestId('name-input');
    const descriptionInput = screen.getByTestId('description-input');
    const websiteInput = screen.getByTestId('website-input');

    await user.type(nameInput, 'New Test Organization');
    await user.type(descriptionInput, 'This is a test description');
    await user.type(websiteInput, 'https://new-example.com');
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Click the create button
    const createButton = screen.getByRole('button', {
      name: /create organization/i,
    });
    await user.click(createButton);

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
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const newOrganizationAction = jest.fn(() =>
      Promise.reject(new Error('Failed to create')),
    );

    render(<NewOrganization newOrganizationAction={newOrganizationAction} />);

    // Fill out the form
    const nameInput = screen.getByTestId('name-input');
    const descriptionInput = screen.getByTestId('description-input');
    const websiteInput = screen.getByTestId('website-input');
    await user.type(nameInput, 'New Test Organization');
    await user.type(descriptionInput, 'This is a test description');
    await user.type(websiteInput, 'https://new-example.com');
    await act(async () => {
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
    await user.click(createButton);

    // Wait for the error message to appear
    expect(await screen.findByText('Failed to create')).toBeInTheDocument();
  });
});
