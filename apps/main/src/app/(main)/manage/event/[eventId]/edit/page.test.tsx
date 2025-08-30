import { render, screen, setupMockDb } from '@/test-utils';
import React from 'react';
import EditEventPage from './page';
import { EditEvent } from './EditEvent';
import { notFound } from 'next/navigation';
import { updateEventAction } from './update-event-action';
import '../../../../../../matchMedia.mock';

// Mock dependencies
jest.mock('./EditEvent', () => ({
  __esModule: true,
  EditEvent: jest.fn(() => <div>Mock EditEvent</div>),
}));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));
jest.mock('./update-event-action', () => ({
  updateEventAction: jest.fn(),
}));

setupMockDb();

describe('EditEventPage component', () => {
  it('should fetch event data and render the EditEvent component', async () => {
    const params = { eventId: 'event-giro-sf-2025' };
    const PageComponent = await EditEventPage({ params });
    render(PageComponent);

    expect(screen.getByText('Mock EditEvent')).toBeInTheDocument();

    const editEventCalls = (EditEvent as jest.Mock).mock.calls;
    expect(editEventCalls[0][0].event.id).toBe('event-giro-sf-2025');
    expect(editEventCalls[0][0].updateEventAction).toBe(updateEventAction);
  });

  it('should call notFound when the event does not exist', async () => {
    const params = { eventId: 'non-existent-event' };
    await EditEventPage({ params });

    expect(notFound).toHaveBeenCalled();
  });
});
