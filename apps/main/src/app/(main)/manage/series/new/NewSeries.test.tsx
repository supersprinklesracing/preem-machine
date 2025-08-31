import { render, screen, fireEvent, act } from '@/test-utils';
import React from 'react';
import { NewSeries } from './NewSeries';
import '@/matchMedia.mock';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

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
    const newSeriesAction = jest.fn(() =>
      Promise.resolve({ path: 'new-series-id' }),
    );

    render(
      <NewSeries
        newSeriesAction={newSeriesAction}
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
    const nextButton = document.querySelector('[data-direction="next"]');
    if (!nextButton) {
      throw new Error('Next month button not found');
    }
    fireEvent.click(nextButton);

    fireEvent.click(
      screen.getAllByRole('button', { name: /Series date 1 August 2025/i })[0],
    );
    fireEvent.click(
      screen.getAllByRole('button', { name: /Series date 15 August 2025/i })[0],
    );

    // Click the create button
    const createButton = screen.getByRole('button', { name: /create series/i });
    fireEvent.click(createButton);

    // Wait for the action to be called
    await act(async () => {
      jest.runAllTimers();
    });

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
    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'New Test Series' } });

    const descriptionInput = screen.getByTestId('description-input');
    fireEvent.change(descriptionInput, {
      target: { value: 'This is a test series description.' },
    });

    // Select a date range
    const nextButton = document.querySelector('[data-direction="next"]');
    if (!nextButton) {
      throw new Error('Next month button not found');
    }
    fireEvent.click(nextButton);

    fireEvent.click(
      screen.getAllByRole('button', { name: /Series date 1 August 2025/i })[0],
    );
    fireEvent.click(
      screen.getAllByRole('button', { name: /Series date 15 August 2025/i })[0],
    );

    // Click the create button
    const createButton = screen.getByRole('button', { name: /create series/i });
    fireEvent.click(createButton);

    // Wait for the error message to appear
    await screen.findByText('Failed to create');
  });
});
