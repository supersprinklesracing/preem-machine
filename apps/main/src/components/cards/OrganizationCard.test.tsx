import { render, screen } from '@/test-utils';
import OrganizationCard from './OrganizationCard';
import '@/matchMedia.mock';
import { ClientCompat, Organization } from '@/datastore/types';

const mockOrganization: ClientCompat<Organization> = {
  id: 'org-1',
  path: 'organizations/org-1',
  name: 'Test Organization',
  website: 'https://example.com',
};

describe('OrganizationCard component', () => {
  it('should render the organization name', () => {
    render(<OrganizationCard organization={mockOrganization} />);
    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });
});
