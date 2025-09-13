import { render, screen, setupMockDb } from '@/test-utils';
import NewOrganizationPage from './page';

jest.mock('./NewOrganization', () => ({
  __esModule: true,
  NewOrganization: jest.fn(() => <div>Mock NewOrganization</div>),
}));

jest.mock('./new-organization-action', () => ({
  __esModule: true,
  createOrganizationAction: jest.fn(),
}));

describe('NewOrganizationPage', () => {
  setupMockDb();
  it('should render the NewOrganization component', async () => {
    const PageComponent = await NewOrganizationPage({
      searchParams: Promise.resolve({ path: 'organizations' }),
    });
    render(PageComponent);
    expect(screen.getByText('Mock NewOrganization')).toBeInTheDocument();
  });
});
