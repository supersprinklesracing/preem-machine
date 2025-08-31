import '@/matchMedia.mock';
import { render, screen, setupMockDb } from '@/test-utils';
import { EditOrganization } from './EditOrganization';
import { NotFoundError } from '@/datastore/errors';
import EditOrganizationPage from './page';
import { editOrganizationAction } from './edit-organization-action';

// Mock dependencies
jest.mock('./EditOrganization', () => ({
  __esModule: true,
  EditOrganization: jest.fn(() => <div>Mock EditOrganization</div>),
}));
jest.mock('./edit-organization-action', () => ({
  editOrganizationAction: jest.fn(),
}));

describe('EditOrganizationPage component', () => {
  setupMockDb();
  it('should fetch organization data and render the EditOrganization component', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/org-super-sprinkles',
    });
    const PageComponent = await EditOrganizationPage({ searchParams });
    render(PageComponent);

    expect(screen.getByText('Mock EditOrganization')).toBeInTheDocument();

    const editOrganizationCalls = (EditOrganization as jest.Mock).mock.calls;
    expect(editOrganizationCalls[0][0].organization.id).toBe(
      'org-super-sprinkles',
    );
    expect(editOrganizationCalls[0][0].editOrganizationAction).toBe(
      editOrganizationAction,
    );
  });

  it('should throw NotFoundError when the organization does not exist', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/non-existent-org',
    });
    await expect(EditOrganizationPage({ searchParams })).rejects.toThrow(
      NotFoundError,
    );
  });
});
