import { Preem } from '@/datastore/schema';
import { act, fireEvent, render, screen, waitFor } from '@/test-utils';
import { EditPreem } from './EditPreem';

const mockRouterPush = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  // eslint-disable-next-line @eslint-react/hooks-extra/no-unnecessary-use-prefix
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

const mockPreem: Preem = {
  id: 'preem-1',
  path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap',
  name: 'Test Preem',
  description: 'Test Description',
  type: 'Pooled',
  status: 'Open',
  prizePool: 100,
  minimumThreshold: 50,
  timeLimit: new Date('2025-09-01T10:00:00Z'),
  raceBrief: {
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
  },
};

describe('EditPreem component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockRouterPush.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call editPreemAction with the correct data on form submission and refresh the router', async () => {
    const editPreemAction = jest.fn(() => Promise.resolve({ ok: true }));

    render(<EditPreem preem={mockPreem} editPreemAction={editPreemAction} />);

    const nameInput = screen.getByDisplayValue('Test Preem');
    fireEvent.change(nameInput, { target: { value: 'New Preem Name' } });

    const descriptionInput = screen.getByDisplayValue('Test Description');
    fireEvent.change(descriptionInput, {
      target: { value: 'New Description' },
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(editPreemAction).toHaveBeenCalledWith({
        path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap',
        edits: {
          name: 'New Preem Name',
          description: 'New Description',
        },
      });
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women/preem-giro-sf-2025-masters-women-first-lap',
      );
    });
  });

  it('should display an error message if the action fails', async () => {
    const editPreemAction = jest.fn(() =>
      Promise.reject(new Error('Failed to save')),
    );

    render(<EditPreem preem={mockPreem} editPreemAction={editPreemAction} />);

    const nameInput = screen.getByDisplayValue('Test Preem');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Preem Name' } });
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await screen.findByText('Failed to save');
  });

  it('should disable the save button until the form is changed', async () => {
    const editPreemAction = jest.fn(() => Promise.resolve({ ok: true }));

    render(<EditPreem preem={mockPreem} editPreemAction={editPreemAction} />);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeDisabled();

    const nameInput = screen.getByDisplayValue('Test Preem');
    fireEvent.change(nameInput, { target: { value: 'New Preem Name' } });

    expect(saveButton).not.toBeDisabled();
  });

  it.skip('should display a validation error if the time limit is after the race start date', async () => {
    const editPreemAction = jest.fn(() => Promise.resolve({ ok: true }));

    render(<EditPreem preem={mockPreem} editPreemAction={editPreemAction} />);

    const timeLimitInput = screen.getByLabelText('Time Limit');
    await act(async () => {
      fireEvent.change(timeLimitInput, {
        target: { value: 'September 1, 2028 1:00 PM' },
      });
      fireEvent.blur(timeLimitInput);
      jest.runAllTimers();
    });

    await screen.findByText('Preem time limit cannot be after race start date');
  });
});
