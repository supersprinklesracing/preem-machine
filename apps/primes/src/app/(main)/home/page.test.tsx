import * as firestore from '@/datastore/server/query/query';
import { render, screen } from '@/test-utils';

import { Home } from './Home';
import Page from './page';

// Mock dependencies
jest.mock('./Home', () => ({
  __esModule: true,
  Home: jest.fn(() => <div>Mock Home</div>),
}));
jest.mock('@/datastore/server/query/query');

const mockHomeData = {
  upcomingEvents: [],
  contributions: [],
};

describe('Page component', () => {
  it('should fetch home page data and render the Home component', async () => {
    // Mock the return value of the data fetching function
    (firestore.getRenderableHomeDataForPage as jest.Mock).mockResolvedValue(
      mockHomeData,
    );

    const PageComponent = await Page();
    render(PageComponent);

    expect(screen.getByText('Mock Home')).toBeInTheDocument();

    expect(Home).toHaveBeenCalled();
  });
});
