import { formatDateRange } from './dates';

describe('formatDateRange', () => {
  it('should format a date range with a timezone', () => {
    const startDate = new Date('2025-08-05T12:00:00.000Z');
    const endDate = new Date('2025-08-10T12:00:00.000Z');
    const timezone = 'America/New_York';
    const formatted = formatDateRange(startDate, endDate, timezone);
    expect(formatted).toContain('Aug 5, 2025');
    expect(formatted).toContain('Aug 10, 2025');
  });

  it('should format a single date with a timezone', () => {
    const startDate = new Date('2025-08-05T12:00:00.000Z');
    const timezone = 'America/Los_Angeles';
    const formatted = formatDateRange(startDate, startDate, timezone);
    expect(formatted).toContain('Aug 5, 2025');
  });

  it('should handle different timezones correctly', () => {
    const date = new Date('2025-01-01T00:00:00.000Z');
    const nyTime = formatDateRange(date, date, 'America/New_York');
    const laTime = formatDateRange(date, date, 'America/Los_Angeles');

    // These will resolve to the previous day in these timezones
    expect(nyTime).toContain('Dec 31, 2024');
    expect(laTime).toContain('Dec 31, 2024');
  });

  it('should format correctly without a timezone', () => {
    const startDate = new Date('2025-08-05T12:00:00.000Z');
    const formatted = formatDateRange(startDate, startDate);
    expect(formatted).toContain('Aug 5, 2025');
  });
});
