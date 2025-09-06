import { render, screen, fireEvent, act, waitFor } from '@/test-utils';
import { NewSeries } from './NewSeries';
import '@/matchMedia.mock';
import { FormActionResult } from '@/components/forms/forms';

// Mock dependencies
jest.mock('next/navigation', () => ({
  // eslint-disable-next-line @eslint-react/hooks-extra/no-unnecessary-use-prefix
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the DatePicker component to avoid interacting with its UI
jest.mock('@mantine/dates', () => {
  const originalModule = jest.requireActual('@mantine/dates');
  const React = require('react');
  return {
    ...originalModule,
    DatePicker: jest.fn(
      ({
        value,
        onChange,
        ...props
      }: {
        value: [Date | null, Date | null];
        onChange: (value: [Date, Date]) => void;
        'data-testid'?: string;
      }) => (
        <>
          <input
            type="date"
            data-testid="series-date-picker"
            value={
              value && value[0]
                ? new Date(value[0]).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => {
              const date = new Date(e.target.value + 'T00:00:00Z');
              onChange([date, value?.[1] || date]);
            }}
          />
          <input
            type="date"
            data-testid="series-date-picker"
            value={
              value && value[1]
                ? new Date(value[1]).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => {
              const date = new Date(e.target.value + 'T00:00:00Z');
              onChange([value?.[0] || date, date]);
            }}
          />
        </>
      ),
    ),
  };
});

describe('NewSeries component', () => {
  const mockDate = new Date('2025-07-15T12:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should call newSeriesAction with the correct data on form submission', async () => {
    const newSeriesAction = jest.fn(
      (): Promise<FormActionResult<{ path?: string }>> =>
        Promise.resolve({
          type: 'success',
          message: '',
          path: 'new-series-id',
        }),
    );

    render(
      <NewSeries
        newSeriesAction={newSeriesAction}
        path="organizations/org-1"
      />,
    );

    // Fill out the form
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'New Test Series' },
    });
    fireEvent.change(screen.getByTestId('location-input'), {
      target: { value: 'Test Location' },
    });
    fireEvent.change(screen.getByTestId('website-input'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'This is a test series description.' },
    });

    // Select a date range by navigating months
    const datePickers = await screen.findAllByTestId('series-date-picker');
    fireEvent.change(datePickers[0], {
      target: { value: '2025-08-01' },
    });
    fireEvent.change(datePickers[1], {
      target: { value: '2025-08-15' },
    });

    act(() => {
      jest.runAllTimers();
    });

    const createButton = screen.getByRole('button', { name: /create series/i });
    await waitFor(() => expect(createButton).not.toBeDisabled());

    // Click the create button
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(newSeriesAction).toHaveBeenCalledWith(
        'organizations/org-1',
        expect.objectContaining({
          name: 'New Test Series',
          location: 'Test Location',
          website: 'https://example.com',
          description: 'This is a test series description.',
          startDate: new Date('2025-08-01T00:00:00.000Z'),
          endDate: new Date('2025-08-15T00:00:00.000Z'),
        }),
      );
    });
  });

  it('should display an error message if the action fails', async () => {
    const newSeriesAction = jest.fn(() =>
      Promise.reject(new Error('Failed to create')),
    );

    render(
      <NewSeries
        newSeriesAction={newSeriesAction}
        path="organizations/org-1"
      />,
    );

    // Fill out the form
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'New Test Series' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'This is a test series description.' },
    });

    // Select a date range
    const datePickers = await screen.findAllByTestId('series-date-picker');
    fireEvent.change(datePickers[0], {
      target: { value: '2025-08-01' },
    });
    fireEvent.change(datePickers[1], {
      target: { value: '2025-08-15' },
    });

    act(() => {
      jest.runAllTimers();
    });

    const createButton = screen.getByRole('button', { name: /create series/i });
    await waitFor(() => expect(createButton).not.toBeDisabled());

    // Click the create button
    fireEvent.click(createButton);

    // Wait for the error message to appear
    expect(await screen.findByText('Failed to create')).toBeInTheDocument();
  });
});
