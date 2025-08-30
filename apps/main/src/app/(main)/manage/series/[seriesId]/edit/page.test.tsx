import { render, screen } from '@/test-utils';
import React from 'react';
import EditSeriesPage from './page';
import * as firestore from '@/datastore/firestore';
import { EditSeries } from './EditSeries';
import { notFound } from 'next/navigation';
import '../../../../../../matchMedia.mock';

// Mock dependencies
jest.mock('./EditSeries', () => ({
  __esModule: true,
  EditSeries: jest.fn(() => <div>Mock EditSeries</div>),
}));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));
jest.mock('./update-series-action', () => ({
  updateSeriesAction: jest.fn(),
}));
jest.mock('@/datastore/firestore');

const mockSeries = {
  id: 'series-1',
  name: 'Test Series',
};

describe('EditSeriesPage component', () => {
  beforeEach(() => {
    (firestore.getSeriesById as jest.Mock).mockClear();
    (notFound as jest.Mock).mockClear();
  });

  it('should fetch series data and render the EditSeries component', async () => {
    // Mock the return value of the data fetching function
    (firestore.getSeriesById as jest.Mock).mockResolvedValue(mockSeries);

    const params = { seriesId: 'series-1' };
    const PageComponent = await EditSeriesPage({ params });
    render(PageComponent);

    expect(screen.getByText('Mock EditSeries')).toBeInTheDocument();

    const editSeriesCalls = (EditSeries as jest.Mock).mock.calls;
    expect(editSeriesCalls[0][0].series.id).toBe('series-1');
  });

  it('should call notFound when the series does not exist', async () => {
    // Mock the return value of the data fetching function
    (firestore.getSeriesById as jest.Mock).mockResolvedValue(null);

    const params = { seriesId: 'non-existent-series' };
    await EditSeriesPage({ params });

    expect(notFound).toHaveBeenCalled();
  });
});
