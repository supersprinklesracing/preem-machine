import '@/matchMedia.mock';
import { render, screen, setupMockDb } from '@/test-utils';
import { NotFoundError } from '@/datastore/errors';
import LiveOrganization from './LiveOrganization';
import LiveOrganizationPage from './page';

// Mock dependencies
jest.mock('./LiveOrganization', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock LiveOrganization</div>),
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

setupMockDb();

describe('LiveOrganizationPage component', () => {
  it('should fetch organization data and render the LiveOrganization component', async () => {
    const searchParams = { path: 'organizations/org-super-sprinkles' };
    const PageComponent = await LiveOrganizationPage({
      searchParams,
    });
    render(PageComponent);

    expect(screen.getByText('Mock LiveOrganization')).toBeInTheDocument();

    const liveOrganizationCalls = (LiveOrganization as jest.Mock).mock.calls;
    expect(liveOrganizationCalls[0][0].organization.id).toBe(
      'org-super-sprinkles',
    );
  });

  it('should throw NotFoundError when the organization does not exist', async () => {
    const searchParams = { path: 'organizations/non-existent-organization' };
    expect(LiveOrganizationPage({ searchParams })).rejects.toThrow(
      NotFoundError,
    );
  });
});
