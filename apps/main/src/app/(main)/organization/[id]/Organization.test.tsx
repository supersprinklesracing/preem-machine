import { render, screen } from '@/test-utils';
import Organization, { OrganizationPageData } from './Organization';

const mockOrganizationData: OrganizationPageData = {
  organization: {
    id: 'org-1',
    name: 'Test Organization',
  },
  serieses: [
    {
      id: 'series-1',
      name: 'Test Series 1',
    },
    {
      id: 'series-2',
      name: 'Test Series 2',
    },
  ],
  members: [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
    {
      id: 'user-2',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    },
  ],
};

describe('Organization component', () => {
  it('renders organization details, series, and members correctly', () => {
    render(<Organization data={mockOrganizationData} />);

    expect(screen.getByText('Test Organization')).toBeInTheDocument();

    expect(screen.getByText('Test Series 1')).toBeInTheDocument();
    expect(screen.getByText('Test Series 2')).toBeInTheDocument();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument();
  });
});
