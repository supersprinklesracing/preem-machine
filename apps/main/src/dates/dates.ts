import { format, formatDistanceToNow, isAfter } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

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
  timeZone?: string,
) {
  if (!startDate) {
    return '';
  }

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  const format = (d: Date) => formatDateShort(d, timeZone);

  if (end && format(start) === format(end)) {
    return format(start);
  }

  if (end) {
    return `${format(start)} - ${format(end)}`;
  }

  return format(start);
}

function withDate(formatString: string) {
  return (date: Date | string | undefined, timeZone?: string) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (timeZone) {
      return formatInTimeZone(dateObj, timeZone, formatString);
    }
    return format(dateObj, formatString);
  };
}

export const formatDateLong = withDate('PPP');

export const formatTime = withDate('p');

export const formatDateShort = withDate('PP');

export const formatDateTime = withDate('PP p');

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
