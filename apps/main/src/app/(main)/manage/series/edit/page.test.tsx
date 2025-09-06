import '@/matchMedia.mock';
import { render, screen, setupMockDb } from '@/test-utils';
import { EditSeries } from './EditSeries';
import EditSeriesPage from './page';
import { NotFoundError } from '@/datastore/errors';

// Mock dependencies
jest.mock('./EditSeries', () => ({
  __esModule: true,
  EditSeries: jest.fn(() => <div>Mock EditSeries</div>),
}));
jest.mock('./edit-series-action', () => ({
  editSeriesAction: jest.fn(),
}));

setupMockDb();

describe('EditSeriesPage component', () => {
  it('should fetch series data and render the EditSeries component', async () => {
    const searchParams = {
      path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025',
    };
    const PageComponent = await EditSeriesPage({ searchParams });
    render(PageComponent);

    expect(screen.getByText('Mock EditSeries')).toBeInTheDocument();

    const editSeriesCalls = (EditSeries as jest.Mock).mock.calls;
    expect(editSeriesCalls[0][0].series.id).toBe('series-sprinkles-2025');
    expect(editSeriesCalls[0][0].newEventAction).toBeDefined();
  });

  it('should throw NotFoundError when the series does not exist', async () => {
    const searchParams = {
      path: 'organizations/org-super-sprinkles/series/non-existent-series',
    };
    expect(EditSeriesPage({ searchParams })).rejects.toThrow(NotFoundError);
  });
});
