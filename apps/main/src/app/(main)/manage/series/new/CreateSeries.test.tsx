import { render, screen, fireEvent, act } from '@/test-utils';
import React from 'react';
import { CreateSeries } from './CreateSeries';
import '@/matchMedia.mock';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('CreateSeries component', () => {
  it.skip('should call createSeriesAction with the correct data on form submission', async () => {
    const createSeriesAction = jest.fn(() =>
      Promise.resolve({ ok: true, seriesId: 'new-series-id' }),
    );

    render(
      <CreateSeries
        createSeriesAction={createSeriesAction}
        path="organizations/org-1"
      />,
    );

    // Fill out the form
    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'New Test Series' } });

    const locationInput = screen.getByTestId('location-input');
    fireEvent.change(locationInput, { target: { value: 'Test Location' } });

    const websiteInput = screen.getByTestId('website-input');
    fireEvent.change(websiteInput, {
      target: { value: 'https://example.com' },
    });

    const descriptionInput = screen.getByTestId('description-input');
    fireEvent.change(descriptionInput, {
      target: { value: 'This is a test series description.' },
    });

    // Select a date range
    fireEvent.click(screen.getByLabelText('Series date 1 August 2025'));
    fireEvent.click(screen.getByLabelText('Series date 15 August 2025'));

    // Click the create button
    const createButton = screen.getByRole('button', { name: /create series/i });
    fireEvent.click(createButton);

    // Wait for the action to be called
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(createSeriesAction).toHaveBeenCalledWith(
      'organizations/org-1',
      expect.objectContaining({
        name: 'New Test Series',
        location: 'Test Location',
        website: 'https://example.com',
        description: 'This is a test series description.',
      }),
    );
  });
});
