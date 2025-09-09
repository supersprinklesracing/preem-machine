import * as hub_data from './hub_data';
import '@/matchMedia.mock';
import { render, screen } from '@/test-utils';
import Hub from './Hub';
import LiveOrganizationPage from './page';

// Mock dependencies
jest.mock('./Hub', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Hub</div>),
}));
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    refresh: () => {},
  }),
  useSearchParams: () => ({
    get: () => {},
  }),
}));
jest.mock('./hub_data');

const mockHubData = {
  organizations: [{ id: 'org-1', name: 'Test Org', serieses: [] }],
};

describe('LiveOrganizationPage component', () => {
  it('should fetch hub page data and render the Hub component', async () => {
    // Mock the return value of the data fetching function
    (hub_data.getHubPageData as jest.Mock).mockResolvedValue(mockHubData);

    const PageComponent = await LiveOrganizationPage();
    render(PageComponent);

    expect(screen.getByText('Mock Hub')).toBeInTheDocument();

    expect(Hub).toHaveBeenCalled();
  });
});
