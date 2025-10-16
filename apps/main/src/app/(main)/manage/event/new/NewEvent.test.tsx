import userEvent from '@testing-library/user-event';

import { Series } from '@/datastore/schema';
import {
  act,
  render,
  screen,
  setupTimeMocking,
  waitFor,
} from '@/test-utils';

import { NewEvent } from './NewEvent';

describe('NewEvent component', () => {
  setupTimeMocking();

  const mockSeries: Series = {
    id: 'series-1',
    path: 'organizations/org-1/series/series-1',
    name: 'Test Series',
    organizationBrief: {
      id: 'org-1',
      path: 'organizations/org-1',
      name: 'Test Organization',
    },
  };

  it('should call newEventAction with the correct data on form submission', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const newEventAction = jest.fn(() =>
      Promise.resolve({ path: 'new-event-id' }),
    );

    render(
      <NewEvent
        series={mockSeries}
        newEventAction={newEventAction}
        path="organizations/org-1/series/series-1"
      />,
    );

    await user.type(screen.getByTestId('name-input'), 'New Test Event');
    await user.type(screen.getByTestId('location-input'), 'Test Location');
    await user.type(screen.getByTestId('website-input'), 'https://example.com');
    await user.type(
      screen.getByTestId('description-input'),
      '<p>A description</p>',
    );
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    const createButton = screen.getByRole('button', { name: /create event/i });
    await waitFor(() => expect(createButton).toBeEnabled());
    await user.click(createButton);

    await waitFor(() => {
      expect(newEventAction).toHaveBeenCalledWith({
        path: 'organizations/org-1/series/series-1',
        values: expect.objectContaining({
          name: 'New Test Event',
          location: 'Test Location',
          website: 'https://example.com',
          description: '<p>A description</p>',
        }),
      });
    });
  });

  it('should display an error message if the action fails', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const newEventAction = jest.fn(() =>
      Promise.reject(new Error('Failed to create')),
    );

    render(
      <NewEvent
        series={mockSeries}
        newEventAction={newEventAction}
        path="organizations/org-1/series/series-1"
      />,
    );

    await user.type(screen.getByTestId('name-input'), 'New Test Event');
    await user.type(screen.getByTestId('location-input'), 'Test Location');
    await user.type(screen.getByTestId('website-input'), 'https://example.com');
    await user.type(
      screen.getByTestId('description-input'),
      '<p>A description</p>',
    );
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    const createButton = screen.getByRole('button', { name: /create event/i });
    await waitFor(() => expect(createButton).toBeEnabled());
    await user.click(createButton);

    expect(await screen.findByText('Failed to create')).toBeInTheDocument();
  });
});
