import { render, screen } from '@/test-utils';

import { Hub } from './Hub';
import * as hub_data from './hub-data';
import LiveOrganizationPage from './page';

// Mock dependencies
jest.mock('./Hub', () => ({
  __esModule: true,
  Hub: jest.fn(() => <div>Mock Hub</div>),
}));

jest.mock('./hub-data');

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
