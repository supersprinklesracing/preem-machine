import userEvent from '@testing-library/user-event';

import { FormActionResult } from '@/components/forms/forms';
import { render, screen, waitFor } from '@/test-utils';

import { NewOrganization } from './NewOrganization';

jest.mock('@/components/forms/RichTextEditor', () => ({
  RichTextEditor: (props: any) => (
    <textarea
      data-testid="description-input"
      onChange={(e) => props.onChange(e.target.value)}
      value={props.value}
    />
  ),
}));

describe('NewOrganization component', () => {
  it('should call newOrganizationAction with the correct data on form submission', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const newOrganizationAction = jest.fn(
      (): Promise<FormActionResult<{ path?: string }>> =>
        Promise.resolve({ path: 'new-org-id' }),
    );

    render(<NewOrganization newOrganizationAction={newOrganizationAction} />);

    await user.type(screen.getByTestId('name-input'), 'New Test Organization');
    await user.type(screen.getByTestId('website-input'), 'https://example.com');
    await user.type(
      screen.getByTestId('description-input'),
      '<p>A description</p>',
    );

    const createButton = screen.getByRole('button', {
      name: /create organization/i,
    });
    await waitFor(() => expect(createButton).toBeEnabled());
    await user.click(createButton);

    await waitFor(() => {
      expect(newOrganizationAction).toHaveBeenCalledWith(
        expect.objectContaining({
          values: {
            name: 'New Test Organization',
            website: 'https://example.com',
            description: '<p>A description</p>',
          },
        }),
      );
    });
  });

  it('should display an error message if the action fails', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const newOrganizationAction = jest.fn(
      (): Promise<FormActionResult<{ path?: string }>> =>
        Promise.reject(new Error('Failed to create')),
    );

    render(<NewOrganization newOrganizationAction={newOrganizationAction} />);

    await user.type(screen.getByTestId('name-input'), 'New Test Organization');
    await user.type(screen.getByTestId('website-input'), 'https://example.com');
    await user.type(
      screen.getByTestId('description-input'),
      '<p>A description</p>',
    );

    const createButton = screen.getByRole('button', {
      name: /create organization/i,
    });
    await waitFor(() => expect(createButton).toBeEnabled());
    await user.click(createButton);

    expect(await screen.findByText('Failed to create')).toBeInTheDocument();
  });
});
