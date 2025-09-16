import { render, screen, setupMockDb } from '@/test-utils';
import NewSeriesPage from './page';

jest.mock('./NewSeries', () => ({
  __esModule: true,
  NewSeries: jest.fn(() => <div>Mock NewSeries</div>),
}));

jest.mock('./new-series-action', () => ({
  __esModule: true,
  createSeriesAction: jest.fn(),
}));

describe('NewSeriesPage', () => {
  setupMockDb();

  it('should render the NewSeries component', async () => {
    const PageComponent = await NewSeriesPage({
      searchParams: Promise.resolve({
        path: 'organizations/super-sprinkles/series',
      }),
    });
    render(PageComponent);
    expect(screen.getByText('Mock NewSeries')).toBeInTheDocument();
  });
});
