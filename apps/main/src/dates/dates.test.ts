import { formatDateRange } from './dates';

describe('formatDateRange', () => {
  it('should return an empty string if no start date is provided', () => {
    expect(formatDateRange(undefined, undefined)).toBe('');
  });

  it('should format a single date if only a start date is provided', () => {
    const startDate = new Date('2025-01-01T12:00:00Z');
    expect(formatDateRange(startDate, undefined)).toBe('Jan 1, 2025');
  });

  it('should format a single date if the start and end dates are the same', () => {
    const startDate = new Date('2025-01-01T12:00:00Z');
    const endDate = new Date('2025-01-01T12:00:00Z');
    expect(formatDateRange(startDate, endDate)).toBe('Jan 1, 2025');
  });

  it('should format a date range if the start and end dates are different', () => {
    const startDate = new Date('2025-01-01T12:00:00Z');
    const endDate = new Date('2025-01-05T12:00:00Z');
    expect(formatDateRange(startDate, endDate)).toBe(
      'Jan 1, 2025 - Jan 5, 2025',
    );
  });

  it('should format a date range across different months', () => {
    const startDate = new Date('2025-01-25T12:00:00Z');
    const endDate = new Date('2025-02-05T12:00:00Z');
    expect(formatDateRange(startDate, endDate)).toBe(
      'Jan 25, 2025 - Feb 5, 2025',
    );
  });

  it('should format a date range across different years', () => {
    const startDate = new Date('2024-12-25T12:00:00Z');
    const endDate = new Date('2025-01-05T12:00:00Z');
    expect(formatDateRange(startDate, endDate)).toBe(
      'Dec 25, 2024 - Jan 5, 2025',
    );
  });
});
