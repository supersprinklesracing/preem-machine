import { format } from 'date-fns-tz';

export const LONG_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

export function getISODateFromDate(value: Date | null): string | undefined;
export function getISODateFromDate(value: Date | undefined): string | undefined;
export function getISODateFromDate(value: Date | null | undefined) {
  return value ? value.toISOString() : undefined;
}

export function formatDateAsYMD(value: Date): string;
export function formatDateAsYMD(value: Date | undefined): string | undefined;
export function formatDateAsYMD(value: Date | undefined) {
  return value ? format(value, 'yyyy-MM-dd') : undefined;
}

export function formatDateRange(
  startDate: Date | undefined,
  endDate: Date | undefined,
) {
  if (!startDate) {
    return '';
  }

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  if (end && start.toDateString() === end.toDateString()) {
    return format(start, 'PP');
  }

  if (end) {
    return `${format(start, 'PP')} - ${format(end, 'PP')}`;
  }

  return format(start, 'PP');
}
