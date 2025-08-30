import { render, screen, setupMockDb } from '@/test-utils';
import React from 'react';
import SeriesPage from './page';
import Series from './Series';
import { notFound } from 'next/navigation';
import '../../../../matchMedia.mock';

// Mock dependencies
jest.mock('./Series', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Series</div>),
}));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

setupMockDb();

describe('SeriesPage component', () => {
  it('should fetch series data and render the Series component', async () => {
    const params = { id: 'series-sprinkles-2025' };
    const PageComponent = await SeriesPage({ params });
    render(PageComponent);

    expect(screen.getByText('Mock Series')).toBeInTheDocument();

    const seriesCalls = (Series as jest.Mock).mock.calls;
    expect(seriesCalls[0][0].data.series.id).toBe('series-sprinkles-2025');
  });

  it('should call notFound when the series does not exist', async () => {
    const params = { id: 'non-existent-series' };
    await SeriesPage({ params });

    expect(notFound).toHaveBeenCalled();
  });
});
