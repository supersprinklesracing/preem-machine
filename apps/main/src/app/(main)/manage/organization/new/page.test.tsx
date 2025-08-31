import '@/matchMedia.mock';
import { render, screen } from '@/test-utils';
import CreateOrganizationPage from './page';

jest.mock('./CreateOrganization', () => ({
  __esModule: true,
  CreateOrganization: jest.fn(() => <div>Mock CreateOrganization</div>),
}));

jest.mock('./create-organization-action', () => ({
  __esModule: true,
  createOrganizationAction: jest.fn(),
}));

describe('CreateOrganizationPage', () => {
  it('should render the CreateOrganization component', async () => {
    const PageComponent = await CreateOrganizationPage();
    render(PageComponent);
    expect(screen.getByText('Mock CreateOrganization')).toBeInTheDocument();
  });
});
