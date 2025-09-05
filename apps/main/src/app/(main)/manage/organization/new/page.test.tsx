import '@/matchMedia.mock';
import { render, screen } from '@/test-utils';
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
  it('should render the NewOrganization component', async () => {
    const PageComponent = await NewOrganizationPage();
    render(PageComponent);
    expect(screen.getByText('Mock NewOrganization')).toBeInTheDocument();
  });
});
