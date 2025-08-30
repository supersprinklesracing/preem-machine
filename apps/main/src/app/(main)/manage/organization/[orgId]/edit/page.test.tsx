import { render, screen } from '@/test-utils';
import React from 'react';
import EditOrganizationPage from './page';
import * as dataAccess from '@/app/shared/data-access/organizations';
import { EditOrganization } from './EditOrganization';
import { notFound } from 'next/navigation';
import { updateOrganizationAction } from './update-organization-action';
import '../../../../../../matchMedia.mock';

// Mock dependencies
jest.mock('./EditOrganization', () => ({
  __esModule: true,
  EditOrganization: jest.fn(() => <div>Mock EditOrganization</div>),
}));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));
jest.mock('./update-organization-action', () => ({
  updateOrganizationAction: jest.fn(),
}));
jest.mock('@/app/shared/data-access/organizations');

const mockOrganization = { id: 'org-1', name: 'Test Org' };

describe('EditOrganizationPage component', () => {
  beforeEach(() => {
    (
      dataAccess.getOrganizationAndRefreshStripeAccount as jest.Mock
    ).mockClear();
    (notFound as jest.Mock).mockClear();
  });

  it('should fetch organization data and render the EditOrganization component', async () => {
    // Mock the return value of the data fetching function
    (
      dataAccess.getOrganizationAndRefreshStripeAccount as jest.Mock
    ).mockResolvedValue({ organization: mockOrganization, error: undefined });

    const params = { orgId: 'org-1' };
    const PageComponent = await EditOrganizationPage({ params });
    render(PageComponent);

    expect(screen.getByText('Mock EditOrganization')).toBeInTheDocument();

    const editOrgCalls = (EditOrganization as jest.Mock).mock.calls;
    expect(editOrgCalls[0][0].organization.id).toBe('org-1');
    expect(editOrgCalls[0][0].updateOrganizationAction).toBe(
      updateOrganizationAction,
    );
  });

  it('should call notFound when the organization does not exist', async () => {
    // Mock the return value of the data fetching function
    (
      dataAccess.getOrganizationAndRefreshStripeAccount as jest.Mock
    ).mockResolvedValue({ organization: null, error: 'Not found' });

    const params = { orgId: 'non-existent-org' };
    await EditOrganizationPage({ params });

    expect(notFound).toHaveBeenCalled();
  });
});
