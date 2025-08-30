import { render, screen, setupMockDb } from '@/test-utils';
import React from 'react';
import LiveEventPage from './page';
import LiveEvent from './LiveEvent';
import { notFound } from 'next/navigation';
import '../../../../../../matchMedia.mock';

// Mock dependencies
jest.mock('./LiveEvent', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock LiveEvent</div>),
}));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

setupMockDb();

describe('LiveEventPage component', () => {
  it('should fetch event data and render the LiveEvent component', async () => {
    const params = { eventId: 'event-giro-sf-2025' };
    const PageComponent = await LiveEventPage({ params });
    render(PageComponent);

    expect(screen.getByText('Mock LiveEvent')).toBeInTheDocument();

    const liveEventCalls = (LiveEvent as jest.Mock).mock.calls;
    expect(liveEventCalls[0][0].data.event.id).toBe('event-giro-sf-2025');
  });

  it('should call notFound when the event does not exist', async () => {
    const params = { eventId: 'non-existent-event' };
    await LiveEventPage({ params });

    expect(notFound).toHaveBeenCalled();
  });
});
