import { render, screen } from '@/test-utils';
import Organization from './Organization';

const mockOrganizationData = {
  organization: {
    id: 'org-1',
    path: 'organizations/org-1',
    name: 'Test Organization',
    description: 'This is a test organization.',
    website: 'https://example.com',
  },
  serieses: [
    {
      series: {
        id: 'series-1',
        path: 'organizations/org-1/series/series-1',
        name: 'Test Series 1',
      },
      children: [],
    },
    {
      series: {
        id: 'series-2',
        path: 'organizations/org-1/series/series-2',
        name: 'Test Series 2',
      },
      children: [],
    },
  ],
  members: [
    {
      id: 'user-1',
      path: 'users/user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
    {
      id: 'user-2',
      path: 'users/user-2',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    },
  ],
};

describe('Organization component', () => {
  it('renders organization details, series, and members correctly', () => {
    render(<Organization {...mockOrganizationData} />);

    expect(screen.getByText('Test Organization')).toBeInTheDocument();
    expect(
      screen.getByText('This is a test organization.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Official Website')).toBeInTheDocument();

    expect(screen.getByText('Test Series 1')).toBeInTheDocument();
    expect(screen.getByText('Test Series 2')).toBeInTheDocument();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
