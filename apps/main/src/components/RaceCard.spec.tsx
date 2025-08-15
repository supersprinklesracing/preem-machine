import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RaceCard from './RaceCard';
import { raceSeries } from '../datastore/mock-data';

const mockRace = raceSeries[0].races[0];

describe('RaceCard', () => {
  it('should render the race name', () => {
    render(
      <MantineProvider>
        <RaceCard race={mockRace} />
      </MantineProvider>
    );
    expect(screen.getByText(mockRace.name)).toBeInTheDocument();
  });

  it('should render the total prize pool', () => {
    render(
      <MantineProvider>
        <RaceCard race={mockRace} />
      </MantineProvider>
    );
    const totalPrizePool = mockRace.preems.reduce(
      (sum, preem) => sum + preem.prizePool,
      0
    );
    expect(
      screen.getByText(`${totalPrizePool.toLocaleString()}`, { exact: false })
    ).toBeInTheDocument();
  });

  it('should render the number of racers', () => {
    render(
      <MantineProvider>
        <RaceCard race={mockRace} />
      </MantineProvider>
    );
    expect(
      screen.getByText(`${mockRace.currentRacers} / ${mockRace.maxRacers}`, {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it('should render the race duration', () => {
    render(
      <MantineProvider>
        <RaceCard race={mockRace} />
      </MantineProvider>
    );
    expect(screen.getByText(mockRace.duration)).toBeInTheDocument();
  });

  it('should render the number of laps', () => {
    render(
      <MantineProvider>
        <RaceCard race={mockRace} />
      </MantineProvider>
    );
    expect(screen.getByText(`${mockRace.laps} laps`)).toBeInTheDocument();
  });
});
