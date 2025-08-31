import { render, screen } from '@/test-utils';
import NewSeriesPage from './page';
import '@/matchMedia.mock';

jest.mock('./NewSeries', () => ({
  __esModule: true,
  NewSeries: jest.fn(() => <div>Mock NewSeries</div>),
}));

jest.mock('./new-series-action', () => ({
  __esModule: true,
  createSeriesAction: jest.fn(),
}));

describe('NewSeriesPage', () => {
  it('should render the NewSeries component', async () => {
    const PageComponent = await NewSeriesPage({
      searchParams: { path: 'organizations/org-1/series' },
    });
    render(PageComponent);
    expect(screen.getByText('Mock NewSeries')).toBeInTheDocument();
  });
});
