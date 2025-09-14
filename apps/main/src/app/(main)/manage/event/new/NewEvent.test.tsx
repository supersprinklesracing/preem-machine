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

jest.mock('@mantine/dates', () => ({
  DatePicker: (props: any) => {
    const { value, onChange, type, ...rest } = props;
    const handleDateChange =
      (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(event.target.value);
        if (type === 'range') {
          const newValue = [...(value || [null, null])];
          newValue[index] = newDate;
          onChange(newValue);
        } else {
          onChange(newDate);
        }
      };

    if (type === 'range') {
      const [startDate, endDate] = value || [null, null];
      return (
        <div {...rest}>
          <input
            type="date"
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
            onChange={handleDateChange(0)}
            data-testid="start-date-input"
          />
          <input
            type="date"
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
            onChange={handleDateChange(1)}
            data-testid="end-date-input"
          />
        </div>
      );
    }

    return (
      <input
        type="date"
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={handleDateChange(0)}
        data-testid="date-picker"
      />
    );
  },
}));

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

  it('should display an error message if the action fails', async () => {
    const newEventAction = jest.fn(() =>
      Promise.reject(new Error('Failed to create')),
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

    const nameInput = screen.getByTestId('name-input');
    const descriptionInput = screen.getByTestId('description-input');
    const startDateInput = screen.getByTestId('start-date-input');

    await act(async () => {
      fireEvent.change(nameInput, {
        target: { value: 'New Test Event' },
      });
      fireEvent.change(descriptionInput, {
        target: { value: 'This is a test description' },
      });
      fireEvent.change(startDateInput, {
        target: { value: '2025-08-15' },
      });
    });

    const createButton = screen.getByRole('button', {
      name: /create event/i,
    });
    await act(async () => {
      fireEvent.click(createButton);
    });

    // Wait for the error message to appear
    await screen.findByText('Failed to create');
  });
});
