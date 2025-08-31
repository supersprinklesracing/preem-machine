import { render, screen } from '@/test-utils';
import CreateSeriesPage from './page';
import '@/matchMedia.mock';

jest.mock('./CreateSeries', () => ({
  __esModule: true,
  CreateSeries: jest.fn(() => <div>Mock CreateSeries</div>),
}));

jest.mock('./create-series-action', () => ({
  __esModule: true,
  createSeriesAction: jest.fn(),
}));

describe('CreateSeriesPage', () => {
  it('should render the CreateSeries component', async () => {
    const PageComponent = await CreateSeriesPage({
      searchParams: { path: 'organizations/org-1' },
    });
    render(PageComponent);
    expect(screen.getByText('Mock CreateSeries')).toBeInTheDocument();
  });
});
