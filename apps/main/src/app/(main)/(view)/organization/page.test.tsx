import { NotFoundError } from '@/datastore/errors';

import { render, screen, setupMockDb } from '@/test-utils';
import Organization from './Organization';
import OrganizationPage from './page';

// Mock dependencies
jest.mock('./Organization', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Organization</div>),
}));

setupMockDb();

describe('OrganizationPage component', () => {
  it('should fetch organization data and render the Organization component', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/org-super-sprinkles',
    });
    render(await OrganizationPage({ searchParams }));

    expect(screen.getByText('Mock Organization')).toBeInTheDocument();

    const orgCalls = (Organization as jest.Mock).mock.calls;
    expect(orgCalls[0][0].organization.id).toBe('org-super-sprinkles');
  });

  it('should throw NotFoundError when the organization does not exist', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/non-existent-org',
    });
    expect(OrganizationPage({ searchParams })).rejects.toThrow(NotFoundError);
  });
});
