export const MOCK_DATE = new Date('2024-01-01T00:00:00.000Z');

export function setupTimeMocking(date: Date = MOCK_DATE) {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(date);
  });

  afterEach(() => {
    jest.useRealTimers();
  });
}