import { render, screen, fireEvent, act, waitFor } from '@/test-utils';
import { NewEvent } from './NewEvent';
import '@/matchMedia.mock';
import { FormActionResult } from '@/components/forms/forms';

// Mock dependencies
jest.mock('next/navigation', () => ({
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
            data-testid="startDate"
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
            data-testid="endDate"
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

describe('NewEvent component', () => {
  const mockNewEventAction = jest.fn();
  const mockPath = 'series/some-series-id';

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockNewEventAction.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call newEventAction with the correct data on form submission', async () => {
    const mockRouter = { push: jest.fn() };
    jest
      .spyOn(require('next/navigation'), 'useRouter')
      .mockReturnValue(mockRouter);

    const successfulResult: FormActionResult<{ path?: string }> = {
      path: 'events/new-event-id',
      type: 'success',
      message: '',
    };
    mockNewEventAction.mockResolvedValue(successfulResult);

    render(<NewEvent newEventAction={mockNewEventAction} path={mockPath} />);

    // Fill out the form
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'New Test Event' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'This is a test event description.' },
    });
    fireEvent.change(screen.getByTestId('startDate'), {
      target: { value: '2025-08-01' },
    });
    fireEvent.change(screen.getByTestId('endDate'), {
      target: { value: '2025-08-15' },
    });

    const createButton = screen.getByRole('button', { name: /create event/i });

    // Wait for the form to be valid and the button to be enabled
    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    // Click the create button
    await act(async () => {
      fireEvent.click(createButton);
    });

    // Wait for the action to be called and check arguments
    await waitFor(() => {
      expect(mockNewEventAction).toHaveBeenCalledWith(
        mockPath,
        expect.objectContaining({
          name: 'New Test Event',
          description: 'This is a test event description.',
          startDate: new Date('2025-08-01T00:00:00.000Z'),
          endDate: new Date('2025-08-15T00:00:00.000Z'),
        }),
      );
    });

    // Check for redirection
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/manage/new-event-id/edit');
    });
  });

  it('should display an error message if the action fails', async () => {
    mockNewEventAction.mockRejectedValue(new Error('Failed to create'));

    render(<NewEvent newEventAction={mockNewEventAction} path={mockPath} />);

    // Fill out the form
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'New Test Event' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'This is a test event description.' },
    });
    fireEvent.change(screen.getByTestId('startDate'), {
      target: { value: '2025-08-01' },
    });
    fireEvent.change(screen.getByTestId('endDate'), {
      target: { value: '2025-08-15' },
    });

    const createButton = screen.getByRole('button', { name: /create event/i });

    // Wait for the form to be valid
    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    // Click the create button
    await act(async () => {
      fireEvent.click(createButton);
    });

    // Wait for the error message to appear
    expect(await screen.findByText('Failed to create')).toBeInTheDocument();
  });
});
