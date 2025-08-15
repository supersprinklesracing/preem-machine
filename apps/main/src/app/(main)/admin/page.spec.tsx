import { render, screen } from '@/test-utils';
import AdminPage from './page';

describe('AdminPage', () => {
  it('renders the admin page with the main heading', async () => {
    const Page = await AdminPage();
    render(Page);

    expect(
      screen.getByRole('heading', { name: 'Administrator Control Panel' })
    ).toBeInTheDocument();
  });
});
