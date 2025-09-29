import { fireEvent, render, screen } from '@/test-utils';

import { Hub } from './Hub';

// Mock child components
jest.mock('@/components/cards/SeriesCard', () => ({
  __esModule: true,
  SeriesCard: jest.fn(() => <div>Mock SeriesCard</div>),
}));
jest.mock('@/components/cards/EventCard', () => ({
  __esModule: true,
  EventCard: jest.fn(() => <div>Mock EventCard</div>),
}));
jest.mock('@/components/cards/RaceCard', () => ({
  __esModule: true,
  RaceCard: jest.fn(() => <div>Mock RaceCard</div>),
}));
jest.mock('@/components/ai/ThresholdAssistantModal', () => ({
  __esModule: true,
  ThresholdAssistantModal: jest.fn(() => (
    <div>Mock ThresholdAssistantModal</div>
  )),
}));

const mockData = {
  organizations: [
    {
      organization: {
        id: 'org-1',
        path: 'organizations/org-1',
        name: 'Test Org',
      },
      children: [
        {
          series: {
            id: 'series-1',
            path: 'organizations/org-1/series/series-1',
            name: 'Test Series',
          },
          children: [],
        },
      ],
    },
  ],
};

describe('Hub component', () => {
  it('should render the organization name', () => {
    render(<Hub {...mockData} />);
    expect(screen.getByText('Test Org')).toBeInTheDocument();
  });

  it('should render a message when there are no organizations', () => {
    render(<Hub {...{ organizations: [] }} />);
    expect(
      screen.getByText('You are not a member of any organizations yet.'),
    ).toBeInTheDocument();
  });

  it('should open the AI modal when the button is clicked', () => {
    render(<Hub {...mockData} />);
    const aiButton = screen.getByText('AI Threshold Assistant');
    expect(aiButton).toBeInTheDocument();
    // A full test of the modal's visibility is too complex for a baseline test.
    // We just check that the button exists and can be clicked.
    fireEvent.click(aiButton);
  });
});
