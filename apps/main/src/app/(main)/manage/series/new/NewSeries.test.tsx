import userEvent from '@testing-library/user-event';

import { act, render, screen, waitFor, within } from '@/test-utils';

import { NewSeries } from './NewSeries';

import { setupMockDb, setupUserContext } from '@/test-utils';

describe('NewSeries component', () => {
  setupMockDb();
  setupUserContext();

  const mockDate = new Date('2025-08-15T12:00:00Z');
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call newSeriesAction with the correct data on form submission', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const newSeriesAction = jest.fn(() =>
      Promise.resolve({ path: 'new-event-id' }),
    );

    render(
      <NewSeries
        organization={{
          id: 'org-1',
          path: 'organizations/org-1',
          name: 'Test Organization',
        }}
        newSeriesAction={newSeriesAction}
        path="organizations/org-1"
      />,
    );

    // Fill out the form
    const nameInput = screen.getByTestId('name-input');
    const descriptionInput = screen.getByTestId('description-input');
    const websiteInput = screen.getByTestId('website-input');
    const locationInput = screen.getByTestId('location-input');
    const datePicker = screen.getByTestId('date-picker');

    await user.type(nameInput, 'New Test Series');
    await user.type(descriptionInput, 'This is a test series description.');
    await user.type(websiteInput, 'https://new-example.com');
    await user.type(locationInput, 'Outer space');

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Select a date range
    await user.click(datePicker);
    const popover = await screen.findByRole('table');
    await user.click(within(popover).getByText('3'));
    await user.click(within(popover).getByText('15'));

    await act(async () => {
      await jest.runAllTimersAsync(); // Let popover close
    });

    const createButton = screen.getByRole('button', { name: /create series/i });
    await waitFor(() => expect(createButton).toBeEnabled());
    await user.click(createButton);

    await waitFor(() => {
      expect(newSeriesAction).toHaveBeenCalledWith({
        path: 'organizations/org-1',
        values: expect.objectContaining({
          name: 'New Test Series',
          description: 'This is a test series description.',
          website: 'https://new-example.com',
          location: 'Outer space',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          startDate: new Date('2025-08-03T00:00:00.000Z'),
          endDate: new Date('2025-08-15T00:00:00.000Z'),
        }),
      });
    });
  });

  it('should display an error message if the action fails', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const newSeriesAction = jest.fn(() =>
      Promise.reject(new Error('Failed to create')),
    );

    render(
      <NewSeries
        organization={{
          id: 'org-1',
          path: 'organizations/org-1',
          name: 'Test Organization',
        }}
        newSeriesAction={newSeriesAction}
        path="organizations/org-1"
      />,
    );

    const nameInput = screen.getByTestId('name-input');
    const descriptionInput = screen.getByTestId('description-input');
    const websiteInput = screen.getByTestId('website-input');
    const locationInput = screen.getByTestId('location-input');
    const datePicker = screen.getByTestId('date-picker');
    await user.type(nameInput, 'New Test Series');
    await user.type(descriptionInput, 'This is a test series description.');
    await user.type(websiteInput, 'https://new-example.com');
    await user.type(locationInput, 'Outer space');

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await user.click(datePicker);

    const popover = await screen.findByRole('table');
    await user.click(within(popover).getByText('10'));
    await user.click(within(popover).getByText('15'));
    await act(async () => {
      await jest.runAllTimersAsync(); // Let popover close
    });

    const createButton = screen.getByRole('button', { name: /create series/i });
    await waitFor(() => expect(createButton).toBeEnabled());
    await user.click(createButton);

    // Wait for the error message to appear
    expect(await screen.findByText('Failed to create')).toBeInTheDocument();
  });
});
