import type { ClientCompat, Series } from '@/datastore/types';
import '@/matchMedia.mock';
import { fireEvent, render, screen, waitFor } from '@/test-utils';
import { EditSeries } from './EditSeries';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

const mockSeries: ClientCompat<Series> = {
  id: 'series-1',
  path: 'organizations/org-1/series/series-1',
  name: 'Test Series',
  location: 'Test Location',
  website: 'https://example.com',
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  organizationBrief: {
    id: 'org-1',
    path: 'organizations/org-1',
  },
};

describe('EditSeries component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call updateSeriesAction with the correct data on form submission', async () => {
    const updateSeriesAction = jest.fn(() => Promise.resolve({ ok: true }));

    render(
      <EditSeries series={mockSeries} editSeriesAction={updateSeriesAction} />,
    );

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Series');
    fireEvent.change(nameInput, { target: { value: 'New Series Name' } });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the action to be called
    await waitFor(() => {
      expect(updateSeriesAction).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'organizations/org-1/series/series-1',
          edits: expect.objectContaining({
            name: 'New Series Name',
          }),
        }),
      );
    });

    // Assert that the action was called with the correct data
    expect(updateSeriesAction).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'organizations/org-1/series/series-1',
        edits: expect.objectContaining({
          name: 'New Series Name',
        }),
      }),
    );
  });

  it('should display an error message if the action fails', async () => {
    const updateSeriesAction = jest.fn(() =>
      Promise.reject(new Error('Failed to save')),
    );

    render(
      <EditSeries series={mockSeries} editSeriesAction={updateSeriesAction} />,
    );

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Series');
    fireEvent.change(nameInput, { target: { value: 'New Series Name' } });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the error message to appear
    await screen.findByText('Failed to save');
  });
});
