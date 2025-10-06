import userEvent from '@testing-library/user-event';

import { Organization } from '@/datastore/schema';
import { act, render, screen, waitFor } from '@/test-utils';

import { NewSeries } from './NewSeries';

jest.mock('@/components/forms/RichTextEditor');

describe('NewSeries component', () => {
  const mockOrganization: Organization = {
    id: 'org-1',
    path: 'organizations/org-1',
    name: 'Test Organization',
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call newSeriesAction with the correct data on form submission', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const newSeriesAction = jest.fn(() =>
      Promise.resolve({ path: 'new-series-id' }),
    );

    render(
      <NewSeries
        organization={mockOrganization}
        newSeriesAction={newSeriesAction}
        path="organizations/org-1"
      />,
    );

    await user.type(screen.getByTestId('name-input'), 'New Test Series');
    await user.type(
      screen.getByTestId('description-input'),
      '<p>This is a test series description.</p>',
    );
    await user.type(
      screen.getByTestId('website-input'),
      'https://new-example.com',
    );
    await user.type(screen.getByTestId('location-input'), 'Outer space');

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    const createButton = screen.getByRole('button', { name: /create series/i });
    await waitFor(() => expect(createButton).toBeEnabled());
    await user.click(createButton);

    await waitFor(() => {
      expect(newSeriesAction).toHaveBeenCalledWith({
        path: 'organizations/org-1',
        values: expect.objectContaining({
          name: 'New Test Series',
          description: '<p>This is a test series description.</p>',
          website: 'https://new-example.com',
          location: 'Outer space',
        }),
      });
    });
  });

  it('should display an error message if the action fails', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const newSeriesAction = jest.fn(() =>
      Promise.reject(new Error('Failed to create')),
    );

    render(
      <NewSeries
        organization={mockOrganization}
        newSeriesAction={newSeriesAction}
        path="organizations/org-1"
      />,
    );

    await user.type(screen.getByTestId('name-input'), 'New Test Series');
    await user.type(
      screen.getByTestId('website-input'),
      'https://new-example.com',
    );
    await user.type(screen.getByTestId('location-input'), 'Outer space');
    await user.type(
      screen.getByTestId('description-input'),
      '<p>This is a test series description.</p>',
    );

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    const createButton = screen.getByRole('button', { name: /create series/i });
    await waitFor(() => expect(createButton).toBeEnabled());
    await user.click(createButton);

    expect(await screen.findByText('Failed to create')).toBeInTheDocument();
  });
});
