import { render, screen } from '../test-utils';
import '@testing-library/jest-dom';
import RaceCard from './RaceCard';
import { raceSeries } from '../datastore/mock-data';

const mockEvent = raceSeries[0].events[0];
const mockRace = mockEvent.races[0];

describe('RaceCard', () => {
  it('should render the event name', () => {
    render(<RaceCard race={mockRace} event={mockEvent} />);
    expect(screen.getByText(mockEvent.name)).toBeInTheDocument();
  });

  it('should render the total prize pool', () => {
    render(<RaceCard race={mockRace} event={mockEvent} />);
    const totalPrizePool = mockRace.preems.reduce(
      (sum, preem) => sum + preem.prizePool,
      0
    );
    if (totalPrizePool > 0) {
      expect(
        screen.getByText(`${totalPrizePool.toLocaleString()}`, { exact: false })
      ).toBeInTheDocument();
    }
  });

  it('should render the number of racers', () => {
    render(<RaceCard race={mockRace} event={mockEvent} />);
    expect(
      screen.getByText(`${mockRace.currentRacers} / ${mockRace.maxRacers}`, {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it('should render the race duration', () => {
    render(<RaceCard race={mockRace} event={mockEvent} />);
    expect(screen.getByText(mockRace.duration)).toBeInTheDocument();
  });

  it('should render the number of laps', () => {
    render(<RaceCard race={mockRace} event={mockEvent} />);
    expect(screen.getByText(`${mockRace.laps} laps`)).toBeInTheDocument();
  });
});
