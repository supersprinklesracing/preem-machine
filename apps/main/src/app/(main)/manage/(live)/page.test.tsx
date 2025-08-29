import { render, screen } from '@/test-utils';
import React from 'react';
import LiveOrganizationPage from './page';
import * as firestore from '@/datastore/firestore';
import Hub from './Hub';
import '../../../../matchMedia.mock';

// Mock dependencies
jest.mock('./Hub', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Hub</div>),
}));
jest.mock('@/datastore/firestore');

const mockHubData = {
  organizations: [{ id: 'org-1', name: 'Test Org', serieses: [] }],
};

describe('LiveOrganizationPage component', () => {
  it('should fetch hub page data and render the Hub component', async () => {
    // Mock the return value of the data fetching function
    (firestore.getHubPageData as jest.Mock).mockResolvedValue(mockHubData);

    const PageComponent = await LiveOrganizationPage();
    render(PageComponent);

    expect(screen.getByText('Mock Hub')).toBeInTheDocument();

    expect(Hub).toHaveBeenCalled();
  });
});
