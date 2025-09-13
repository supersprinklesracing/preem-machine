import { act, fireEvent, render, screen, waitFor, within } from '@/test-utils';
import { NewSeries } from './NewSeries';

// Mock dependencies
jest.mock('next/navigation', () => ({
  // eslint-disable-next-line @eslint-react/hooks-extra/no-unnecessary-use-prefix
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('NewSeries component', () => {
  const mockDate = new Date('2025-08-15T12:00:00Z');
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call newSeriesAction with the correct data on form submission', async () => {
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

    await act(async () => {
      fireEvent.change(nameInput, {
        target: { value: 'New Test Series' },
      });
      fireEvent.change(descriptionInput, {
        target: { value: 'This is a test series description.' },
      });
      fireEvent.change(websiteInput, {
        target: { value: 'https://new-example.com' },
      });
      fireEvent.change(locationInput, {
        target: { value: 'Outer space' },
      });

      // Select a date range
      fireEvent.click(datePicker);
      // fireEvent.click(screen.getAllByText('3')[0]);
      // fireEvent.click(screen.getAllByText('15')[0]);

      jest.advanceTimersByTime(500);
    });

    const createButton = screen.getByRole('button', { name: /create series/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(newSeriesAction).toHaveBeenCalledWith({
        path: 'organizations/org-1',
        values: expect.objectContaining({
          name: 'New Test Series',
          description: 'This is a test series description.',
          website: 'https://new-example.com',
          location: 'Outer space',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          // TODO: Fix this.
          // startDate: new Date('2025-08-03T00:00:00.000Z'),
          // endDate: new Date('2025-08-15T00:00:00.000Z'),
        }),
      });
    });
  });

  it('should display an error message if the action fails', async () => {
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
    await act(async () => {
      fireEvent.change(nameInput, {
        target: { value: 'New Test Series' },
      });
      fireEvent.change(descriptionInput, {
        target: { value: 'This is a test series description.' },
      });
      fireEvent.change(websiteInput, {
        target: { value: 'https://new-example.com' },
      });
      fireEvent.change(locationInput, {
        target: { value: 'Outer space' },
      });
      fireEvent.click(datePicker);
      const popover = await screen.findByRole('table');
      fireEvent.click(within(popover).getByLabelText('15 August 2025'));
      await jest.runAllTimersAsync(); // Let popover close
    });

    const createButton = screen.getByRole('button', { name: /create series/i });
    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });
    await act(async () => {
      fireEvent.click(createButton);
    });

    // Wait for the error message to appear
    expect(await screen.findByText('Failed to create')).toBeInTheDocument();
  });
});
