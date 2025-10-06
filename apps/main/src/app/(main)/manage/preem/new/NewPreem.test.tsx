import userEvent from '@testing-library/user-event';

import { FormActionResult } from '@/components/forms/forms';
import { Race } from '@/datastore/schema';
import { act, render, screen, waitFor } from '@/test-utils';

import { NewPreem } from './NewPreem';

jest.mock('@/components/forms/RichTextEditor');

describe('NewPreem component', () => {
  const mockRace: Race = {
    id: 'race-1',
    path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
    name: 'Test Race',
    startDate: new Date('2025-09-01T12:00:00Z'),
    endDate: new Date('2025-09-02T12:00:00Z'),
    eventBrief: {
      id: 'event-1',
      path: 'organizations/org-1/series/series-1/events/event-1',
      name: 'Test Event',
      seriesBrief: {
        id: 'series-1',
        path: 'organizations/org-1/series/series-1',
        name: 'Test Series',
        organizationBrief: {
          id: 'org-1',
          path: 'organizations/org-1',
          name: 'Test Organization',
        },
      },
    },
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-08-05T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call newPreemAction with the correct data on form submission', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const newPreemAction = jest.fn(
      (): Promise<FormActionResult<{ path?: string }>> =>
        Promise.resolve({
          path: 'new-preem-id',
        }),
    );

    render(
      <NewPreem
        race={mockRace}
        newPreemAction={newPreemAction}
        path="organizations/org-1/series/series-1/events/event-1/races/race-1/preems"
      />,
    );

    // Fill out the form
    await user.type(screen.getByTestId('name-input'), 'New Test Preem');
    await user.type(
      screen.getByTestId('description-input'),
      '<p>This is a test preem description.</p>',
    );

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    const createButton = screen.getByRole('button', { name: /create preem/i });
    await waitFor(() => {
      expect(createButton).toBeEnabled();
    });
    await user.click(createButton);

    await waitFor(() => {
      expect(newPreemAction).toHaveBeenCalledWith({
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems',
        values: expect.objectContaining({
          name: 'New Test Preem',
          description: '<p>This is a test preem description.</p>',
        }),
      });
    });
  });

  it('should display an error message if the action fails', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const newPreemAction = jest.fn(() =>
      Promise.reject(new Error('Failed to create')),
    );

    render(
      <NewPreem
        race={mockRace}
        newPreemAction={newPreemAction}
        path="organizations/org-1/series/series-1/events/event-1/races/race-1/preems"
      />,
    );

    await user.type(screen.getByTestId('name-input'), 'New Preem Name');
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    const createButton = screen.getByRole('button', { name: /create preem/i });
    await waitFor(() => {
      expect(createButton).toBeEnabled();
    });
    await user.click(createButton);

    await screen.findByText('Failed to create');
  });
});
