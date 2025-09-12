import { format, formatDistanceToNow, isAfter } from 'date-fns';

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

export function formatDateUrl(value: Date): string;
export function formatDateUrl(value: Date | undefined): string | undefined;
export function formatDateUrl(value: Date | undefined) {
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
    return formatDateShort(start);
  }

  if (end) {
    return `${formatDateShort(start)} - ${formatDateShort(end)}`;
  }

  return formatDateShort(start);
}

function withDate(fn: (date: Date) => string) {
  return (date: Date | string | undefined) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return fn(dateObj);
  };
}

export const formatDateLong = withDate((date) => format(date, 'PPP'));

export const formatTime = withDate((date) => format(date, 'p'));

export const formatDateShort = withDate((date) => format(date, 'PP'));

export const formatDateTime = withDate((date) => format(date, 'PP p'));

export function formatDateRelative(
  date: Date | string | undefined,
  options?: { addSuffix?: boolean },
) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), options);
}

export function compareDates(
  a: Date | string,
  b: Date | string,
  order: 'asc' | 'desc' = 'desc',
) {
  const dateA = new Date(a).getTime();
  const dateB = new Date(b).getTime();

  if (order === 'asc') {
    return dateA - dateB;
  }

  return dateB - dateA;
}

export function isDateAfter(date: Date | string, dateToCompare: Date | string) {
  return isAfter(new Date(date), new Date(dateToCompare));
}
