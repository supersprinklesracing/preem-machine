import userEvent from '@testing-library/user-event';

import { Series } from '@/datastore/schema';
import { act, render, screen, setupTimeMocking,waitFor } from '@/test-utils';

import { EditSeries } from './EditSeries';

const mockSeries: Series = {
  id: 'series-1',
  path: 'organizations/org-1/series/series-1',
  name: 'Test Series',
  description: 'This is a test series description.',
  location: 'Test Location',
  website: 'https://example.com',
  startDate: new Date(),
  endDate: new Date(),
  timezone: 'America/New_York',
  organizationBrief: {
    id: 'org-1',
    path: 'organizations/org-1',
    name: 'Test Org',
  },
};

describe('EditSeries component', () => {
  setupTimeMocking();

  it('should call editSeriesAction with the correct data on form submission', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const newEventAction = jest.fn(() => Promise.resolve({ path: '' }));
    const editSeriesAction = jest.fn(() => Promise.resolve({}));

    render(
      <EditSeries
        series={mockSeries}
        newEventAction={newEventAction}
        editSeriesAction={editSeriesAction}
      />,
    );

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Series');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Series Name');

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    // Wait for the action to be called
    await waitFor(() => {
      expect(editSeriesAction).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'organizations/org-1/series/series-1',
          edits: expect.objectContaining({
            name: 'New Series Name',
            timezone: 'America/New_York',
          }),
        }),
      );
    });
  });

  it('should display an error message if the action fails', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const newEventAction = jest.fn(() => Promise.resolve({ path: '' }));
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
    await user.clear(nameInput);
    await user.type(nameInput, 'New Series Name');

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    // Wait for the error message to appear
    await screen.findByText('Failed to save');
  });
});
