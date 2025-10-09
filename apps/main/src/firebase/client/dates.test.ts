import { formatDateRange } from './dates';

describe('formatDateRange', () => {
  const startDate = new Date('2025-01-01T12:00:00.000Z');
  const endDate = new Date('2025-01-02T12:00:00.000Z');
  const timezone = 'America/New_York';

  it('should format a date range correctly with a timezone', () => {
    const formatted = formatDateRange(startDate, endDate, timezone);
    expect(formatted).toBe('Jan 1, 2025 - Jan 2, 2025');
  });

  it('should format a single date correctly with a timezone', () => {
    const formatted = formatDateRange(startDate, startDate, timezone);
    expect(formatted).toBe('Jan 1, 2025');
  });

  it('should handle different timezones correctly', () => {
    const date = new Date('2025-01-01T12:00:00.000Z');
    const nyTime = formatDateRange(date, date, 'America/New_York');
    const laTime = formatDateRange(date, date, 'America/Los_Angeles');
    expect(nyTime).toBe('Jan 1, 2025');
    expect(laTime).toBe('Jan 1, 2025');
  });

  it('should format a date range correctly without a timezone', () => {
    const formatted = formatDateRange(startDate, endDate);
    expect(formatted).toBe('Jan 1, 2025 - Jan 2, 2025');
  });

  it('should format a single date correctly without a timezone', () => {
    const formatted = formatDateRange(startDate, startDate);
    expect(formatted).toBe('Jan 1, 2025');
  });

  it('should handle dates that cross day boundaries in different timezones', () => {
    const date = new Date('2025-01-01T04:00:00.000Z'); // 4AM UTC
    const nyTime = formatDateRange(date, date, 'America/New_York'); // Dec 31, 2024 11PM
    const laTime = formatDateRange(date, date, 'America/Los_Angeles'); // Dec 31, 2024 8PM
    expect(nyTime).toBe('Dec 31, 2024');
    expect(laTime).toBe('Dec 31, 2024');
  });
});
