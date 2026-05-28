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

  if (end && isAfter(start, end)) {
    throw new Error('End date cannot be before start date');
  }

  const format = (d: Date) => formatDateShort(d, timeZone);

  if (end && format(start) === format(end)) {
    return format(start);
  }

  if (end) {
    return `${format(start)} - ${format(end)}`;
  }

  return format(start);
}

export function toDate(
  date: Date | string | undefined | any,
): Date | undefined {
  if (!date) return undefined;
  if (
    typeof date === 'object' &&
    'toDate' in date &&
    typeof date.toDate === 'function'
  ) {
    return date.toDate();
  }
  if (typeof date === 'string') {
    return new Date(date);
  }
  return date as Date;
}

function withDate(formatString: string) {
  return (date: Date | string | undefined | any, timeZone?: string) => {
    const dateObj = toDate(date);
    if (!dateObj) return '';
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
  date: Date | string | undefined | any,
  options?: { addSuffix?: boolean },
) {
  const dateObj = toDate(date);
  if (!dateObj) return '';
  return formatDistanceToNow(dateObj, options);
}

export function compareDates(
  a: Date | string | any,
  b: Date | string | any,
  order: 'asc' | 'desc' = 'desc',
) {
  const dateA = toDate(a)?.getTime() ?? 0;
  const dateB = toDate(b)?.getTime() ?? 0;

  if (order === 'asc') {
    return dateA - dateB;
  }

  return dateB - dateA;
}

export function isDateAfter(
  date: Date | string | any,
  dateToCompare: Date | string | any,
) {
  const a = toDate(date);
  const b = toDate(dateToCompare);
  if (!a || !b) return false;
  return isAfter(a, b);
}
