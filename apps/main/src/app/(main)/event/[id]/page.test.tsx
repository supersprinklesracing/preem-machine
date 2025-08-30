import { render, screen, setupMockDb } from '@/test-utils';
import React from 'react';
import EventPage from './page';
import Event from './Event';
import { notFound } from 'next/navigation';
import '../../../../matchMedia.mock';

// Mock dependencies
jest.mock('./Event', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Event</div>),
}));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

setupMockDb();

describe('EventPage component', () => {
  it('should fetch event data and render the Event component', async () => {
    const params = { id: 'event-giro-sf-2025' };
    const PageComponent = await EventPage({ params });
    render(PageComponent);

    expect(screen.getByText('Mock Event')).toBeInTheDocument();

    const eventCalls = (Event as jest.Mock).mock.calls;
    expect(eventCalls[0][0].data.event.id).toBe('event-giro-sf-2025');
  });

  it('should call notFound when the event does not exist', async () => {
    const params = { id: 'non-existent-event' };
    await EventPage({ params });

    expect(notFound).toHaveBeenCalled();
  });
});
