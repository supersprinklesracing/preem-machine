import {
  act,
  fireEvent,
  render,
  screen,
  setupMockDb,
  waitFor,
  within,
} from '@/test-utils';
import { NewEvent } from './NewEvent';

describe('NewEvent component', () => {
  setupMockDb();

  const mockDate = new Date('2025-08-15T12:00:00Z');
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call newEventAction with the correct data on form submission', async () => {
    const newEventAction = jest.fn(() =>
      Promise.resolve({ path: 'new-event-id' }),
    );

    render(
      <NewEvent
        series={{
          id: 'series-sprinkles-2025',
          path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025',
          name: 'Test Series',
          timezone: 'America/New_York',
          organizationBrief: {
            id: 'org-super-sprinkles',
            path: 'organizations/org-super-sprinkles',
            name: 'Test Organization',
          },
        }}
        newEventAction={newEventAction}
        path="series/some-series-id"
      />,
    );

    // Fill out the form
    const nameInput = screen.getByTestId('name-input');
    const descriptionInput = screen.getByTestId('description-input');
    const websiteInput = screen.getByTestId('website-input');
    const locationInput = screen.getByTestId('location-input');
    const datePicker = screen.getByTestId('date-picker');

    await act(async () => {
      fireEvent.change(nameInput, {
        target: { value: 'New Test Event' },
      });
      fireEvent.change(descriptionInput, {
        target: { value: 'A description' },
      });
      fireEvent.change(websiteInput, {
        target: { value: 'https://new-example.com' },
      });
      fireEvent.change(locationInput, {
        target: { value: 'Outer space' },
      });
      fireEvent.click(datePicker);
      jest.advanceTimersByTime(500);
    });

    const createButton = screen.getByRole('button', {
      name: /create event/i,
    });
    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });
    await act(async () => {
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(newEventAction).toHaveBeenCalledWith({
        path: 'series/some-series-id',
        values: expect.objectContaining({
          name: 'New Test Event',
          timezone: 'America/New_York',
        }),
      });
    });
  });

  it.skip('should display an error message if the action fails', async () => {
    const newEventAction = jest.fn(() =>
      Promise.reject(new Error('Failed to create')),
    );

    render(
      <NewEvent
        series={{
          id: 'series-sprinkles-2025',
          path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025',
          name: 'Test Series',
          organizationBrief: {
            id: 'org-super-sprinkles',
            path: 'organizations/org-super-sprinkles',
            name: 'Test Organization',
          },
        }}
        newEventAction={newEventAction}
        path="series/some-series-id"
      />,
    );

    const nameInput = screen.getByTestId('name-input');
    const descriptionInput = screen.getByTestId('description-input');
    const datePicker = screen.getByTestId('date-picker');

    await act(async () => {
      fireEvent.change(nameInput, {
        target: { value: 'New Test Event' },
      });
      fireEvent.change(descriptionInput, {
        target: { value: 'This is a test description' },
      });
      fireEvent.click(datePicker);
      const popover = await screen.findByRole('table');
      fireEvent.click(within(popover).getByLabelText('15 August 2025'));
      await jest.runAllTimersAsync(); // Let popover close
    });

    const createButton = screen.getByRole('button', {
      name: /create event/i,
    });
    await act(async () => {
      fireEvent.click(createButton);
    });

    // Wait for the error message to appear
    await screen.findByText('Failed to create');
    console.log(document.body.innerHTML);
    expect(screen.getByText('Failed to create')).toBeInTheDocument();
  });
});
