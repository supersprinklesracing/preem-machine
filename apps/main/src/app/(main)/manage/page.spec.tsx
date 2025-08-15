import { render, screen } from '@/test-utils';
import ManagePage from './page';

describe('ManagePage', () => {
  it('renders the manage page with the main heading', async () => {
    const Page = await ManagePage();
    render(Page);

    expect(
      screen.getByRole('heading', { name: 'Organizer Hub' })
    ).toBeInTheDocument();
  });
});
