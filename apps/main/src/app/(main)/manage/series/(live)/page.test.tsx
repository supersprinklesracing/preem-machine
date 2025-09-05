import '@/matchMedia.mock';
import { render, screen, setupMockDb } from '@/test-utils';
import LiveSeries from './LiveSeries';
import { NotFoundError } from '@/datastore/errors';
import LiveSeriesPage from './page';

// Mock dependencies
jest.mock('./LiveSeries', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock LiveSeries</div>),
}));

setupMockDb();

describe('LiveSeriesPage component', () => {
  it('should fetch series data and render the LiveSeries component', async () => {
    const searchParams = {
      path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025',
    };
    const PageComponent = await LiveSeriesPage({ searchParams });
    render(PageComponent);

    expect(screen.getByText('Mock LiveSeries')).toBeInTheDocument();

    const liveSeriesCalls = (LiveSeries as jest.Mock).mock.calls;
    expect(liveSeriesCalls[0][0].series.id).toBe('series-sprinkles-2025');
  });

  it('should throw NotFoundError when the series does not exist', async () => {
    const searchParams = { path: 'series/non-existent-series' };
    expect(LiveSeriesPage({ searchParams })).rejects.toThrow(NotFoundError);
  });
});
