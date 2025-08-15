import { render, screen } from '@/test-utils';
import Page from './page';
import * as dataAccess from '@/datastore/data-access';
import { organizations, raceSeries, users } from '@/datastore/mock-data';

jest.mock('@/datastore/data-access');
const mockedDataAccess = jest.mocked(dataAccess);

describe('Organization Page', () => {
  it('should render the organization name and series', async () => {
    const mockOrg = organizations[0];
    const mockSeries = raceSeries.filter(
      (s) => s.organizationId === mockOrg.id
    );
    const mockMembers = users.filter((u) =>
      u.organizationMemberships?.some((m) => m.organizationId === mockOrg.id)
    );

    mockedDataAccess.getOrganizationById.mockResolvedValue(mockOrg);
    mockedDataAccess.getRaceSeriesForOrganization.mockResolvedValue(mockSeries);
    mockedDataAccess.getUsersByOrganizationId.mockResolvedValue(mockMembers);

    const PageComponent = await Page({ params: { id: mockOrg.id } });
    render(PageComponent);

    expect(
      screen.getByRole('heading', { level: 1, name: mockOrg.name })
    ).toBeInTheDocument();
    mockSeries.forEach((s) => {
      expect(screen.getByText(s.name)).toBeInTheDocument();
    });
  });
});
