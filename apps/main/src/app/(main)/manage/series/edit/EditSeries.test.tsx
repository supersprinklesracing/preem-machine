import type { Series } from '@/datastore/schema';
import '@/matchMedia.mock';
import { act, fireEvent, render, screen, waitFor } from '@/test-utils';
import { EditSeries } from './EditSeries';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  // eslint-disable-next-line @eslint-react/hooks-extra/no-unnecessary-use-prefix
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

const mockSeries: Series = {
  id: 'series-1',
  path: 'organizations/org-1/series/series-1',
  name: 'Test Series',
  description: 'This is a test series description.',
  location: 'Test Location',
  website: 'https://example.com',
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  organizationBrief: {
    id: 'org-1',
    path: 'organizations/org-1',
    name: 'Test Org',
  },
};

describe('EditSeries component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call editSeriesAction with the correct data on form submission', async () => {
    const newEventAction = jest.fn(() => Promise.resolve({ ok: true, path: '' }));
    const editSeriesAction = jest.fn(() => Promise.resolve({ ok: true, id: 'series-1', path: 'organizations/org-1/series/series-1' }));

    render(
      <EditSeries
        series={mockSeries}
        newEventAction={newEventAction}
        editSeriesAction={editSeriesAction}
      />,
    );

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Series');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Series Name' } });
      jest.advanceTimersByTime(500);
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the action to be called
    await waitFor(() => {
      expect(editSeriesAction).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'organizations/org-1/series/series-1',
          edits: expect.objectContaining({
            name: 'New Series Name',
          }),
        }),
      );
    });
  });

  it('should display an error message if the action fails', async () => {
    const newEventAction = jest.fn(() => Promise.resolve({ ok: true, path: '' }));
    const editSeriesAction = jest.fn(() =>
      Promise.reject(new Error('Failed to save')),
    );

    render(
      <EditSeries
        series={mockSeries}
        newEventAction={newEventAction}
        editSeriesAction={editSeriesAction}
      />,
    );

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Series');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Series Name' } });
      jest.advanceTimersByTime(500);
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the error message to appear
    await screen.findByText('Failed to save');
  });
});
