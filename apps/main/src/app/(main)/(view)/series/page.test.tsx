import React from 'react';

import { NotFoundError } from '@/datastore/errors';
import { render, screen, setupMockDb } from '@/test-utils';

import SeriesPage from './page';
import { Series } from './Series';

// Mock dependencies
jest.mock('./Series', () => ({
  __esModule: true,
  Series: jest.fn(() => <div>Mock Series</div>),
}));

setupMockDb();

describe('SeriesPage component', () => {
  it('should fetch series data and render the Series component', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/super-sprinkles/series/sprinkles-2025',
    });
    render(await SeriesPage({ searchParams }));

    expect(screen.getByText('Mock Series')).toBeInTheDocument();

    const seriesCalls = (Series as jest.Mock).mock.calls;
    expect(seriesCalls[0][0].series.id).toBe('sprinkles-2025');
  });

  it('should throw NotFoundError when the series does not exist', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/org-1/series/non-existent-series',
    });
    expect(SeriesPage({ searchParams })).rejects.toThrow(NotFoundError);
  });
});
