import '@/matchMedia.mock';
import { act, fireEvent, render, screen, waitFor } from '@/test-utils';
import { NewEvent } from './NewEvent';

// Mock dependencies
jest.mock('next/navigation', () => ({
  // eslint-disable-next-line @eslint-react/hooks-extra/no-unnecessary-use-prefix
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('NewEvent component', () => {
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
      <NewEvent newEventAction={newEventAction} path="series/some-series-id" />,
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
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(newEventAction).toHaveBeenCalledWith({
        path: 'series/some-series-id',
        values: expect.objectContaining({
          name: 'New Test Event',
        }),
      });
    });
  });

  it('should display an error message if the action fails', async () => {
    const newEventAction = jest.fn(() =>
      Promise.reject(new Error('Failed to create')),
    );

    render(
      <NewEvent newEventAction={newEventAction} path="series/some-series-id" />,
    );

    const nameInput = screen.getByTestId('name-input');
    const descriptionInput = screen.getByTestId('description-input');
    await act(async () => {
      fireEvent.change(nameInput, {
        target: { value: 'New Test Event' },
      });
      fireEvent.change(descriptionInput, {
        target: { value: 'This is a test description' },
      });
      jest.advanceTimersByTime(500);
    });

    const createButton = screen.getByRole('button', {
      name: /create event/i,
    });
    fireEvent.click(createButton);

    // Wait for the error message to appear
    await screen.findByText('Failed to create');
  });
});
