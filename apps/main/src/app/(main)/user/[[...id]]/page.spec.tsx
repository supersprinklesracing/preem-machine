import { render, screen } from '@/test-utils';
import UserPage from './page';
import { users } from '@/datastore/mock-data';

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  redirect: jest.fn(),
}));

describe('UserPage', () => {
  it("renders the user's name", async () => {
    const mockUser = users[0];
    const Page = await UserPage({ params: { id: [mockUser.id] } });
    render(Page);

    expect(
      screen.getByRole('heading', { name: mockUser.name })
    ).toBeInTheDocument();
  });
});
