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
    DatePicker: jest.fn(({ value, onChange, ...props }) => (
      <input
        type="date"
        data-testid={props['data-testid']}
        value={value ? new Date(value).toISOString().split('T')[0] : ''}
        onChange={(e) => {
          // The browser may return a date string without a timezone,
          // so parse it as UTC.
          const date = new Date(e.target.value + 'T00:00:00Z');
          onChange(date);
        }}
      />
    )),
  };
});

describe('NewEvent component', () => {
  const mockNewEventAction = jest.fn();
  const mockPath = 'series/some-series-id';

  beforeEach(() => {
    jest.clearAllMocks();
    mockNewEventAction.mockReset();
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

  it('should reset the form and show success message on "Create and Add Another" click', async () => {
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

    const nameInput = screen.getByTestId('name-input');
    const descriptionInput = screen.getByTestId('description-input');
    const startDateInput = screen.getByTestId('startDate');
    const endDateInput = screen.getByTestId('endDate');

    // Fill out the form
    fireEvent.change(nameInput, {
      target: { value: 'Another Test Event' },
    });
    fireEvent.change(descriptionInput, {
      target: { value: 'This is another test event description.' },
    });
    fireEvent.change(startDateInput, {
      target: { value: '2025-09-01' },
    });
    fireEvent.change(endDateInput, {
      target: { value: '2025-09-15' },
    });

    const createAndAddAnotherButton = screen.getByTestId(
      'create-and-add-another-button',
    );

    // Wait for the form to be valid
    await waitFor(() => {
      expect(createAndAddAnotherButton).not.toBeDisabled();
    });

    // Click the "Create and Add Another" button
    await act(async () => {
      fireEvent.click(createAndAddAnotherButton);
    });

    // Wait for the action to be called
    await waitFor(() => {
      expect(mockNewEventAction).toHaveBeenCalledWith(
        mockPath,
        expect.objectContaining({
          name: 'Another Test Event',
          description: 'This is another test event description.',
          startDate: new Date('2025-09-01T00:00:00.000Z'),
          endDate: new Date('2025-09-15T00:00:00.000Z'),
        }),
      );
    });

    // Check for success message
    expect(
      await screen.findByText('Event created successfully.'),
    ).toBeInTheDocument();

    // Check that the form is reset
    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
      expect(startDateInput).toHaveValue('');
      expect(endDateInput).toHaveValue('');
    });

    // Check that redirection did not happen
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
