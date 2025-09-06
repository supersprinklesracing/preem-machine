import { render, screen, fireEvent, act, waitFor } from '@/test-utils';
import React from 'react';
import { NewSeries } from './NewSeries';
import '@/matchMedia.mock';
import { FormActionResult } from '@/components/forms/forms';

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
    const newSeriesAction = jest.fn(
      (): Promise<FormActionResult<{ path?: string }>> =>
        Promise.resolve({
          type: 'success',
          message: '',
          path: 'new-series-id',
        }),
    );

    const { container } = render(
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
    const nextButton = container.querySelector('[data-direction="next"]');
    expect(nextButton).toBeInTheDocument();
    if (nextButton) {
      fireEvent.click(nextButton); // Move to August
    }

    fireEvent.click(
      screen.getAllByRole('button', { name: /Series date 1 August 2025/i })[0],
    );
    fireEvent.click(
      screen.getAllByRole('button', { name: /Series date 15 August 2025/i })[0],
    );

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

    const { container } = render(
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
    const nextButton = container.querySelector('[data-direction="next"]');
    expect(nextButton).toBeInTheDocument();
    if (nextButton) {
      fireEvent.click(nextButton); // Move to August
    }

    fireEvent.click(
      screen.getAllByRole('button', { name: /Series date 1 August 2025/i })[0],
    );
    fireEvent.click(
      screen.getAllByRole('button', { name: /Series date 15 August 2025/i })[0],
    );

    const createButton = screen.getByRole('button', { name: /create series/i });
    await waitFor(() => expect(createButton).not.toBeDisabled());

    // Click the create button
    await act(async () => {
      fireEvent.click(createButton);
      await jest.runAllTimers();
    });

    // Wait for the error message to appear
    expect(await screen.findByText('Failed to create')).toBeInTheDocument();
  });
});
