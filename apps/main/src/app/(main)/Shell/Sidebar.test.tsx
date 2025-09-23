import { fireEvent, render, screen } from '@/test-utils';
import Sidebar from './Sidebar';
import { Event } from '@/datastore/schema';

const mockData: { events: Event[] } = {
  events: [
    {
      id: 'event-1',
      path: 'organizations/org-1/series/series-1/events/event-1',
      name: 'Test Event 1',
      start_date: new Date(),
      end_date: new Date(),
      description: '',
      image_url: '',
      instagram_url: '',
    },
    {
      id: 'event-2',
      path: 'organizations/org-1/series/series-1/events/event-2',
      name: 'Test Event 2',
      start_date: new Date(),
      end_date: new Date(),
      description: '',
      image_url: '',
      instagram_url: '',
    },
  ],
};

describe('Sidebar component', () => {
  it('should render event links', () => {
    render(<Sidebar {...mockData} />);
    expect(
      screen.getByRole('link', { name: 'Test Event 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Test Event 2' }),
    ).toBeInTheDocument();
  });

  it('should call onLinkClick when a link is clicked', () => {
    const onLinkClick = jest.fn();
    render(<Sidebar {...mockData} onLinkClick={onLinkClick} />);

    fireEvent.click(screen.getByRole('link', { name: 'Test Event 1' }));

    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });
});
