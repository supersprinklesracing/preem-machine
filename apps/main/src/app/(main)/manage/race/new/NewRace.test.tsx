import userEvent from '@testing-library/user-event';

import { FormActionResult } from '@/components/forms/forms';
import { Event } from '@/datastore/schema';
import { render, screen, waitFor } from '@/test-utils';

import { NewRace } from './NewRace';

describe('NewRace component', () => {
  const mockEvent: Event = {
    id: 'event-1',
    path: 'organizations/org-1/series/series-1/events/event-1',
    name: 'Test Event',
    seriesBrief: {
      id: 'series-1',
      path: 'organizations/org-1/series/series-1',
      name: 'Test Series',
    },
    organizationBrief: {
      id: 'org-1',
      path: 'organizations/org-1',
      name: 'Test Organization',
    },
  };

  it('should call newRaceAction with the correct data on form submission', async () => {
    const user = userEvent.setup({});
    const newRaceAction = jest.fn(
      (): Promise<FormActionResult<{ path?: string }>> =>
        Promise.resolve({ path: 'new-race-id' }),
    );

    render(
      <NewRace
        event={mockEvent}
        newRaceAction={newRaceAction}
        path="organizations/org-1/series/series-1/events/event-1/races"
      />,
    );

    await user.type(screen.getByTestId('name-input'), 'New Test Race');
    await user.type(screen.getByTestId('location-input'), 'Test Location');
    await user.type(screen.getByTestId('website-input'), 'https://example.com');
    await user.type(
      screen.getByTestId('description-input'),
      '<p>Test Description</p>',
    );
    await user.type(
      screen.getByTestId('course-details-input'),
      '<p>Test Course Details</p>',
    );

    const createButton = screen.getByRole('button', { name: /create race/i });
    await waitFor(() => expect(createButton).toBeEnabled());
    await user.click(createButton);

    await waitFor(() => {
      expect(newRaceAction).toHaveBeenCalledWith({
        path: 'organizations/org-1/series/series-1/events/event-1/races',
        values: expect.objectContaining({
          name: 'New Test Race',
          location: 'Test Location',
          website: 'https://example.com',
          description: '<p>Test Description</p>',
          courseDetails: '<p>Test Course Details</p>',
        }),
      });
    });
  });

  it('should display an error message if the action fails', async () => {
    const user = userEvent.setup({});
    const newRaceAction = jest.fn(
      (): Promise<FormActionResult<{ path?: string }>> =>
        Promise.reject(new Error('Failed to create')),
    );

    render(
      <NewRace
        event={mockEvent}
        newRaceAction={newRaceAction}
        path="organizations/org-1/series/series-1/events/event-1/races"
      />,
    );

    await user.type(screen.getByTestId('name-input'), 'New Test Race');
    await user.type(screen.getByTestId('location-input'), 'Test Location');
    await user.type(screen.getByTestId('website-input'), 'https://example.com');
    await user.type(
      screen.getByTestId('description-input'),
      '<p>Test Description</p>',
    );
    await user.type(
      screen.getByTestId('course-details-input'),
      '<p>Test Course Details</p>',
    );

    const createButton = screen.getByRole('button', { name: /create race/i });
    await waitFor(() => expect(createButton).toBeEnabled());
    await user.click(createButton);

    expect(await screen.findByText('Failed to create')).toBeInTheDocument();
  });
});