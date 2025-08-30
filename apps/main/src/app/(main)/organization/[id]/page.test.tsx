import { render, screen, setupMockDb } from '@/test-utils';
import React from 'react';
import OrganizationPage from './page';
import Organization from './Organization';
import { notFound } from 'next/navigation';
import '../../../../matchMedia.mock';

// Mock dependencies
jest.mock('./Organization', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Organization</div>),
}));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

setupMockDb();

describe('OrganizationPage component', () => {
  it('should fetch organization data and render the Organization component', async () => {
    const params = { id: 'org-super-sprinkles' };
    const PageComponent = await OrganizationPage({ params });
    render(PageComponent);

    expect(screen.getByText('Mock Organization')).toBeInTheDocument();

    const orgCalls = (Organization as jest.Mock).mock.calls;
    expect(orgCalls[0][0].data.organization.id).toBe('org-super-sprinkles');
  });

  it('should call notFound when the organization does not exist', async () => {
    const params = { id: 'non-existent-org' };
    await OrganizationPage({ params });

    expect(notFound).toHaveBeenCalled();
  });
});
