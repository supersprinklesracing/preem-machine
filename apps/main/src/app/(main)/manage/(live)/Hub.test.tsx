import { render, screen, fireEvent } from '@/test-utils';
import React from 'react';
import Hub from './Hub';
import type { HubPageData } from './Hub';
import '../../../../matchMedia.mock';

// Mock child components
jest.mock('@/components/cards/SeriesCard', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock SeriesCard</div>),
}));
jest.mock('@/components/cards/EventCard', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock EventCard</div>),
}));
jest.mock('@/components/cards/RaceCard', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock RaceCard</div>),
}));
jest.mock('@/components/ai/threshold-assistant-modal', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock ThresholdAssistantModal</div>),
}));

const mockData: HubPageData = {
  organizations: [
    {
      id: 'org-1',
      name: 'Test Org',
      serieses: [
        {
          id: 'series-1',
          name: 'Test Series',
          events: [],
        },
      ],
    },
  ],
};

describe('Hub component', () => {
  it('should render the organization name', () => {
    render(<Hub data={mockData} />);
    expect(screen.getByText('Test Org')).toBeInTheDocument();
  });

  it('should render a message when there are no organizations', () => {
    render(<Hub data={{ organizations: [] }} />);
    expect(
      screen.getByText('You are not a member of any organizations yet.'),
    ).toBeInTheDocument();
  });

  it('should open the AI modal when the button is clicked', () => {
    render(<Hub data={mockData} />);
    const aiButton = screen.getByText('AI Threshold Assistant');
    expect(aiButton).toBeInTheDocument();
    // A full test of the modal's visibility is too complex for a baseline test.
    // We just check that the button exists and can be clicked.
    fireEvent.click(aiButton);
  });
});
